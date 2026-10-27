import { LotusEvent, EventStatus } from "../domain/event";
import { Organization, OrganizationMember } from "../domain/organization";
import { Venue } from "../domain/venue";
import { LotusTeaser, TeaserStatus } from "../domain/teaser";

import { SystemNotificationLog, DeviceToken, UserNotificationPreferences } from "../domain/notification";

export interface IEventRepository {
  getEventsByOrganization(orgId: string, status?: EventStatus): Promise<LotusEvent[]>;
  getEventById(id: string): Promise<LotusEvent | null>;
  createEvent(event: Omit<LotusEvent, "id" | "created_at" | "updated_at">): Promise<LotusEvent>;
  updateEvent(id: string, event: Partial<LotusEvent>): Promise<LotusEvent>;
  deleteEvent(id: string): Promise<void>;
  publishEvent(id: string): Promise<LotusEvent>;
  cancelEvent(id: string, reason?: string): Promise<LotusEvent>;
}

export interface IOrganizationRepository {
  getUserOrganizations(userId: string): Promise<Organization[]>;
  getOrganizationById(id: string): Promise<Organization | null>;
  createOrganization(org: Omit<Organization, "id" | "created_at" | "updated_at">, ownerId: string): Promise<Organization>;
  updateOrganization(id: string, data: Partial<Organization>): Promise<Organization>;
  getMembers(orgId: string): Promise<OrganizationMember[]>;
  inviteMember(orgId: string, email: string, role: string): Promise<OrganizationMember>;
  removeMember(orgId: string, memberId: string): Promise<void>;
}

export interface IVenueRepository {
  getVenuesByOrganization(orgId: string): Promise<Venue[]>;
  getVenueById(id: string): Promise<Venue | null>;
  createVenue(venue: Omit<Venue, "id" | "created_at">): Promise<Venue>;
  updateVenue(id: string, venue: Partial<Venue>): Promise<Venue>;
  deleteVenue(id: string): Promise<void>;
}

export interface IFollowRepository {
  followOrganization(userId: string, orgId: string): Promise<void>;
  unfollowOrganization(userId: string, orgId: string): Promise<void>;
  isFollowing(userId: string, orgId: string): Promise<boolean>;
  getFollowersCount(orgId: string): Promise<number>;
  getUserFollowedOrganizations(userId: string): Promise<string[]>;
}

export interface ITeaserRepository {
  getTeasersByOrganization(orgId: string, status?: TeaserStatus): Promise<LotusTeaser[]>;
  getTeaserById(id: string): Promise<LotusTeaser | null>;
  createTeaser(teaser: Omit<LotusTeaser, "id" | "created_at" | "updated_at" | "tracking_count" | "is_official">): Promise<LotusTeaser>;
  updateTeaser(id: string, data: Partial<LotusTeaser>): Promise<LotusTeaser>;
  deleteTeaser(id: string): Promise<void>;
  publishTeaser(id: string): Promise<LotusTeaser>;
  revealTeaser(id: string, eventId: string): Promise<LotusTeaser>;
  cancelTeaser(id: string): Promise<LotusTeaser>;
  trackTeaser(userId: string, teaserId: string): Promise<void>;
  untrackTeaser(userId: string, teaserId: string): Promise<void>;
  isTracking(userId: string, teaserId: string): Promise<boolean>;
}

export interface INotificationRepository {
  getOrgNotificationLogs(orgId: string): Promise<SystemNotificationLog[]>;
  logSystemNotification(log: Omit<SystemNotificationLog, "id" | "created_at">): Promise<SystemNotificationLog>;
  registerDeviceToken(token: DeviceToken): Promise<void>;
  getUserPreferences(userId: string): Promise<UserNotificationPreferences | null>;
  updateUserPreferences(userId: string, prefs: Partial<UserNotificationPreferences>): Promise<void>;
}

import { EventSource, ImportedEvent, ImportedEventStatus, IngestionRun } from "../domain/ingestion";

export interface IIngestionRepository {
  getActiveSources(): Promise<EventSource[]>;
  getSourceById(id: string): Promise<EventSource | null>;
  saveSource(source: EventSource): Promise<void>;
  getImportedEvents(filters?: { status?: ImportedEventStatus; source_id?: string; city?: string }): Promise<ImportedEvent[]>;
  getImportedEventById(id: string): Promise<ImportedEvent | null>;
  saveImportedEvent(event: ImportedEvent): Promise<void>;
  saveImportedEventsBatch(events: ImportedEvent[]): Promise<void>;
  approveImportedEvent(id: string, targetOrgId: string, reviewedByUserId: string): Promise<LotusEvent>;
  rejectImportedEvent(id: string, reason: string, reviewedByUserId: string): Promise<void>;
  markAsDuplicate(id: string, duplicateOfId: string): Promise<void>;
  saveIngestionRun(run: IngestionRun): Promise<void>;
  getRecentIngestionRuns(limitCount?: number): Promise<IngestionRun[]>;
}

