import type { Database, Transaction } from "./auth";
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
} from "../../database/generated/client/client";
type StoredCharacter = Character & { attributes: CharacterAttribute[] };
function sheet(character: StoredCharacter, canEdit: boolean): CharacterSheet {
  const attributes = { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 };
  for (const ability of abilityKeys)
    attributes[ability] =
      character.attributes.find((item) => item.ability === ability)?.score ??
      10;
  const modifiers = { ...attributes };
  for (const ability of abilityKeys)
    modifiers[ability] = abilityModifier(attributes[ability]);
  return {
    id: character.id,
    campaignId: character.campaignId,
    ownerId: character.ownerId,
    name: character.name,
    className: character.className,
    species: character.species,
    level: character.level,
    experience: character.experience,
    hitPoints: character.hitPoints,
    maxHitPoints: character.maxHitPoints,
    temporaryHitPoints: character.temporaryHitPoints,
    armorClass: character.armorClass,
    attributes,
    modifiers,
    proficiency: proficiencyBonus(character.level),
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
        include: { attributes: true },
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
        include: { attributes: true },
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
        const character = await tx.character.create({
          data: {
            ...data,
            campaignId,
            ownerId,
            attributes: {
              create: abilityKeys.map((ability) => ({
                ability,
                score: attributes[ability],
              })),
            },
          },
          include: { attributes: true },
        });
        await tx.characterHistory.create({
          data: {
            characterId: character.id,
            actorId: user.id,
            version: 0,
            changes: { after: { ...data, ownerId, attributes } },
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
          include: { attributes: true },
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
        const changed = await tx.character.update({
          where: { id },
          data: {
            ...data,
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
          include: { attributes: true },
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
              after: { ...data, ownerId, attributes },
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
