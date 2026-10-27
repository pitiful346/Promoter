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
import { IVenueRepository } from "@/core/application/repositories";
import { Venue } from "@/core/domain/venue";

export class FirestoreVenueRepository implements IVenueRepository {
  private collectionName = "venues";

  private mapDocToVenue(id: string, data: DocumentData): Venue {

    return {
      id,
      organization_id: data.organization_id || "org_1",
      name: data.name || "",
      address: data.address || "",
      city: data.city || "",
      capacity: typeof data.capacity === "number" ? data.capacity : undefined,
      photo_url: data.photo_url || undefined,
      contact_email: data.contact_email || undefined,
      contact_phone: data.contact_phone || undefined,
      coordenadas: data.coordenadas
        ? {
            latitude: data.coordenadas.latitude,
            longitude: data.coordenadas.longitude,
          }
        : undefined,
      created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
    };
  }

  async getVenuesByOrganization(orgId: string): Promise<Venue[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("organization_id", "==", orgId)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => this.mapDocToVenue(d.id, d.data()));
    } catch {
      return [];
    }
  }

  async getVenueById(id: string): Promise<Venue | null> {
    const snap = await getDoc(doc(db, this.collectionName, id));
    if (!snap.exists()) return null;
    return this.mapDocToVenue(snap.id, snap.data());
  }

  async createVenue(data: Omit<Venue, "id" | "created_at">): Promise<Venue> {
    const payload: Record<string, unknown> = {
      ...data,
      created_at: Timestamp.now(),
    };
    if (data.coordenadas) {
      payload.coordenadas = new GeoPoint(
        data.coordenadas.latitude,
        data.coordenadas.longitude
      );
    }
    const docRef = await addDoc(collection(db, this.collectionName), payload);
    return {
      ...data,
      id: docRef.id,
      created_at: new Date().toISOString(),
    };
  }

  async updateVenue(id: string, data: Partial<Venue>): Promise<Venue> {
    const docRef = doc(db, this.collectionName, id);
    const payload: Record<string, unknown> = { ...data };

    if (data.coordenadas) {
      payload.coordenadas = new GeoPoint(
        data.coordenadas.latitude,
        data.coordenadas.longitude
      );
    }
    await updateDoc(docRef, payload);
    const updated = await this.getVenueById(id);
    if (!updated) throw new Error("Venue não encontrado");
    return updated;
  }

  async deleteVenue(id: string): Promise<void> {
    await deleteDoc(doc(db, this.collectionName, id));
  }
}

export const firestoreVenueRepository = new FirestoreVenueRepository();
