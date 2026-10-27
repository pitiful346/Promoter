export type TeaserStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "REVEALED" | "CANCELLED";

export interface LotusTeaser {
  id: string;
  organization_id: string;
  codename: string; // Internal codename, e.g. "SECRET_STAGE_2026"
  title?: string; // Public teaser title, e.g. "SOMETHING IS COMING"
  description: string; // Teaser hint/copy
  image: string; // Teaser artwork/poster
  city: string; // e.g. "Porto", "Lisboa"
  category: string; // e.g. "Música Eletrónica & Clubbing"
  approximate_date?: string; // e.g. "Outubro 2026" or "Outono 2026"
  reveal_at: string; // ISO DateTime when the event is revealed
  status: TeaserStatus;
  linked_event_id?: string; // Reference to confirmed event once created/revealed
  tracking_count: number; // Users who clicked "Quero saber quando for revelado"
  is_official: boolean; // Always true for verified promoter teasers
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TeaserTracking {
  id: string; // `${user_id}_${teaser_id}`
  user_id: string;
  teaser_id: string;
  created_at: string;
}
