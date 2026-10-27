import { z } from "zod";
export const abilityKeys = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;
export type Ability = (typeof abilityKeys)[number];
export const abilityLabels: Record<Ability, string> = {
  STR: "Força",
  DEX: "Destreza",
  CON: "Constituição",
  INT: "Inteligência",
  WIS: "Sabedoria",
  CHA: "Carisma",
};
const score = z.number().int().min(1).max(30);
export const attributesSchema = z
  .object({
    STR: score,
    DEX: score,
    CON: score,
    INT: score,
    WIS: score,
    CHA: score,
  })
  .strict();
export const characterFieldsSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    className: z.string().trim().min(1).max(80),
    species: z.string().trim().min(1).max(80),
    level: z.number().int().min(1).max(20),
    experience: z.number().int().min(0).max(2000000000),
    hitPoints: z.number().int().min(0).max(100000),
    maxHitPoints: z.number().int().min(1).max(100000),
    temporaryHitPoints: z.number().int().min(0).max(100000),
    armorClass: z.number().int().min(0).max(100),
    attributes: attributesSchema,
    ownerId: z.uuid().optional(),
  })
  .strict();
const validHP = (data: { hitPoints: number; maxHitPoints: number }) =>
  data.hitPoints <= data.maxHitPoints;
export const createCharacterSchema = characterFieldsSchema.refine(validHP, {
  path: ["hitPoints"],
  message: "PV atuais não podem ultrapassar os máximos.",
});
export const updateCharacterSchema = characterFieldsSchema
  .extend({ expectedVersion: z.number().int().nonnegative() })
  .refine(validHP, {
    path: ["hitPoints"],
    message: "PV atuais não podem ultrapassar os máximos.",
  });
export type CharacterInput = z.infer<typeof characterFieldsSchema>;
export type CharacterSheet = Omit<CharacterInput, "ownerId"> & {
  id: string;
  ownerId: string;
  campaignId: string;
  version: number;
  modifiers: Record<Ability, number>;
  proficiency: number;
  canEdit: boolean;
};
export const characterSettingsSchema = z
  .object({
    playersCanCreateCharacters: z.boolean(),
    playersCanEditCharacters: z.boolean(),
  })
  .strict();
