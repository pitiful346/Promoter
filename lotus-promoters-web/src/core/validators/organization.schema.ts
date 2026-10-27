import { z } from "zod";

export const organizationProfileSchema = z.object({
  name: z.string().min(2, "O nome da organização deve ter pelo menos 2 caracteres"),
  slug: z.string().min(2, "O slug público deve ter pelo menos 2 caracteres").regex(/^[a-z0-9-]+$/, "O slug só pode conter letras minúsculas, números e hífens"),
  description: z.string().min(10, "Apresenta uma bio pública com pelo menos 10 caracteres"),
  city: z.string().min(2, "Indica a cidade base da entidade"),
  logo_url: z.string().url("URL do logótipo inválido").or(z.literal("")),
  banner_url: z.string().url("URL da capa/banner inválido").or(z.literal("")),
  website: z.string().url("Insere um URL de website válido (https://...)").or(z.literal("")),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  twitter_x: z.string().optional(),
  spotify: z.string().optional(),
  youtube: z.string().optional(),
  categories: z.array(z.string()).min(1, "Seleciona pelo menos 1 categoria principal"),
  public_profile_enabled: z.boolean().default(true),
});

export type OrganizationProfileFormData = z.infer<typeof organizationProfileSchema>;
