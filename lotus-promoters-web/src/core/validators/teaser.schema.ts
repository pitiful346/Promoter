import { z } from "zod";

export const teaserSchema = z.object({
  codename: z.string().min(2, "O codename interno deve ter pelo menos 2 caracteres"),
  title: z.string().optional(),
  description: z.string().min(10, "Adiciona uma descrição ou pista teaser com pelo menos 10 caracteres"),
  image: z.string().min(1, "A imagem teaser é obrigatória"),
  city: z.string().min(2, "Indica a cidade ou região aproximada"),
  category: z.string().min(2, "Seleciona a categoria principal"),
  approximate_date: z.string().optional(),
  reveal_at: z.string().min(10, "Define a data e hora exata para o reveal do evento"),
  linked_event_id: z.string().optional(),
});

export type TeaserFormData = z.infer<typeof teaserSchema>;
