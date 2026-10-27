import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { ITeaserRepository } from "@/core/application/repositories";
import { LotusTeaser, TeaserStatus } from "@/core/domain/teaser";

export class FirestoreTeaserRepository implements ITeaserRepository {
  private collectionName = "radar_teasers";
  private trackingsCollection = "radar_trackings";

  private mapDocToTeaser(id: string, data: DocumentData): LotusTeaser {
    const parseDate = (val: unknown): string => {
      if (!val) return new Date().toISOString();
      if (val instanceof Timestamp) return val.toDate().toISOString();
      if (typeof (val as { toDate?: () => Date })?.toDate === "function") return (val as { toDate: () => Date }).toDate().toISOString();
      if (typeof val === "string") return val;
      return new Date().toISOString();
    };


    return {
      id,
      organization_id: data.organization_id || "org_1",
      codename: data.codename || "UNTITLED_TEASER",
      title: data.title || undefined,
      description: data.description || "",
      image: data.image || "",
      city: data.city || "Lisboa",
      category: data.category || "Música Eletrónica & Clubbing",
      approximate_date: data.approximate_date || undefined,
      reveal_at: parseDate(data.reveal_at),
      status: (data.status as TeaserStatus) || "DRAFT",
      linked_event_id: data.linked_event_id || undefined,
      tracking_count: typeof data.tracking_count === "number" ? data.tracking_count : 0,
      is_official: true,
      created_by: data.created_by || "user_1",
      created_at: parseDate(data.created_at),
      updated_at: parseDate(data.updated_at),
    };
  }

  async getTeasersByOrganization(orgId: string, status?: TeaserStatus): Promise<LotusTeaser[]> {
    try {
      const colRef = collection(db, this.collectionName);
      let q = query(colRef, where("organization_id", "==", orgId));
      if (status) {
        q = query(colRef, where("organization_id", "==", orgId), where("status", "==", status));
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => this.mapDocToTeaser(d.id, d.data()));
    } catch {
      return [];
    }
  }

  async getTeaserById(id: string): Promise<LotusTeaser | null> {
    const snap = await getDoc(doc(db, this.collectionName, id));
    if (!snap.exists()) return null;
    return this.mapDocToTeaser(snap.id, snap.data());
  }

  async createTeaser(
    teaser: Omit<LotusTeaser, "id" | "created_at" | "updated_at" | "tracking_count" | "is_official">
  ): Promise<LotusTeaser> {
    const now = Timestamp.now();
    const payload = {
      ...teaser,
      reveal_at: Timestamp.fromDate(new Date(teaser.reveal_at)),
      tracking_count: 0,
      is_official: true,
      created_at: now,
      updated_at: now,
    };
    const docRef = await addDoc(collection(db, this.collectionName), payload);
    return {
      ...teaser,
      id: docRef.id,
      tracking_count: 0,
      is_official: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async updateTeaser(id: string, data: Partial<LotusTeaser>): Promise<LotusTeaser> {
    const docRef = doc(db, this.collectionName, id);
    const payload: Record<string, unknown> = { ...data, updated_at: Timestamp.now() };
    if (data.reveal_at) {
      payload.reveal_at = Timestamp.fromDate(new Date(data.reveal_at));
    }

    await updateDoc(docRef, payload);
    const updated = await this.getTeaserById(id);
    if (!updated) throw new Error("Teaser não encontrado");
    return updated;
  }

  async deleteTeaser(id: string): Promise<void> {
    await deleteDoc(doc(db, this.collectionName, id));
  }

  async publishTeaser(id: string): Promise<LotusTeaser> {
    return this.updateTeaser(id, { status: "PUBLISHED" });
  }

  async revealTeaser(id: string, eventId: string): Promise<LotusTeaser> {
    return this.updateTeaser(id, { status: "REVEALED", linked_event_id: eventId });
  }

  async cancelTeaser(id: string): Promise<LotusTeaser> {
    return this.updateTeaser(id, { status: "CANCELLED" });
  }

  async trackTeaser(userId: string, teaserId: string): Promise<void> {
    const docId = `${userId}_${teaserId}`;
    await setDoc(doc(db, this.trackingsCollection, docId), {
      id: docId,
      user_id: userId,
      teaser_id: teaserId,
      created_at: Timestamp.now(),
    });
    try {
      await updateDoc(doc(db, this.collectionName, teaserId), {
        tracking_count: increment(1),
      });
    } catch {}
  }

  async untrackTeaser(userId: string, teaserId: string): Promise<void> {
    const docId = `${userId}_${teaserId}`;
    await deleteDoc(doc(db, this.trackingsCollection, docId));
    try {
      await updateDoc(doc(db, this.collectionName, teaserId), {
        tracking_count: increment(-1),
      });
    } catch {}
  }

  async isTracking(userId: string, teaserId: string): Promise<boolean> {
    const docId = `${userId}_${teaserId}`;
    const snap = await getDoc(doc(db, this.trackingsCollection, docId));
    return snap.exists();
  }
}

export const firestoreTeaserRepository = new FirestoreTeaserRepository();
