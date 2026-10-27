import { create } from "zustand";
import { Organization } from "@/core/domain/organization";
import { firestoreOrganizationRepository } from "@/infrastructure/firebase/FirestoreOrganizationRepository";

interface OrgState {
  activeOrgId: string | null;
  organizations: Organization[];
  isLoadingOrgs: boolean;
  setActiveOrgId: (id: string) => void;
  getActiveOrg: () => Organization | undefined;
  loadOrgs: (userId: string) => Promise<void>;
  addOrganization: (data: Omit<Organization, "id" | "created_at" | "updated_at">, ownerId: string) => Promise<Organization>;
  updateOrganization: (id: string, data: Partial<Organization>) => Promise<void>;
}

export const useOrgStore = create<OrgState>((set, get) => ({
  activeOrgId: null,
  organizations: [],
  isLoadingOrgs: false,

  setActiveOrgId: (id) => set({ activeOrgId: id }),

  getActiveOrg: () => {
    const { activeOrgId, organizations } = get();
    if (activeOrgId) {
      return organizations.find((o) => o.id === activeOrgId) || organizations[0];
    }
    return organizations[0];
  },

  loadOrgs: async (userId: string) => {
    set({ isLoadingOrgs: true });
    try {
      const orgs = await firestoreOrganizationRepository.getUserOrganizations(userId);
      set({
        organizations: orgs,
        activeOrgId: orgs.length > 0 ? orgs[0].id : null,
        isLoadingOrgs: false,
      });
    } catch {
      set({ isLoadingOrgs: false });
    }
  },

  addOrganization: async (data, ownerId) => {
    const newOrg = await firestoreOrganizationRepository.createOrganization(data, ownerId);
    set((state) => ({
      organizations: [...state.organizations, newOrg],
      activeOrgId: newOrg.id,
    }));
    return newOrg;
  },

  updateOrganization: async (id, data) => {
    const updated = await firestoreOrganizationRepository.updateOrganization(id, data);
    set((state) => ({
      organizations: state.organizations.map((org) =>
        org.id === id ? updated : org
      ),
    }));
  },
}));

