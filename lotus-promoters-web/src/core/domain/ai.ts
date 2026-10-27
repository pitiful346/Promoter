import { LotusEvent, TicketStatus } from "./event";

export interface ConfidenceValue<T> {
  value: T | null;
  confidence: number; // 0.0 to 1.0
}

export interface ExtractedEventFields {
  name: ConfidenceValue<string>;
  description: ConfidenceValue<string>;
  category: ConfidenceValue<string>;
  start_date: ConfidenceValue<string>;
  end_date: ConfidenceValue<string>;
  location: ConfidenceValue<string>;
  venue_name: ConfidenceValue<string>;
  address: ConfidenceValue<string>;
  artists: ConfidenceValue<string[]>;
  is_free: ConfidenceValue<boolean>;
  price_min: ConfidenceValue<number>;
  ticket_url: ConfidenceValue<string>;
  age_restriction: ConfidenceValue<string>;
  dress_code: ConfidenceValue<string>;
  organizer: ConfidenceValue<string>;
  social_links: ConfidenceValue<string[]>;
}

export interface VenueMatchResult {
  matched: boolean;
  venue_id?: string;
  venue_name?: string;
  address?: string;
  city?: string;
  coordenadas?: {
    latitude: number;
    longitude: number;
  };
  match_score: number; // 0.0 to 1.0
}

export interface PosterExtractionResult {
  success: boolean;
  normalized_event: Partial<LotusEvent> & {
    artists?: string[];
    age_restriction?: string;
  };
  extracted_fields: ExtractedEventFields;
  venue_match?: VenueMatchResult;
  summary: string;
  metadata: {
    provider: string;
    model: string;
    latency_ms: number;
    image_url?: string;
  };
  error?: string;
}
