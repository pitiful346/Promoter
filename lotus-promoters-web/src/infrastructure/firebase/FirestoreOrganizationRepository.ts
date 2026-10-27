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
import { IOrganizationRepository } from "@/core/application/repositories";
import { Organization, OrganizationMember, MemberRole } from "@/core/domain/organization";

export class FirestoreOrganizationRepository implements IOrganizationRepository {
  private orgCollection = "organizations";
  private membersCollection = "organization_members";

  private mapDocToOrg(id: string, data: DocumentData): Organization {

    return {
      id,
      name: data.name || "",
      slug: data.slug || "",
      logo_url: data.logo_url || undefined,
      banner_url: data.banner_url || data.cover_url || undefined,
      description: data.description || "",
      city: data.city || "Lisboa",
      country: data.country || "Portugal",
      website: data.website || "",
      instagram: data.instagram || "",
      tiktok: data.tiktok || "",
      twitter_x: data.twitter_x || "",
      spotify: data.spotify || "",
      youtube: data.youtube || "",
      categories: Array.isArray(data.categories) ? data.categories : ["Música Eletrónica & Clubbing"],
      is_verified: Boolean(data.is_verified),
      followers_count: typeof data.followers_count === "number" ? data.followers_count : 0,
      public_profile_enabled: data.public_profile_enabled !== undefined ? Boolean(data.public_profile_enabled) : true,
      created_by: data.created_by || "user_1",
      created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
    };
  }

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    try {
      const qCreated = query(
        collection(db, this.orgCollection),
        where("created_by", "==", userId)
      );
      const snapCreated = await getDocs(qCreated);
      const orgsMap = new Map<string, Organization>();

      snapCreated.docs.forEach((d) => {
        orgsMap.set(d.id, this.mapDocToOrg(d.id, d.data()));
      });

      const qMembers = query(
        collection(db, this.membersCollection),
        where("user_id", "==", userId)
      );
      const snapMembers = await getDocs(qMembers);

      for (const memberDoc of snapMembers.docs) {
        const orgId = memberDoc.data().organization_id;
        if (orgId && !orgsMap.has(orgId)) {
          const org = await this.getOrganizationById(orgId);
          if (org) orgsMap.set(org.id, org);
        }
      }

      return Array.from(orgsMap.values());
    } catch {
      return [];
    }
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    const orgDoc = await getDoc(doc(db, this.orgCollection, id));
    if (!orgDoc.exists()) return null;
    return this.mapDocToOrg(orgDoc.id, orgDoc.data());
  }

  async createOrganization(
    data: Omit<Organization, "id" | "created_at" | "updated_at">,
    ownerId: string
  ): Promise<Organization> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, this.orgCollection), {
      ...data,
      created_by: ownerId,
      created_at: now,
      updated_at: now,
    });

    await setDoc(doc(db, this.membersCollection, `${ownerId}_${docRef.id}`), {
      organization_id: docRef.id,
      user_id: ownerId,
      role: "OWNER",
      status: "ACTIVE",
      joined_at: now,
    });

    return {
      ...data,
      id: docRef.id,
      created_by: ownerId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async updateOrganization(id: string, data: Partial<Organization>): Promise<Organization> {
    const docRef = doc(db, this.orgCollection, id);
    await updateDoc(docRef, { ...data, updated_at: Timestamp.now() });
    const updated = await this.getOrganizationById(id);
    if (!updated) throw new Error("Organização não encontrada");
    return updated;
  }

  async getMembers(orgId: string): Promise<OrganizationMember[]> {
    const q = query(
      collection(db, this.membersCollection),
      where("organization_id", "==", orgId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        organization_id: data.organization_id,
        user_id: data.user_id,
        email: data.email || "",
        display_name: data.display_name,
        role: data.role || "VIEWER",
        status: data.status || "ACTIVE",
        joined_at: data.joined_at?.toDate?.()?.toISOString(),
      };
    });
  }

  async inviteMember(orgId: string, email: string, role: string): Promise<OrganizationMember> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, this.membersCollection), {
      organization_id: orgId,
      email,
      role,
      status: "PENDING_INVITE",
      joined_at: now,
    });
    return {
      id: docRef.id,
      organization_id: orgId,
      email,
      role: role as MemberRole,
      status: "PENDING_INVITE",
      joined_at: new Date().toISOString(),
    };
  }


  async removeMember(_orgId: string, memberId: string): Promise<void> {
    await deleteDoc(doc(db, this.membersCollection, memberId));
  }
}

export const firestoreOrganizationRepository = new FirestoreOrganizationRepository();
