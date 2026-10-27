import { z } from "zod";

export const eventSourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  type: z.enum([
    "PARTNER_API",
    "PUBLIC_API",
    "RSS_FEED",
    "ICAL",
    "STRUCTURED_WEB",
    "MANUAL_IMPORT",
  ]),
  domain: z.string().min(3),
  url: z.string().url(),
  ingestion_method: z.string().min(1),
  status: z.enum(["ACTIVE", "PAUSED", "ERROR"]),
  priority: z.number().int().min(1).max(100),
  trust_level: z.number().min(0).max(1),
  city: z.string().min(2),
  last_sync_at: z.string().optional(),
  sync_interval_hours: z.number().optional().default(24),
  config: z.record(z.string(), z.unknown()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const rawIngestedEventSchema = z.object({
  external_id: z.string().min(1),
  source_id: z.string().min(1),
  source_url: z.string().min(1),
  fetched_at: z.string(),
  payload: z.record(z.string(), z.unknown()),
});

export const extractedEventDraftSchema = z.object({
  external_id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  start_date: z.string().min(1), // ISO format
  end_date: z.string().optional(),
  venue_name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  coordenadas: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  organizer_name: z.string().optional(),
  artists: z.array(z.string()).optional(),
  image_url: z.string().optional(),
  is_free: z.boolean().optional().default(false),
  price_min: z.number().optional(),
  price_max: z.number().optional(),
  ticket_url: z.string().optional(),
  source_url: z.string().min(1),
  age_restriction: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["SCHEDULED", "CANCELLED", "POSTPONED"]).optional().default("SCHEDULED"),
});

export type ExtractedEventDraftInput = z.infer<typeof extractedEventDraftSchema>;
