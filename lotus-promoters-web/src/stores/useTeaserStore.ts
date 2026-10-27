import { create } from "zustand";
import { LotusTeaser } from "@/core/domain/teaser";
import { firestoreTeaserRepository } from "@/infrastructure/firebase/FirestoreTeaserRepository";

interface TeaserStoreState {
  teasers: LotusTeaser[];
  isLoadingTeasers: boolean;
  loadTeasers: (orgId: string) => Promise<void>;
  addTeaser: (teaser: Omit<LotusTeaser, "id" | "created_at" | "updated_at" | "tracking_count" | "is_official">) => Promise<LotusTeaser>;
  updateTeaser: (id: string, data: Partial<LotusTeaser>) => Promise<void>;
  deleteTeaser: (id: string) => Promise<void>;
  publishTeaser: (id: string) => Promise<void>;
  revealTeaser: (id: string, eventId: string) => Promise<void>;
  cancelTeaser: (id: string) => Promise<void>;
  getTeasersByOrg: (orgId: string) => LotusTeaser[];
  getTeaserById: (id: string) => LotusTeaser | undefined;
}

export const useTeaserStore = create<TeaserStoreState>((set, get) => ({
  teasers: [],
  isLoadingTeasers: false,

  loadTeasers: async (orgId: string) => {
    set({ isLoadingTeasers: true });
    try {
      const teasers = await firestoreTeaserRepository.getTeasersByOrganization(orgId);
      set({ teasers, isLoadingTeasers: false });
    } catch {
      set({ isLoadingTeasers: false });
    }
  },

  addTeaser: async (data) => {
    const newTeaser = await firestoreTeaserRepository.createTeaser(data);
    set((state) => ({ teasers: [newTeaser, ...state.teasers] }));
    return newTeaser;
  },

  updateTeaser: async (id, data) => {
    await firestoreTeaserRepository.updateTeaser(id, data);
    set((state) => ({
      teasers: state.teasers.map((t) =>
        t.id === id ? { ...t, ...data, updated_at: new Date().toISOString() } : t
      ),
    }));
  },

  deleteTeaser: async (id) => {
    await firestoreTeaserRepository.deleteTeaser(id);
    set((state) => ({
      teasers: state.teasers.filter((t) => t.id !== id),
    }));
  },

  publishTeaser: async (id) => {
    await firestoreTeaserRepository.publishTeaser(id);
    set((state) => ({
      teasers: state.teasers.map((t) =>
        t.id === id ? { ...t, status: "PUBLISHED", updated_at: new Date().toISOString() } : t
      ),
    }));
  },

  revealTeaser: async (id, eventId) => {
    await firestoreTeaserRepository.revealTeaser(id, eventId);
    set((state) => ({
      teasers: state.teasers.map((t) =>
        t.id === id ? { ...t, status: "REVEALED", linked_event_id: eventId, updated_at: new Date().toISOString() } : t
      ),
    }));
  },

  cancelTeaser: async (id) => {
    await firestoreTeaserRepository.cancelTeaser(id);
    set((state) => ({
      teasers: state.teasers.map((t) =>
        t.id === id ? { ...t, status: "CANCELLED", updated_at: new Date().toISOString() } : t
      ),
    }));
  },


  getTeasersByOrg: (orgId) => {
    return get().teasers.filter((t) => t.organization_id === orgId);
  },

  getTeaserById: (id) => {
    return get().teasers.find((t) => t.id === id);
  },
}));

