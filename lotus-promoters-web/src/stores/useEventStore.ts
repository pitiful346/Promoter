import { create } from "zustand";
import { LotusEvent } from "@/core/domain/event";
import { firestoreEventRepository } from "@/infrastructure/firebase/FirestoreEventRepository";

interface EventStoreState {
  events: LotusEvent[];
  isLoadingEvents: boolean;
  loadEvents: (orgId: string) => Promise<void>;
  createEvent: (data: Omit<LotusEvent, "id" | "created_at" | "updated_at"> | (Omit<LotusEvent, "id" | "created_at" | "updated_at" | "click_count" | "is_boosted" | "is_archived"> & Partial<Pick<LotusEvent, "click_count" | "is_boosted" | "is_archived">>)) => Promise<LotusEvent>;
  updateEvent: (id: string, data: Partial<LotusEvent>) => Promise<void>;
  publishEvent: (id: string) => Promise<void>;
  cancelEvent: (id: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEventsByOrg: (orgId: string) => LotusEvent[];
  getEventById: (id: string) => LotusEvent | undefined;
}

export const useEventStore = create<EventStoreState>((set, get) => ({
  events: [],
  isLoadingEvents: false,

  loadEvents: async (orgId: string) => {
    set({ isLoadingEvents: true });
    try {
      const events = await firestoreEventRepository.getEventsByOrganization(orgId);
      set({ events, isLoadingEvents: false });
    } catch {
      set({ isLoadingEvents: false });
    }
  },

  createEvent: async (data) => {
    const payload: Omit<LotusEvent, "id" | "created_at" | "updated_at"> = {
      ...data,
      click_count: data.click_count || 0,
      is_boosted: Boolean(data.is_boosted),
      is_archived: Boolean(data.is_archived),
    };
    const newEvent = await firestoreEventRepository.createEvent(payload);
    set((state) => ({ events: [newEvent, ...state.events] }));
    return newEvent;
  },


  updateEvent: async (id, data) => {
    const updated = await firestoreEventRepository.updateEvent(id, data);
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? updated : e)),
    }));
  },

  publishEvent: async (id) => {
    const updated = await firestoreEventRepository.publishEvent(id);
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? updated : e)),
    }));
  },

  cancelEvent: async (id) => {
    const updated = await firestoreEventRepository.cancelEvent(id);
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? updated : e)),
    }));
  },

  deleteEvent: async (id) => {
    await firestoreEventRepository.deleteEvent(id);
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    }));
  },

  getEventsByOrg: (orgId) => {
    return get().events.filter((e) => e.organization_id === orgId);
  },

  getEventById: (id) => {
    return get().events.find((e) => e.id === id);
  },
}));
