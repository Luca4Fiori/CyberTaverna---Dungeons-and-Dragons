import { z } from "zod";
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email());
export const passwordSchema = z
  .string()
  .min(12, "Use pelo menos 12 caracteres.")
  .max(128);
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    displayName: z.string().trim().min(2).max(80),
  })
  .strict();
export const loginSchema = z
  .object({ email: emailSchema, password: z.string().min(1).max(128) })
  .strict();
export const forgotSchema = z.object({ email: emailSchema }).strict();
export const resetSchema = z
  .object({
    token: z.string().regex(/^[a-f0-9]{64}$/),
    password: passwordSchema,
  })
  .strict();
export const profileSchema = z
  .object({
    displayName: z.string().trim().min(2).max(80),
    timezone: z
      .string()
      .max(80)
      .refine((value) => {
        try {
          new Intl.DateTimeFormat("pt-BR", { timeZone: value });
          return true;
        } catch {
          return false;
        }
      }, "Fuso horário inválido."),
  })
  .strict();
export const campaignSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(10000).default(""),
  })
  .strict();
export const campaignUpdateSchema = campaignSchema.extend({
  archived: z.boolean().optional(),
});
export const inviteSchema = z
  .object({
    expiresInHours: z.number().int().min(1).max(720).default(168),
    maxUses: z.number().int().min(1).max(100).nullable().default(1),
  })
  .strict();
export const acceptInviteSchema = z
  .object({ token: z.string().regex(/^[a-f0-9]{64}$/) })
  .strict();
export const idSchema = z.uuid();
