import type { Database } from "./auth";
import { membership, lockCampaign, requireActive } from "./campaigns";
import { DomainError, unavailable } from "./errors";
import {
  gameSessionSchema,
  sessionStatusSchema,
  joinGameSessionSchema,
} from "../../contracts/src/game-sessions";
import { idSchema } from "../../contracts/src/core";
export function createGameSessionService(db: Database) {
  return {
    async list(token: string | undefined, campaignId: string) {
      await membership(db, token, campaignId);
      return db.gameSession.findMany({
        where: { campaignId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    },
    async create(
      token: string | undefined,
      campaignId: string,
      input: unknown,
    ) {
      const data = gameSessionSchema.parse(input);
      return db.$transaction(async (tx) => {
        await lockCampaign(tx, campaignId);
        const { user, member } = await membership(tx, token, campaignId, true);
        requireActive(member.campaign.archivedAt);
        const session = await tx.gameSession.create({
          data: { ...data, campaignId },
        });
        await tx.auditLog.create({
          data: {
            actorId: user.id,
            campaignId,
            entityId: session.id,
            action: "game-session.create",
          },
        });
        return session;
      });
    },
    async get(token: string | undefined, campaignId: string, id: string) {
      idSchema.parse(id);
      const { member, user } = await membership(db, token, campaignId);
      const session = await db.gameSession.findFirst({
        where: { campaignId, id },
        include: {
          participants: {
            select: {
              userId: true,
              joinedAt: true,
              member: {
                select: { role: true, user: { select: { displayName: true } } },
              },
              character: { select: { id: true, name: true } },
            },
            orderBy: { joinedAt: "asc" },
            take: 100,
          },
        },
      });
      if (!session) throw unavailable();
      return {
        ...session,
        role: member.role,
        userId: user.id,
        archived: Boolean(member.campaign.archivedAt),
      };
    },
    async join(
      token: string | undefined,
      campaignId: string,
      id: string,
      input: unknown,
    ) {
      idSchema.parse(id);
      const { characterId } = joinGameSessionSchema.parse(input);
      return db.$transaction(async (tx) => {
        await lockCampaign(tx, campaignId);
        const { user, member } = await membership(tx, token, campaignId);
        requireActive(member.campaign.archivedAt);
        const session = await tx.gameSession.findFirst({
          where: { id, campaignId },
        });
        if (!session) throw unavailable();
        if (!["PLANNED", "ACTIVE"].includes(session.status))
          throw new DomainError(
            409,
            "SESSION_CLOSED",
            "Esta sessão está encerrada ou cancelada.",
          );
        if (member.role === "PLAYER" && !characterId)
          throw new DomainError(
            400,
            "CHARACTER_REQUIRED",
            "Escolha um personagem seu para participar.",
          );
        if (
          characterId &&
          !(await tx.character.findFirst({
            where: {
              id: characterId,
              campaignId,
              ...(member.role === "GM" ? {} : { ownerId: user.id }),
            },
          }))
        )
          throw new DomainError(
            403,
            "INVALID_CHARACTER",
            "Este personagem não está autorizado para sua participação.",
          );
        await tx.gameSessionParticipant.upsert({
          where: {
            campaignId_sessionId_userId: {
              campaignId,
              sessionId: id,
              userId: user.id,
            },
          },
          create: { campaignId, sessionId: id, userId: user.id, characterId },
          update: { characterId },
        });
        await tx.auditLog.create({
          data: {
            actorId: user.id,
            campaignId,
            entityId: id,
            action: "game-session.join",
          },
        });
        return { sessionId: id };
      });
    },
    async status(
      token: string | undefined,
      campaignId: string,
      id: string,
      input: unknown,
    ) {
      idSchema.parse(id);
      const data = sessionStatusSchema.parse(input);
      return db.$transaction(async (tx) => {
        await lockCampaign(tx, campaignId);
        const { user, member } = await membership(tx, token, campaignId, true);
        requireActive(member.campaign.archivedAt);
        const result = await tx.gameSession.updateMany({
          where: { id, campaignId },
          data,
        });
        if (!result.count) throw unavailable();
        await tx.auditLog.create({
          data: {
            actorId: user.id,
            campaignId,
            entityId: id,
            action: "game-session.status",
            metadata: data,
          },
        });
        return { ok: true };
      });
    },
  };
}
