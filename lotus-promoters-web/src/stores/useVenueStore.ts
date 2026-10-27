import { create } from "zustand";
import { Venue } from "@/core/domain/venue";
import { firestoreVenueRepository } from "@/infrastructure/firebase/FirestoreVenueRepository";

interface VenueStoreState {
  venues: Venue[];
  isLoadingVenues: boolean;
  loadVenues: (orgId: string) => Promise<void>;
  addVenue: (data: Omit<Venue, "id" | "created_at">) => Promise<Venue>;
  updateVenue: (id: string, data: Partial<Venue>) => Promise<void>;
  deleteVenue: (id: string) => Promise<void>;
  getVenueById: (id: string) => Venue | undefined;
}

export const useVenueStore = create<VenueStoreState>((set, get) => ({
  venues: [],
  isLoadingVenues: false,

  loadVenues: async (orgId: string) => {
    set({ isLoadingVenues: true });
    try {
      const venues = await firestoreVenueRepository.getVenuesByOrganization(orgId);
      set({ venues, isLoadingVenues: false });
    } catch {
      set({ isLoadingVenues: false });
    }
  },

  addVenue: async (data) => {
    const newVenue = await firestoreVenueRepository.createVenue(data);
    set((state) => ({ venues: [newVenue, ...state.venues] }));
    return newVenue;
  },

  updateVenue: async (id, data) => {
    await firestoreVenueRepository.updateVenue(id, data);
    set((state) => ({
      venues: state.venues.map((v) => (v.id === id ? { ...v, ...data } : v)),
    }));
  },

  deleteVenue: async (id) => {
    await firestoreVenueRepository.deleteVenue(id);
    set((state) => ({
      venues: state.venues.filter((v) => v.id !== id),
    }));
  },

  getVenueById: (id) => {
    return get().venues.find((v) => v.id === id);
  },
}));

