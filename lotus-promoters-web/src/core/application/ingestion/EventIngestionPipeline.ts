import {
  EventSource,
  ImportedEvent,
  ImportedEventStatus,
  IngestionRun,
  ExtractedEventDraft,
} from "@/core/domain/ingestion";
import { IEventIngestionAdapter } from "./EventIngestionAdapter";
import { eventNormalizer } from "./EventNormalizer";
import { venueResolver } from "./VenueResolver";
import { organizerResolver } from "./OrganizerResolver";
import { eventDeduplicationService } from "./EventDeduplicationService";
import { Venue } from "@/core/domain/venue";
import { Organization } from "@/core/domain/organization";
import { LotusEvent } from "@/core/domain/event";

export class EventIngestionPipeline {
  /**
   * Runs end-to-end ingestion for a single EventSource
   */
  async runSource(
    source: EventSource,
    adapter: IEventIngestionAdapter,
    existingImported: ImportedEvent[] = [],
    existingEvents: LotusEvent[] = [],
    existingVenues: Venue[] = [],
    existingOrgs: Organization[] = []
  ): Promise<{ run: IngestionRun; processedEvents: ImportedEvent[] }> {
    const startedAt = new Date().toISOString();
    const runId = `run_${source.id}_${Date.now()}`;
    const startTime = Date.now();

    const run: IngestionRun = {
      id: runId,
      source_id: source.id,
      source_name: source.name,
      status: "RUNNING",
      started_at: startedAt,
      discovered_count: 0,
      new_count: 0,
      updated_count: 0,
      duplicate_count: 0,
      review_count: 0,
      error_count: 0,
      errors: [],
    };

    const processedEvents: ImportedEvent[] = [];

    try {
      // 1. Fetch raw items via adapter
      const rawEvents = await adapter.fetchRawEvents(source);
      run.discovered_count = rawEvents.length;

      // 2. Process each raw event
      for (const raw of rawEvents) {
        try {
          // Parse raw to draft
          const draft = await adapter.parseEvent(raw, source);

          // Check for existing imported event with same source + external_id (Idempotency)
          const existing = existingImported.find(
            (e) => e.source_id === source.id && e.external_id === raw.external_id
          );

          if (existing) {
            // Check if draft changed
            const isChanged = this.hasDraftChanged(existing.extracted_data, draft);

            if (!isChanged && draft.status !== "CANCELLED") {
              // Idempotent hit: just update last_seen_at
              existing.last_seen_at = new Date().toISOString();
              processedEvents.push(existing);
              continue;
            }

            // If cancelled, update status
            if (draft.status === "CANCELLED") {
              existing.status = "CANCELLED";
              existing.updated_at = new Date().toISOString();
              existing.last_seen_at = new Date().toISOString();
              run.updated_count++;
              processedEvents.push(existing);
              continue;
            }

            // If fields changed, record conflicts/changes
            existing.conflicting_fields = this.detectConflicts(existing.extracted_data, draft, source.id);
            existing.extracted_data = draft;
            existing.normalized_event = eventNormalizer.normalize(draft);
            existing.updated_at = new Date().toISOString();
            existing.last_seen_at = new Date().toISOString();
            run.updated_count++;
            processedEvents.push(existing);
            continue;
          }

          // 3. New Event Process: Normalize
          const normalized = eventNormalizer.normalize(draft);

          // 4. Resolve Venue
          const venueResolution = venueResolver.resolve(
            draft.venue_name,
            draft.address,
            draft.city,
            draft.coordenadas,
            existingVenues
          );
          if (venueResolution.resolved) {
            normalized.venue_id = venueResolution.venue_id;
            normalized.venue_name = venueResolution.venue_name;
            normalized.location = venueResolution.city;
            normalized.coordenadas = venueResolution.coordenadas;
          }

          // 5. Resolve Organizer
          const orgResolution = organizerResolver.resolve(
            draft.organizer_name,
            existingOrgs
          );
          if (orgResolution.resolved && orgResolution.organization_id) {
            normalized.organization_id = orgResolution.organization_id;
          }

          // 6. Deduplicate against existing imported events and published Lotus events
          const deduplication = eventDeduplicationService.evaluate(draft, [
            ...existingEvents,
            ...existingImported,
            ...processedEvents,
          ]);

          // 7. Compute Quality Confidence Score
          const confidenceScore = this.computeConfidenceScore(
            source,
            draft,
            venueResolution,
            deduplication
          );

          // 8. Determine Initial Status
          let status: ImportedEventStatus = "NEEDS_REVIEW";
          if (draft.status === "CANCELLED") {
            status = "CANCELLED";
          } else if (deduplication.is_duplicate) {
            status = "DUPLICATE";
            run.duplicate_count++;
          } else {
            run.new_count++;
            run.review_count++;
          }

          const importedDoc: ImportedEvent = {
            id: `imp_${source.id}_${raw.external_id.replace(/[^a-zA-Z0-9_-]/g, "_")}`,
            source_id: source.id,
            source_name: source.name,
            source_url: raw.source_url,
            external_id: raw.external_id,
            status,
            confidence_score: confidenceScore,
            raw_data: raw,
            extracted_data: draft,
            normalized_event: normalized,
            venue_resolution: venueResolution,
            organizer_resolution: orgResolution,
            deduplication,
            claim_status: "UNCLAIMED",
            first_discovered_at: new Date().toISOString(),
            last_seen_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          processedEvents.push(importedDoc);
        } catch (eventErr: unknown) {
          run.error_count++;
          run.errors.push({
            external_id: raw.external_id,
            error: eventErr instanceof Error ? eventErr.message : "Erro no processamento do evento",
            timestamp: new Date().toISOString(),
          });
        }
      }

      run.status = run.error_count === 0 ? "SUCCESS" : run.new_count > 0 ? "PARTIAL" : "FAILED";
      run.finished_at = new Date().toISOString();
      run.duration_ms = Date.now() - startTime;

      return { run, processedEvents };
    } catch (err: unknown) {
      run.status = "FAILED";
      run.finished_at = new Date().toISOString();
      run.duration_ms = Date.now() - startTime;
      run.errors.push({
        error: err instanceof Error ? err.message : "Falha geral na execução da fonte",
        timestamp: new Date().toISOString(),
      });
      return { run, processedEvents };
    }
  }

  private computeConfidenceScore(
    source: EventSource,
    draft: ExtractedEventDraft,
    venueResolution: { resolved: boolean; match_score: number },
    deduplication: { is_duplicate: boolean }
  ): number {
    let score = source.trust_level * 0.4; // Base trust from source (0 to 0.4)

    // Completeness of core fields
    if (draft.title && draft.title.length > 3) score += 0.2;
    if (draft.start_date) score += 0.15;
    if (venueResolution.resolved) {
      score += 0.15;
    } else if (draft.venue_name) {
      score += 0.08;
    }

    if (draft.ticket_url || draft.is_free) score += 0.05;
    if (draft.image_url) score += 0.05;

    if (deduplication.is_duplicate) {
      score *= 0.5; // Penalize if duplicate
    }

    return parseFloat(Math.min(1.0, Math.max(0.1, score)).toFixed(2));
  }

  private hasDraftChanged(oldDraft: ExtractedEventDraft, newDraft: ExtractedEventDraft): boolean {
    return (
      oldDraft.title !== newDraft.title ||
      oldDraft.start_date !== newDraft.start_date ||
      oldDraft.end_date !== newDraft.end_date ||
      oldDraft.venue_name !== newDraft.venue_name ||
      oldDraft.price_min !== newDraft.price_min ||
      oldDraft.status !== newDraft.status
    );
  }

  private detectConflicts(
    oldDraft: ExtractedEventDraft,
    newDraft: ExtractedEventDraft,
    sourceId: string
  ): Record<string, { current_value: unknown; incoming_value: unknown; source_id: string; detected_at: string }> {
    const conflicts: Record<string, { current_value: unknown; incoming_value: unknown; source_id: string; detected_at: string }> = {};
    const now = new Date().toISOString();

    if (oldDraft.start_date !== newDraft.start_date) {
      conflicts["start_date"] = {
        current_value: oldDraft.start_date,
        incoming_value: newDraft.start_date,
        source_id: sourceId,
        detected_at: now,
      };
    }
    if (oldDraft.venue_name !== newDraft.venue_name) {
      conflicts["venue_name"] = {
        current_value: oldDraft.venue_name,
        incoming_value: newDraft.venue_name,
        source_id: sourceId,
        detected_at: now,
      };
    }

    return conflicts;
  }
}

export const eventIngestionPipeline = new EventIngestionPipeline();
