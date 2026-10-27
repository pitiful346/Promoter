import { LotusEvent } from "./event";
import { Coordinates } from "./event";

export type EventSourceType =
  | "PARTNER_API"
  | "PUBLIC_API"
  | "RSS_FEED"
  | "ICAL"
  | "STRUCTURED_WEB"
  | "MANUAL_IMPORT";

export type EventSourceStatus = "ACTIVE" | "PAUSED" | "ERROR";

export interface EventSource {
  id: string;
  name: string;
  type: EventSourceType;
  domain: string;
  url: string;
  ingestion_method: string;
  status: EventSourceStatus;
  priority: number; // 1 (lowest) to 100 (highest)
  trust_level: number; // 0.0 to 1.0
  city: string; // e.g. "Porto", "Vila Nova de Gaia"
  last_sync_at?: string;
  sync_interval_hours?: number;
  config?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type ImportedEventStatus =
  | "DISCOVERED"
  | "EXTRACTED"
  | "NORMALIZED"
  | "DUPLICATE"
  | "NEEDS_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED"
  | "CANCELLED";

export interface RawIngestedEvent {
  external_id: string;
  source_id: string;
  source_url: string;
  fetched_at: string;
  payload: Record<string, unknown>;
}

export interface ExtractedEventDraft {
  external_id: string;
  title: string;
  description?: string;
  category?: string;
  start_date: string; // ISO String
  end_date?: string;
  venue_name?: string;
  address?: string;
  city?: string;
  coordenadas?: Coordinates;
  organizer_name?: string;
  artists?: string[];
  image_url?: string;
  is_free?: boolean;
  price_min?: number;
  price_max?: number;
  ticket_url?: string;
  source_url: string;
  age_restriction?: string;
  tags?: string[];
  status?: "SCHEDULED" | "CANCELLED" | "POSTPONED";
}

export interface VenueResolutionResult {
  resolved: boolean;
  venue_id?: string;
  venue_name?: string;
  address?: string;
  city?: string;
  coordenadas?: Coordinates;
  match_score: number; // 0.0 to 1.0
  is_candidate?: boolean;
}

export interface OrganizerResolutionResult {
  resolved: boolean;
  organization_id?: string;
  organizer_text?: string;
  match_score: number;
}

export interface DeduplicationResult {
  is_duplicate: boolean;
  similarity_score: number; // 0.0 to 1.0
  duplicate_of_id?: string;
  potential_matches: Array<{
    id: string;
    title: string;
    start_date: string;
    venue_name?: string;
    similarity: number;
  }>;
}

export interface ImportedEvent {
  id: string;
  source_id: string;
  source_name?: string;
  source_url: string;
  external_id: string;
  status: ImportedEventStatus;
  confidence_score: number; // 0.0 to 1.0
  raw_data: RawIngestedEvent;
  extracted_data: ExtractedEventDraft;
  normalized_event: Partial<LotusEvent>;
  venue_resolution?: VenueResolutionResult;
  organizer_resolution?: OrganizerResolutionResult;
  deduplication?: DeduplicationResult;
  conflicting_fields?: Record<
    string,
    {
      current_value: unknown;
      incoming_value: unknown;
      source_id: string;
      detected_at: string;
    }
  >;
  review_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  claimed_by_org_id?: string;
  claim_status: "UNCLAIMED" | "PENDING_VERIFICATION" | "CLAIMED";
  first_discovered_at: string;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface IngestionRunError {
  external_id?: string;
  error: string;
  timestamp: string;
}

export interface IngestionRun {
  id: string;
  source_id: string;
  source_name?: string;
  status: "RUNNING" | "SUCCESS" | "PARTIAL" | "FAILED";
  started_at: string;
  finished_at?: string;
  duration_ms?: number;
  discovered_count: number;
  new_count: number;
  updated_count: number;
  duplicate_count: number;
  review_count: number;
  error_count: number;
  errors: IngestionRunError[];
}
