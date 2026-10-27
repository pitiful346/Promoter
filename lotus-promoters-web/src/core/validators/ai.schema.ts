import { z } from "zod";

const confidenceFieldSchema = <T extends z.ZodTypeAny>(valueSchema: T) =>
  z.object({
    value: valueSchema.nullable().optional(),
    confidence: z.number().min(0).max(1).optional().default(0),
  }).optional();

export const rawAiPosterExtractionSchema = z.object({
  name: confidenceFieldSchema(z.string()),
  description: confidenceFieldSchema(z.string()),
  category: confidenceFieldSchema(z.string()),
  date: confidenceFieldSchema(z.string()), // e.g. "2026-10-31" or "31/10/2026" or "31 Outubro 2026"
  start_time: confidenceFieldSchema(z.string()), // e.g. "23:00"
  end_time: confidenceFieldSchema(z.string()), // e.g. "06:00"
  city: confidenceFieldSchema(z.string()),
  venue: confidenceFieldSchema(z.string()),
  address: confidenceFieldSchema(z.string()),
  artists: confidenceFieldSchema(z.array(z.string())),
  is_free: confidenceFieldSchema(z.boolean()),
  price_min: confidenceFieldSchema(z.number()),
  ticket_url: confidenceFieldSchema(z.string()),
  age_restriction: confidenceFieldSchema(z.string()),
  dress_code: confidenceFieldSchema(z.string()),
  organizer: confidenceFieldSchema(z.string()),
  social_links: confidenceFieldSchema(z.array(z.string())),
});

export type RawAiPosterExtraction = z.infer<typeof rawAiPosterExtractionSchema>;
