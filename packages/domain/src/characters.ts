import type { Database, Transaction } from "./auth";
import { sessionUser } from "./auth";
import { normalizeClasses } from "./multiclass";
import { membership, lockCampaign, requireActive } from "./campaigns";
import { DomainError, unavailable } from "./errors";
import {
  abilityKeys,
  createCharacterSchema,
  updateCharacterSchema,
  characterSettingsSchema,
  type CharacterSheet,
} from "../../contracts/src/characters";
import { idSchema } from "../../contracts/src/core";
import { abilityModifier, proficiencyBonus } from "../../rules/src/index";
import type {
  Character,
  CharacterAttribute,
  CharacterClass,
} from "../../database/generated/client/client";
type StoredCharacter = Character & {
  attributes: CharacterAttribute[];
  classes: CharacterClass[];
};
function sheet(character: StoredCharacter, canEdit: boolean): CharacterSheet {
  const attributes = { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 };
  for (const ability of abilityKeys)
    attributes[ability] =
      character.attributes.find((item) => item.ability === ability)?.score ??
      10;
  const modifiers = { ...attributes };
  for (const ability of abilityKeys)
    modifiers[ability] = abilityModifier(attributes[ability]);
  const level = character.classes.reduce((sum, row) => sum + row.level, 0);
  return {
    classes: character.classes
      .sort((a, b) => a.position - b.position)
      .map((row) => ({
        classId: row.classId,
        className: row.className,
        subclassId: row.subclassId,
        subclassName: row.subclassName,
        level: row.level,
        sourceId: row.sourceId,
        subclassSourceId: row.subclassSourceId,
        acquisitionLevels: row.acquisitionLevels,
        rulesVersion: row.rulesVersion as "2024" | "2014" | "custom",
      })),
    multiclassAdjustment: character.multiclassAdjustment,
    portraitUrl: character.portraitUrl,
    biography: character.biography,
    id: character.id,
    campaignId: character.campaignId,
    ownerId: character.ownerId,
    name: character.name,
    className: character.className,
    species: character.species,
    classId: character.classId,
    speciesId: character.speciesId,
    backgroundId: character.backgroundId,
    subclassId: character.subclassId,
    backgroundName: character.backgroundName,
    subclassName: character.subclassName,
    level,
    experience: character.experience,
    hitPoints: character.hitPoints,
    maxHitPoints: character.maxHitPoints,
    temporaryHitPoints: character.temporaryHitPoints,
    armorClass: character.armorClass,
    attributes,
    modifiers,
    proficiency: proficiencyBonus(level),
    version: character.version,
    canEdit,
  };
}
async function settings(tx: Database | Transaction, campaignId: string) {
  return (
    (await tx.campaignSettings.findUnique({ where: { campaignId } })) ?? {
      playersCanCreateCharacters: true,
      playersCanEditCharacters: true,
    }
  );
}
async function owner(
  tx: Transaction,
  campaignId: string,
  actorId: string,
  role: string,
  requested?: string,
) {
  const ownerId = requested ?? actorId;
  if (role !== "GM" && ownerId !== actorId)
    throw new DomainError(
      403,
      "FORBIDDEN",
      "Você só pode criar ou editar sua própria ficha.",
    );
  if (
    !(await tx.campaignMember.findUnique({
      where: { campaignId_userId: { campaignId, userId: ownerId } },
    }))
  )
    throw new DomainError(
      400,
      "INVALID_OWNER",
      "O responsável precisa participar desta campanha.",
    );
  return ownerId;
}
export function createCharacterService(db: Database) {
  return {
    async mine(token: string | undefined, page = 1) {
      const user = await sessionUser(db, token);
      return db.character.findMany({
        where: {
          ownerId: user.id,
          campaign: { members: { some: { userId: user.id } } },
        },
        select: {
          id: true,
          name: true,
          campaignId: true,
          className: true,
          species: true,
          level: true,
          campaign: { select: { name: true, archivedAt: true } },
        },
        orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
        take: 20,
        skip: (page - 1) * 20,
      });
    },
    async eligible(token: string | undefined, campaignId: string, query = "") {
      const { user, member } = await membership(db, token, campaignId);
      return db.character.findMany({
        where: {
          campaignId,
          ...(member.role === "GM" ? {} : { ownerId: user.id }),
          name: { contains: query.slice(0, 120), mode: "insensitive" },
        },
        select: { id: true, name: true },
        orderBy: [{ name: "asc" }, { id: "asc" }],
        take: 20,
      });
    },

    async policy(token: string | undefined, campaignId: string) {
      const { user, member } = await membership(db, token, campaignId);
      const policy = await settings(db, campaignId);
      return {
        userId: user.id,
        isGM: member.role === "GM",
        archived: Boolean(member.campaign.archivedAt),
        ...policy,
      };
    },
    async configure(
      token: string | undefined,
      campaignId: string,
      input: unknown,
    ) {
      const data = characterSettingsSchema.parse(input);
      return db.$transaction(async (tx) => {
        await lockCampaign(tx, campaignId);
        const { user, member } = await membership(tx, token, campaignId, true);
        requireActive(member.campaign.archivedAt);
        const updated = await tx.campaignSettings.upsert({
          where: { campaignId },
          create: { campaignId, ...data },
          update: data,
        });
        await tx.auditLog.create({
          data: {
            actorId: user.id,
            campaignId,
            action: "campaign.character-permissions.update",
          },
        });
        return {
          playersCanCreateCharacters: updated.playersCanCreateCharacters,
          playersCanEditCharacters: updated.playersCanEditCharacters,
        };
      });
    },
    async list(token: string | undefined, campaignId: string, page = 1) {
      const { user, member } = await membership(db, token, campaignId);
      const policy = await settings(db, campaignId);
      const rows = await db.character.findMany({
        where: {
          campaignId,
          ...(member.role === "GM" ? {} : { ownerId: user.id }),
        },
        include: { attributes: true, classes: true },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: 20,
        skip: (page - 1) * 20,
      });
      return rows.map((row) =>
        sheet(
          row,
          !member.campaign.archivedAt &&
            (member.role === "GM" || policy.playersCanEditCharacters),
        ),
      );
    },
    async get(token: string | undefined, campaignId: string, id: string) {
      idSchema.parse(id);
      const { user, member } = await membership(db, token, campaignId);
      const character = await db.character.findFirst({
        where: {
          id,
          campaignId,
          ...(member.role === "GM" ? {} : { ownerId: user.id }),
        },
        include: { attributes: true, classes: true },
      });
      if (!character) throw unavailable();
      const policy = await settings(db, campaignId);
      return sheet(
        character,
        !member.campaign.archivedAt &&
          (member.role === "GM" || policy.playersCanEditCharacters),
      );
    },
    async create(
      token: string | undefined,
      campaignId: string,
      input: unknown,
    ) {
      const {
        attributes,
        ownerId: requested,
        ...data
      } = createCharacterSchema.parse(input);
      return db.$transaction(async (tx) => {
        await lockCampaign(tx, campaignId);
        const { user, member } = await membership(tx, token, campaignId);
        requireActive(member.campaign.archivedAt);
        const policy = await settings(tx, campaignId);
        if (member.role !== "GM" && !policy.playersCanCreateCharacters)
          throw new DomainError(
            403,
            "CHARACTERS_LOCKED",
            "O mestre desativou a criação de personagens pelos jogadores.",
          );
        const ownerId = await owner(
          tx,
          campaignId,
          user.id,
          member.role,
          requested,
        );
        const { classes, ...normalized } = normalizeClasses(
          { ...data, attributes },
          member.role === "GM",
        );
        const fields = { ...data };
        delete fields.classes;
        const character = await tx.character.create({
          data: {
            ...fields,
            ...normalized,
            classes: {
              create: classes.map((row, position) => ({ ...row, position })),
            },
            campaignId,
            ownerId,
            attributes: {
              create: abilityKeys.map((ability) => ({
                ability,
                score: attributes[ability],
              })),
            },
          },
          include: { attributes: true, classes: true },
        });
        await tx.characterHistory.create({
          data: {
            characterId: character.id,
            actorId: user.id,
            version: 0,
            changes: { after: sheet(character, false) },
          },
        });
        await tx.auditLog.create({
          data: {
            actorId: user.id,
            campaignId,
            entityId: character.id,
            action: "character.create",
          },
        });
        return sheet(
          character,
          member.role === "GM" || policy.playersCanEditCharacters,
        );
      });
    },
    async update(
      token: string | undefined,
      campaignId: string,
      id: string,
      input: unknown,
    ) {
      idSchema.parse(id);
      const {
        expectedVersion,
        attributes,
        ownerId: requested,
        ...data
      } = updateCharacterSchema.parse(input);
      return db.$transaction(async (tx) => {
        await lockCampaign(tx, campaignId);
        const { user, member } = await membership(tx, token, campaignId);
        requireActive(member.campaign.archivedAt);
        const before = await tx.character.findFirst({
          where: { campaignId, id },
          include: { attributes: true, classes: true },
        });
        if (!before) throw unavailable();
        const policy = await settings(tx, campaignId);
        if (
          member.role !== "GM" &&
          (before.ownerId !== user.id || !policy.playersCanEditCharacters)
        )
          throw new DomainError(
            403,
            "FORBIDDEN",
            "Você não tem permissão para editar esta ficha.",
          );
        if (before.version !== expectedVersion)
          throw new DomainError(
            409,
            "VERSION_CONFLICT",
            "A ficha foi alterada por outra pessoa. Recarregue antes de salvar.",
          );
        const ownerId = await owner(
          tx,
          campaignId,
          user.id,
          member.role,
          requested ?? before.ownerId,
        );
        const { classes, ...normalized } = normalizeClasses(
          {
            ...sheet(before, false),
            ...data,
            classes: data.classes,
            attributes,
          },
          member.role === "GM",
          sheet(before, false),
        );
        const fields = { ...data };
        delete fields.classes;
        const changed = await tx.character.update({
          where: { id },
          data: {
            ...fields,
            ...normalized,
            classes: {
              deleteMany: {},
              create: classes.map((row, position) => ({ ...row, position })),
            },
            ownerId,
            version: { increment: 1 },
            attributes: {
              deleteMany: {},
              create: abilityKeys.map((ability) => ({
                ability,
                score: attributes[ability],
              })),
            },
          },
          include: { attributes: true, classes: true },
        });
        if (ownerId !== before.ownerId)
          await tx.gameSessionParticipant.updateMany({
            where: { campaignId, characterId: id },
            data: { characterId: null },
          });
        await tx.characterHistory.create({
          data: {
            characterId: id,
            actorId: user.id,
            version: changed.version,
            changes: {
              before: sheet(before, false),
              after: sheet(changed, false),
            },
          },
        });
        await tx.auditLog.create({
          data: {
            actorId: user.id,
            campaignId,
            entityId: id,
            action: "character.update",
          },
        });
        return sheet(changed, true);
      });
    },
  };
}
