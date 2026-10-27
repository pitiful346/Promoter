export type MemberRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
export type MemberStatus = "ACTIVE" | "PENDING_INVITE";

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id?: string;
  email: string;
  display_name?: string;
  role: MemberRole;
  status: MemberStatus;
  joined_at?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  banner_url?: string;
  description?: string;
  city?: string;
  country?: string;
  website?: string;
  instagram?: string;
  tiktok?: string;
  twitter_x?: string;
  spotify?: string;
  youtube?: string;
  categories: string[];
  is_verified: boolean;
  followers_count?: number;
  public_profile_enabled: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const PROMOTER_CATEGORIES = [
  "Música Eletrónica & Clubbing",
  "Festivais & Grandes Eventos",
  "Hip-Hop & R&B",
  "Rock & Indie",
  "Jazz, Soul & Funk",
  "Artes Visuais & Exposições",
  "Teatro, Comédia & Performance",
  "Gastronomia, Vinhos & Mercados",
  "Comunidade & Cultura Urbana",
] as const;
