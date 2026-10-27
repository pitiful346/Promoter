import { Coordinates } from "./event";

export interface Venue {
  id: string;
  organization_id: string;
  name: string;
  address: string;
  city: string;
  coordenadas?: Coordinates;
  capacity?: number;
  photo_url?: string;
  contact_phone?: string;
  contact_email?: string;
  created_at: string;
}
