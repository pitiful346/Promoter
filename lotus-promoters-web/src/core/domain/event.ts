export type EventStatus = 
  | "DRAFT" 
  | "SUBMITTED" 
  | "PUBLISHED" 
  | "CANCELLED" 
  | "REJECTED" 
  | "ARCHIVED";

export type TicketStatus = 
  | "AVAILABLE" 
  | "SOLD_OUT" 
  | "SOON" 
  | "CANCELLED";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LotusEvent {
  id: string;
  organization_id: string;
  venue_id?: string;
  
  // Fields shared with Lotus Mobile Flutter
  name: string;
  description: string;
  location: string;
  venue_name: string;
  coordenadas?: Coordinates;
  image: string;
  extra_images?: string[];
  start_date: string; // ISO string
  end_date?: string;   // ISO string
  price_min: number;
  is_free: boolean;
  ticket_status: TicketStatus;
  ticket_url: string;
  categoria: string[];
  click_count: number;
  is_boosted: boolean;
  is_archived: boolean;
  
  // SaaS Workflow & Moderation
  status: EventStatus;
  teaser_id?: string; // Link to Lotus Radar teaser
  rejection_reason?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const EVENT_CATEGORIES = [
  "Música & Festivais",
  "Noite & Clubbing",
  "Artes & Cultura",
  "Gastronomia & Vinhos",
  "Tech & Negócios",
  "Desporto & Fitness",
  "Teatro & Stand-up",
  "Comunidade & Feiras",
] as const;
