import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Insere um email válido"),
  password: z.string().min(6, "A palavra-passe deve ter pelo menos 6 caracteres"),
  rememberMe: z.boolean().default(true),
});

export const registerSchema = z.object({
  displayName: z.string().min(2, "O teu nome completo é obrigatório"),
  email: z.string().email("Insere um email profissional válido"),
  password: z.string().min(8, "A palavra-passe deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Deves aceitar os termos de serviço",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As palavras-passe não coincidem",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Insere o teu email de registo"),
});

export const onboardingSchema = z.object({
  orgName: z.string().min(3, "O nome da organização deve ter pelo menos 3 caracteres"),
  orgType: z.enum(["PRODUCER", "VENUE", "COLLECTIVE", "FESTIVAL", "AGENCY", "OTHER"]),
  city: z.string().min(2, "Indica a cidade base"),
  website: z.string().url("URL inválido").or(z.literal("")),
  instagram: z.string().min(2, "Insere o handle do Instagram").or(z.literal("")),
  description: z.string().min(10, "Apresenta resumidamente a tua entidade"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;
