import { IEventRepository, IOrganizationRepository, IVenueRepository } from "@/core/application/repositories";
import { LotusEvent, EventStatus } from "@/core/domain/event";
import { Organization, OrganizationMember, MemberRole } from "@/core/domain/organization";
import { Venue } from "@/core/domain/venue";

import { MOCK_EVENTS, MOCK_ORGANIZATIONS, MOCK_MEMBERS, MOCK_VENUES } from "./mockData";

class MockEventRepository implements IEventRepository {
  private events: LotusEvent[] = [...MOCK_EVENTS];

  async getEventsByOrganization(orgId: string, status?: EventStatus): Promise<LotusEvent[]> {
    return this.events.filter(e => e.organization_id === orgId && (!status || e.status === status));
  }

  async getEventById(id: string): Promise<LotusEvent | null> {
    const event = this.events.find(e => e.id === id);
    return event ? { ...event } : null;
  }

  async createEvent(data: Omit<LotusEvent, "id" | "created_at" | "updated_at">): Promise<LotusEvent> {
    const now = new Date().toISOString();
    const newEvent: LotusEvent = {
      ...data,
      id: `event_${Date.now()}`,
      created_at: now,
      updated_at: now,
    };
    this.events.unshift(newEvent);
    return newEvent;
  }

  async updateEvent(id: string, data: Partial<LotusEvent>): Promise<LotusEvent> {
    const index = this.events.findIndex(e => e.id === id);
    if (index === -1) throw new Error("Evento não encontrado");
    
    this.events[index] = {
      ...this.events[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return this.events[index];
  }

  async deleteEvent(id: string): Promise<void> {
    this.events = this.events.filter(e => e.id !== id);
  }

  async publishEvent(id: string): Promise<LotusEvent> {
    return this.updateEvent(id, { status: "PUBLISHED" });
  }

  async cancelEvent(id: string, reason?: string): Promise<LotusEvent> {
    return this.updateEvent(id, { status: "CANCELLED", rejection_reason: reason });
  }
}

class MockOrganizationRepository implements IOrganizationRepository {
  private orgs: Organization[] = [...MOCK_ORGANIZATIONS];
  private members: OrganizationMember[] = [...MOCK_MEMBERS];

  async getUserOrganizations(_userId: string): Promise<Organization[]> {
    return this.orgs;
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    const org = this.orgs.find(o => o.id === id);
    return org ? { ...org } : null;
  }

  async createOrganization(data: Omit<Organization, "id" | "created_at" | "updated_at">, _ownerId: string): Promise<Organization> {
    const now = new Date().toISOString();
    const newOrg: Organization = {
      ...data,
      id: `org_${Date.now()}`,
      created_at: now,
      updated_at: now,
    };
    this.orgs.push(newOrg);
    return newOrg;
  }

  async updateOrganization(id: string, data: Partial<Organization>): Promise<Organization> {
    const index = this.orgs.findIndex(o => o.id === id);
    if (index === -1) throw new Error("Organização não encontrada");
    this.orgs[index] = { ...this.orgs[index], ...data, updated_at: new Date().toISOString() };
    return this.orgs[index];
  }

  async getMembers(orgId: string): Promise<OrganizationMember[]> {
    return this.members.filter(m => m.organization_id === orgId);
  }

  async inviteMember(orgId: string, email: string, role: string): Promise<OrganizationMember> {
    const newMember: OrganizationMember = {
      id: `mem_${Date.now()}`,
      organization_id: orgId,
      email,
      role: role as MemberRole,
      status: "PENDING_INVITE",
      joined_at: new Date().toISOString(),
    };
    this.members.push(newMember);
    return newMember;
  }


  async removeMember(orgId: string, memberId: string): Promise<void> {
    this.members = this.members.filter(m => !(m.organization_id === orgId && m.id === memberId));
  }
}

class MockVenueRepository implements IVenueRepository {
  private venues: Venue[] = [...MOCK_VENUES];

  async getVenuesByOrganization(orgId: string): Promise<Venue[]> {
    return this.venues.filter(v => v.organization_id === orgId);
  }

  async getVenueById(id: string): Promise<Venue | null> {
    const venue = this.venues.find(v => v.id === id);
    return venue ? { ...venue } : null;
  }

  async createVenue(data: Omit<Venue, "id" | "created_at">): Promise<Venue> {
    const newVenue: Venue = {
      ...data,
      id: `venue_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.venues.push(newVenue);
    return newVenue;
  }

  async updateVenue(id: string, data: Partial<Venue>): Promise<Venue> {
    const index = this.venues.findIndex(v => v.id === id);
    if (index === -1) throw new Error("Venue não encontrado");
    this.venues[index] = { ...this.venues[index], ...data };
    return this.venues[index];
  }

  async deleteVenue(id: string): Promise<void> {
    this.venues = this.venues.filter(v => v.id !== id);
  }
}

export const eventRepository = new MockEventRepository();
export const organizationRepository = new MockOrganizationRepository();
export const venueRepository = new MockVenueRepository();
