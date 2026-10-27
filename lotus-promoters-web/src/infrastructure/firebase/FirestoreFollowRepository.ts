import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  increment,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { IFollowRepository } from "@/core/application/repositories";

export class FirestoreFollowRepository implements IFollowRepository {
  private collectionName = "organization_followers";
  private orgsCollection = "organizations";

  private getDocId(userId: string, orgId: string): string {
    return `${userId}_${orgId}`;
  }

  async followOrganization(userId: string, orgId: string): Promise<void> {
    const docId = this.getDocId(userId, orgId);
    const followRef = doc(db, this.collectionName, docId);
    
    // Create follow relationship
    await setDoc(followRef, {
      id: docId,
      user_id: userId,
      organization_id: orgId,
      created_at: Timestamp.now(),
    });

    // Increment followers_count atomically on the organization doc
    try {
      const orgRef = doc(db, this.orgsCollection, orgId);
      await updateDoc(orgRef, {
        followers_count: increment(1),
        updated_at: Timestamp.now(),
      });
    } catch (err) {
      console.warn("Could not increment followers_count on org:", err);
    }
  }

  async unfollowOrganization(userId: string, orgId: string): Promise<void> {
    const docId = this.getDocId(userId, orgId);
    const followRef = doc(db, this.collectionName, docId);

    // Delete follow relationship
    await deleteDoc(followRef);

    // Decrement followers_count atomically
    try {
      const orgRef = doc(db, this.orgsCollection, orgId);
      await updateDoc(orgRef, {
        followers_count: increment(-1),
        updated_at: Timestamp.now(),
      });
    } catch (err) {
      console.warn("Could not decrement followers_count on org:", err);
    }
  }

  async isFollowing(userId: string, orgId: string): Promise<boolean> {
    const docId = this.getDocId(userId, orgId);
    const followRef = doc(db, this.collectionName, docId);
    const snap = await getDoc(followRef);
    return snap.exists();
  }

  async getFollowersCount(orgId: string): Promise<number> {
    try {
      const orgRef = doc(db, this.orgsCollection, orgId);
      const snap = await getDoc(orgRef);
      if (snap.exists()) {
        const data = snap.data();
        return typeof data.followers_count === "number" ? data.followers_count : 0;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  async getUserFollowedOrganizations(userId: string): Promise<string[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("user_id", "==", userId)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data().organization_id as string);
    } catch {
      return [];
    }
  }
}

export const firestoreFollowRepository = new FirestoreFollowRepository();
