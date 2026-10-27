import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  GeoPoint,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { IEventRepository } from "@/core/application/repositories";
import { LotusEvent, EventStatus } from "@/core/domain/event";

export class FirestoreEventRepository implements IEventRepository {
  private collectionName = "events";

  private mapDocToEvent(id: string, data: DocumentData): LotusEvent {
    // Helper to parse dates from Firestore Timestamp or String
    const parseDate = (val: unknown): string => {
      if (!val) return new Date().toISOString();
      if (val instanceof Timestamp) return val.toDate().toISOString();
      if (typeof (val as { toDate?: () => Date })?.toDate === "function") return (val as { toDate: () => Date }).toDate().toISOString();
      if (typeof val === "string") return val;
      return new Date().toISOString();
    };


    return {
      id,
      organization_id: data.organization_id || (data.organizer_id?.id || "org_1"),
      venue_id: data.venue_id || undefined,
      name: data.name || "",
      description: data.description || "",
      location: data.location || "",
      venue_name: data.venue_name || "",
      coordenadas: data.coordenadas
        ? {
            latitude: data.coordenadas.latitude,
            longitude: data.coordenadas.longitude,
          }
        : undefined,
      image: data.image || "",
      extra_images: data.extra_images || [],
      start_date: parseDate(data.start_date),
      end_date: data.end_date ? parseDate(data.end_date) : undefined,
      price_min: typeof data.price_min === "number" ? data.price_min : 0,
      is_free: Boolean(data.is_free),
      ticket_status: data.ticket_status || "AVAILABLE",
      ticket_url: data.ticket_url || "",
      categoria: Array.isArray(data.categoria) ? data.categoria : [],
      click_count: typeof data.click_count === "number" ? data.click_count : 0,
      is_boosted: Boolean(data.is_boosted),
      is_archived: Boolean(data.is_archived),
      status: (data.status as EventStatus) || "PUBLISHED",
      rejection_reason: data.rejection_reason || undefined,
      created_by: data.created_by || "system",
      created_at: parseDate(data.created_at || data.created_time),
      updated_at: parseDate(data.updated_at || data.created_time),
    };
  }

  private mapEventToFirestore(event: Partial<LotusEvent>): Record<string, unknown> {
    const payload: Record<string, unknown> = {};


    if (event.name !== undefined) payload.name = event.name;
    if (event.description !== undefined) payload.description = event.description;
    if (event.location !== undefined) payload.location = event.location;
    if (event.venue_name !== undefined) payload.venue_name = event.venue_name;
    if (event.image !== undefined) payload.image = event.image;
    if (event.extra_images !== undefined) payload.extra_images = event.extra_images;
    if (event.price_min !== undefined) payload.price_min = event.price_min;
    if (event.is_free !== undefined) payload.is_free = event.is_free;
    if (event.ticket_status !== undefined) payload.ticket_status = event.ticket_status;
    if (event.ticket_url !== undefined) payload.ticket_url = event.ticket_url;
    if (event.categoria !== undefined) payload.categoria = event.categoria;
    if (event.click_count !== undefined) payload.click_count = event.click_count;
    if (event.is_boosted !== undefined) payload.is_boosted = event.is_boosted;
    if (event.is_archived !== undefined) payload.is_archived = event.is_archived;
    if (event.status !== undefined) payload.status = event.status;
    if (event.organization_id !== undefined) payload.organization_id = event.organization_id;
    if (event.venue_id !== undefined) payload.venue_id = event.venue_id;
    if (event.rejection_reason !== undefined) payload.rejection_reason = event.rejection_reason;
    if (event.created_by !== undefined) payload.created_by = event.created_by;

    if (event.coordenadas) {
      payload.coordenadas = new GeoPoint(
        event.coordenadas.latitude,
        event.coordenadas.longitude
      );
    }

    if (event.start_date) {
      payload.start_date = Timestamp.fromDate(new Date(event.start_date));
    }
    if (event.end_date) {
      payload.end_date = Timestamp.fromDate(new Date(event.end_date));
    }

    payload.updated_at = Timestamp.now();
    return payload;
  }

  async getEventsByOrganization(orgId: string, status?: EventStatus): Promise<LotusEvent[]> {
    try {
      const colRef = collection(db, this.collectionName);
      let q = query(colRef, where("organization_id", "==", orgId));

      if (status) {
        q = query(colRef, where("organization_id", "==", orgId), where("status", "==", status));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => this.mapDocToEvent(docSnap.id, docSnap.data()));
    } catch (error) {
      console.warn("Firestore offline or query error, falling back:", error);
      return [];
    }
  }

  async getEventById(id: string): Promise<LotusEvent | null> {
    const docRef = doc(db, this.collectionName, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return this.mapDocToEvent(snap.id, snap.data());
  }

  async validateEventCreation(userId: string): Promise<{ allowed: boolean; errorMessage?: string }> {
    try {
      const userDocRef = doc(db, "users", userId);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) {
        return { allowed: false, errorMessage: "Perfil de utilizador não encontrado." };
      }
      const data = userSnap.data();
      if (!data.is_promoter) {
        return { allowed: false, errorMessage: "Apenas utilizadores com perfil de promotor podem criar eventos." };
      }
      const tier = (data.subscription_tier || "free").toLowerCase().trim();
      if (tier === "premium" || tier === "founder") {
        return { allowed: true };
      }
      const count = data.events_published_this_month || 0;
      if (count >= 1) {
        return { allowed: false, errorMessage: "Quota mensal esgotada. Faz upgrade para o plano Premium." };
      }
      return { allowed: true };
    } catch (err: unknown) {
      console.warn("Could not validate event creation against Firestore:", err);
      return { allowed: true };
    }
  }

  async createEvent(event: Omit<LotusEvent, "id" | "created_at" | "updated_at">): Promise<LotusEvent> {
    if (event.created_by) {
      const validation = await this.validateEventCreation(event.created_by);
      if (!validation.allowed) {
        throw new Error(validation.errorMessage || "Quota mensal esgotada. Faz upgrade para o plano Premium.");
      }
    }

    const colRef = collection(db, this.collectionName);
    const payload = this.mapEventToFirestore(event);
    payload.created_at = Timestamp.now();

    const docRef = await addDoc(colRef, payload);
    return {
      ...event,
      id: docRef.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async updateEvent(id: string, data: Partial<LotusEvent>): Promise<LotusEvent> {
    const docRef = doc(db, this.collectionName, id);
    const payload = this.mapEventToFirestore(data);
    await updateDoc(docRef, payload);

    const updated = await this.getEventById(id);
    if (!updated) throw new Error("Evento não encontrado após atualização");
    return updated;
  }

  async deleteEvent(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async publishEvent(id: string): Promise<LotusEvent> {
    return this.updateEvent(id, { status: "PUBLISHED" });
  }

  async cancelEvent(id: string, reason?: string): Promise<LotusEvent> {
    return this.updateEvent(id, { status: "CANCELLED", rejection_reason: reason });
  }
}

export const firestoreEventRepository = new FirestoreEventRepository();
