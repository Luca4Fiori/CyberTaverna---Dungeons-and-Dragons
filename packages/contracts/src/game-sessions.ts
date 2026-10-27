import { z } from "zod";
export const gameSessionSchema = z
  .object({
    title: z.string().trim().min(2).max(120),
    description: z.string().trim().max(10000).default(""),
  })
  .strict();
export const sessionStatusSchema = z
  .object({ status: z.enum(["PLANNED", "ACTIVE", "FINISHED", "CANCELLED"]) })
  .strict();
export const joinGameSessionSchema = z
  .object({ characterId: z.uuid().nullable().default(null) })
  .strict();
