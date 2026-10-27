import { NextRequest, NextResponse } from "next/server";
import { firestoreIngestionRepository } from "@/infrastructure/firebase/FirestoreIngestionRepository";
import { firestoreEventRepository } from "@/infrastructure/firebase/FirestoreEventRepository";
import { firestoreVenueRepository } from "@/infrastructure/firebase/FirestoreVenueRepository";
import { firestoreOrganizationRepository } from "@/infrastructure/firebase/FirestoreOrganizationRepository";
import { eventIngestionPipeline } from "@/core/application/ingestion/EventIngestionPipeline";
import { IcalFeedAdapter } from "@/core/application/ingestion/adapters/IcalFeedAdapter";
import { JsonLdEventAdapter } from "@/core/application/ingestion/adapters/JsonLdEventAdapter";
import { EventSource } from "@/core/domain/ingestion";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { sourceId, customSource } = body;

    let sourcesToRun: EventSource[] = [];

    if (customSource) {
      sourcesToRun = [customSource];
    } else if (sourceId) {
      const src = await firestoreIngestionRepository.getSourceById(sourceId);
      if (src) sourcesToRun = [src];
    } else {
      sourcesToRun = await firestoreIngestionRepository.getActiveSources();
    }

    if (sourcesToRun.length === 0) {
      // Create initial default Porto cultural feed source if none exist
      const defaultPortoSource: EventSource = {
        id: "source_porto_cultura_ical",
        name: "Agenda Cultural Porto & Recintos (iCal/ICS)",
        type: "ICAL",
        domain: "cultura.porto.pt",
        url: "https://cultura.porto.pt/events.ics",
        ingestion_method: "cron",
        status: "ACTIVE",
        priority: 70,
        trust_level: 0.85,
        city: "Porto",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      sourcesToRun = [defaultPortoSource];
    }

    const icalAdapter = new IcalFeedAdapter();
    const jsonLdAdapter = new JsonLdEventAdapter();

    // Fetch context for resolution and deduplication
    const existingEvents = await firestoreEventRepository.getEventsByOrganization("all").catch(() => []);
    const existingVenues = await firestoreVenueRepository.getVenuesByOrganization("all").catch(() => []);
    const existingOrgs = await firestoreOrganizationRepository.getUserOrganizations("system").catch(() => []);
    const existingImported = await firestoreIngestionRepository.getImportedEvents().catch(() => []);

    const runsSummary = [];

    for (const source of sourcesToRun) {
      const adapter = source.type === "STRUCTURED_WEB" ? jsonLdAdapter : icalAdapter;

      const { run, processedEvents } = await eventIngestionPipeline.runSource(
        source,
        adapter,
        existingImported,
        existingEvents,
        existingVenues,
        existingOrgs
      );

      // Save batch of imported events
      await firestoreIngestionRepository.saveImportedEventsBatch(processedEvents);

      // Save Ingestion Run observability record
      await firestoreIngestionRepository.saveIngestionRun(run);

      // Update last sync on source
      source.last_sync_at = new Date().toISOString();
      await firestoreIngestionRepository.saveSource(source).catch(() => {});

      runsSummary.push(run);
    }

    return NextResponse.json({
      success: true,
      runs: runsSummary,
    });
  } catch (error: unknown) {
    console.error("API /api/ingestion/run error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao executar ingestão",
      },
      { status: 500 }
    );
  }
}
