import { z } from "zod";

export const eventSchema = z.object({
  name: z.string().min(3, "O nome do evento deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  venue_name: z.string().min(2, "Indica o nome do local ou recinto"),
  location: z.string().min(2, "Indica a cidade / morada do evento"),
  image: z.string().min(1, "O poster principal é obrigatório"),
  start_date: z.string().min(1, "A data e hora de início são obrigatórias"),
  end_date: z.string().optional(),
  price_min: z.number().min(0, "O preço mínimo não pode ser negativo").default(0),
  is_free: z.boolean().default(false),
  ticket_status: z.enum(["AVAILABLE", "SOLD_OUT", "SOON", "CANCELLED"]).default("AVAILABLE"),
  ticket_url: z.string().url("Insere um URL de bilhetes válido").or(z.literal("")),
  categoria: z.array(z.string()).min(1, "Seleciona pelo menos uma categoria"),
  status: z.enum(["DRAFT", "SUBMITTED", "PUBLISHED", "CANCELLED", "REJECTED", "ARCHIVED"]).default("DRAFT"),
});

export type EventFormData = z.infer<typeof eventSchema>;
