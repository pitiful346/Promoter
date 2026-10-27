import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { IIngestionRepository } from "@/core/application/repositories";
import {
  EventSource,
  ImportedEvent,
  ImportedEventStatus,
  IngestionRun,
} from "@/core/domain/ingestion";
import { LotusEvent } from "@/core/domain/event";

export class FirestoreIngestionRepository implements IIngestionRepository {
  private sourcesCollection = "event_sources";
  private importedEventsCollection = "imported_events";
  private runsCollection = "ingestion_runs";
  private eventsCollection = "events";

  async getActiveSources(): Promise<EventSource[]> {
    try {
      const q = query(
        collection(db, this.sourcesCollection),
        where("status", "==", "ACTIVE")
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => this.mapDocToSource(d.id, d.data()));
    } catch {
      return [];
    }
  }

  async getSourceById(id: string): Promise<EventSource | null> {
    const snap = await getDoc(doc(db, this.sourcesCollection, id));
    if (!snap.exists()) return null;
    return this.mapDocToSource(snap.id, snap.data());
  }

  async saveSource(source: EventSource): Promise<void> {
    await setDoc(doc(db, this.sourcesCollection, source.id), {
      ...source,
      updated_at: Timestamp.now(),
    });
  }

  async getImportedEvents(filters?: {
    status?: ImportedEventStatus;
    source_id?: string;
    city?: string;
  }): Promise<ImportedEvent[]> {
    try {
      const constraints = [];
      if (filters?.status) {
        constraints.push(where("status", "==", filters.status));
      }
      if (filters?.source_id) {
        constraints.push(where("source_id", "==", filters.source_id));
      }

      const q = query(
        collection(db, this.importedEventsCollection),
        ...constraints
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => this.mapDocToImportedEvent(d.id, d.data()));

      if (filters?.city) {
        return list.filter(
          (item) => item.normalized_event.location?.toLowerCase() === filters.city!.toLowerCase()
        );
      }
      return list;
    } catch {
      return [];
    }
  }

  async getImportedEventById(id: string): Promise<ImportedEvent | null> {
    const snap = await getDoc(doc(db, this.importedEventsCollection, id));
    if (!snap.exists()) return null;
    return this.mapDocToImportedEvent(snap.id, snap.data());
  }

  async saveImportedEvent(event: ImportedEvent): Promise<void> {
    await setDoc(doc(db, this.importedEventsCollection, event.id), {
      ...event,
      updated_at: Timestamp.now(),
    });
  }

  async saveImportedEventsBatch(events: ImportedEvent[]): Promise<void> {
    if (events.length === 0) return;

    // Firestore batch limit is 500 operations
    for (let i = 0; i < events.length; i += 400) {
      const chunk = events.slice(i, i + 400);
      const batch = writeBatch(db);

      for (const ev of chunk) {
        const ref = doc(db, this.importedEventsCollection, ev.id);
        batch.set(ref, {
          ...ev,
          updated_at: Timestamp.now(),
        });
      }

      await batch.commit();
    }
  }

  async approveImportedEvent(
    id: string,
    targetOrgId: string,
    reviewedByUserId: string
  ): Promise<LotusEvent> {
    const imported = await this.getImportedEventById(id);
    if (!imported) {
      throw new Error(`Imported event ${id} not found`);
    }

    const now = Timestamp.now();
    const eventData = imported.normalized_event;

    // 1. Create published/approved event in 'events' collection
    const eventRef = await addDoc(collection(db, this.eventsCollection), {
      ...eventData,
      organization_id: targetOrgId,
      status: "PUBLISHED",
      created_by: reviewedByUserId,
      click_count: 0,
      is_boosted: false,
      is_archived: false,
      created_at: now,
      updated_at: now,
    });

    // 2. Update imported event status to APPROVED
    await updateDoc(doc(db, this.importedEventsCollection, id), {
      status: "APPROVED",
      reviewed_by: reviewedByUserId,
      reviewed_at: now,
      claimed_by_org_id: targetOrgId,
      claim_status: "CLAIMED",
      updated_at: now,
    });

    return {
      id: eventRef.id,
      name: eventData.name || "",
      description: eventData.description || "",
      categoria: eventData.categoria || ["Música & Festivais"],
      start_date: eventData.start_date || new Date().toISOString(),
      end_date: eventData.end_date,
      location: eventData.location || "Porto",
      venue_name: eventData.venue_name || "",
      venue_id: eventData.venue_id,
      coordenadas: eventData.coordenadas,
      image: eventData.image || "",
      is_free: Boolean(eventData.is_free),
      price_min: eventData.price_min || 0,
      ticket_status: eventData.ticket_status || "AVAILABLE",
      ticket_url: eventData.ticket_url || "",
      organization_id: targetOrgId,
      status: "PUBLISHED",
      click_count: 0,
      is_boosted: false,
      is_archived: false,
      created_by: reviewedByUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async rejectImportedEvent(
    id: string,
    reason: string,
    reviewedByUserId: string
  ): Promise<void> {
    const now = Timestamp.now();
    await updateDoc(doc(db, this.importedEventsCollection, id), {
      status: "REJECTED",
      review_notes: reason,
      reviewed_by: reviewedByUserId,
      reviewed_at: now,
      updated_at: now,
    });
  }

  async markAsDuplicate(id: string, duplicateOfId: string): Promise<void> {
    const now = Timestamp.now();
    await updateDoc(doc(db, this.importedEventsCollection, id), {
      status: "DUPLICATE",
      "deduplication.is_duplicate": true,
      "deduplication.duplicate_of_id": duplicateOfId,
      updated_at: now,
    });
  }

  async saveIngestionRun(run: IngestionRun): Promise<void> {
    await setDoc(doc(db, this.runsCollection, run.id), {
      ...run,
    });
  }

  async getRecentIngestionRuns(limitCount = 20): Promise<IngestionRun[]> {
    try {
      const q = query(
        collection(db, this.runsCollection),
        orderBy("started_at", "desc"),
        limit(limitCount)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as IngestionRun);
    } catch {
      return [];
    }
  }

  private mapDocToSource(id: string, data: DocumentData): EventSource {
    return {
      id,
      name: data.name || "",
      type: data.type || "ICAL",
      domain: data.domain || "",
      url: data.url || "",
      ingestion_method: data.ingestion_method || "cron",
      status: data.status || "ACTIVE",
      priority: data.priority ?? 50,
      trust_level: data.trust_level ?? 0.7,
      city: data.city || "Porto",
      last_sync_at: data.last_sync_at,
      sync_interval_hours: data.sync_interval_hours ?? 24,
      config: data.config,
      created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
    };
  }

  private mapDocToImportedEvent(id: string, data: DocumentData): ImportedEvent {
    return {
      id,
      source_id: data.source_id || "",
      source_name: data.source_name,
      source_url: data.source_url || "",
      external_id: data.external_id || "",
      status: (data.status as ImportedEventStatus) || "NEEDS_REVIEW",
      confidence_score: data.confidence_score ?? 0.5,
      raw_data: data.raw_data || {},
      extracted_data: data.extracted_data || {},
      normalized_event: data.normalized_event || {},
      venue_resolution: data.venue_resolution,
      organizer_resolution: data.organizer_resolution,
      deduplication: data.deduplication,
      conflicting_fields: data.conflicting_fields,
      review_notes: data.review_notes,
      reviewed_by: data.reviewed_by,
      reviewed_at: data.reviewed_at?.toDate?.()?.toISOString(),
      claimed_by_org_id: data.claimed_by_org_id,
      claim_status: data.claim_status || "UNCLAIMED",
      first_discovered_at: data.first_discovered_at || new Date().toISOString(),
      last_seen_at: data.last_seen_at || new Date().toISOString(),
      created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
    };
  }
}

export const firestoreIngestionRepository = new FirestoreIngestionRepository();
