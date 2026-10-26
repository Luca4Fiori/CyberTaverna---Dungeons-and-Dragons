import { z } from "zod";
export const campaignRoleSchema = z.enum(["GM", "PLAYER"]);
export type CampaignRole = z.infer<typeof campaignRoleSchema>;
export const joinSessionSchema = z
  .object({
    campaignId: z.uuid(),
    sessionId: z.uuid(),
  })
  .strict();
export const moveTokenSchema = joinSessionSchema
  .extend({
    tokenId: z.uuid(),
    x: z.number().finite().min(-100000).max(100000),
    y: z.number().finite().min(-100000).max(100000),
    expectedVersion: z.number().int().nonnegative(),
  })
  .strict();
export const realtimeEnvironmentSchema = z.object({
  WEB_ORIGIN: z
    .url()
    .refine(
      (value) => new URL(value).origin === value,
      "Use uma origem sem caminho ou barra final",
    ),
  REALTIME_PORT: z.coerce.number().int().min(1).max(65535).default(3001),
});
