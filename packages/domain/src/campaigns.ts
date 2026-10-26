import {
  campaignSchema,
  campaignUpdateSchema,
  inviteSchema,
  acceptInviteSchema,
  idSchema,
} from "../../contracts/src/core";
import { type Database, type Transaction, sessionUser } from "./auth";
import { DomainError, unavailable } from "./errors";
import { newToken, tokenHash } from "./security";

async function membership(
  tx: Database | Transaction,
  token: string | undefined,
  campaignId: string,
  gm = false,
) {
  idSchema.parse(campaignId);
  const user = await sessionUser(tx, token);
  const member = await tx.campaignMember.findUnique({
    where: { campaignId_userId: { campaignId, userId: user.id } },
    include: { campaign: true },
  });
  if (!member) throw unavailable();
  if (gm && member.role !== "GM")
    throw new DomainError(
      403,
      "FORBIDDEN",
      "Somente o mestre desta campanha pode realizar esta ação.",
    );
  return { user, member };
}
async function lockCampaign(tx: Transaction, campaignId: string) {
  idSchema.parse(campaignId);
  await tx.$queryRaw`SELECT id FROM "Campaign" WHERE id = ${campaignId}::uuid FOR UPDATE`;
}
function requireActive(archivedAt: Date | null) {
  if (archivedAt)
    throw new DomainError(409, "ARCHIVED", "Esta campanha está arquivada.");
}
export function createCampaignService(db: Database) {
  return {
    async list(token: string | undefined, page = 1) {
      const user = await sessionUser(db, token);
      return db.campaignMember.findMany({
        where: { userId: user.id },
        select: {
          role: true,
          campaign: {
            select: {
              id: true,
              name: true,
              description: true,
              archivedAt: true,
            },
          },
        },
        orderBy: { joinedAt: "desc" },
        take: 20,
        skip: (page - 1) * 20,
      });
    },
    async create(token: string | undefined, input: unknown) {
      const data = campaignSchema.parse(input);
      return db.$transaction(async (tx) => {
        const user = await sessionUser(tx, token);
        const campaign = await tx.campaign.create({
          data: {
            ...data,
            settings: { create: {} },
            members: { create: { userId: user.id, role: "GM" } },
          },
        });
        await tx.auditLog.create({
          data: {
            actorId: user.id,
            campaignId: campaign.id,
            action: "campaign.create",
          },
        });
        return campaign;
      });
    },
    async detail(token: string | undefined, id: string) {
      const { member } = await membership(db, token, id);
      const members = await db.campaignMember.findMany({
        where: { campaignId: id },
        select: {
          userId: true,
          role: true,
          user: { select: { displayName: true } },
        },
        orderBy: { joinedAt: "asc" },
        take: 100,
      });
      // Não serializar convites, emails de terceiros, notas ou segredos.
      return { ...member.campaign, role: member.role, members };
    },
    async update(token: string | undefined, id: string, input: unknown) {
      const { archived, ...data } = campaignUpdateSchema.parse(input);
      return db.$transaction(async (tx) => {
        await lockCampaign(tx, id);
        const { user, member } = await membership(tx, token, id, true);
        const campaign = await tx.campaign.update({
          where: { id },
          data: {
            ...data,
            ...(archived === undefined
              ? {}
              : {
                  archivedAt: archived
                    ? (member.campaign.archivedAt ?? new Date())
                    : null,
                }),
          },
        });
        if (archived)
          await tx.campaignInvite.updateMany({
            where: { campaignId: id, revokedAt: null },
            data: { revokedAt: new Date() },
          });
        await tx.auditLog.create({
          data: {
            actorId: user.id,
            campaignId: id,
            action: archived ? "campaign.archive" : "campaign.update",
          },
        });
        return campaign;
      });
    },
    async invites(token: string | undefined, id: string) {
      await membership(db, token, id, true);
      return db.campaignInvite.findMany({
        where: { campaignId: id },
        select: {
          id: true,
          expiresAt: true,
          revokedAt: true,
          maxUses: true,
          useCount: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
    },
    async invite(token: string | undefined, id: string, input: unknown) {
      const data = inviteSchema.parse(input);
      const inviteToken = newToken();
      return db.$transaction(async (tx) => {
        await lockCampaign(tx, id);
        const { user, member } = await membership(tx, token, id, true);
        requireActive(member.campaign.archivedAt);
        const invite = await tx.campaignInvite.create({
          data: {
            campaignId: id,
            tokenHash: tokenHash(inviteToken),
            expiresAt: new Date(Date.now() + data.expiresInHours * 3600000),
            maxUses: data.maxUses,
          },
          select: { id: true, expiresAt: true },
        });
        await tx.auditLog.create({
          data: {
            actorId: user.id,
            campaignId: id,
            entityId: invite.id,
            action: "invite.create",
          },
        });
        return { ...invite, token: inviteToken };
      });
    },
    async revoke(token: string | undefined, id: string, inviteId: string) {
      idSchema.parse(inviteId);
      await db.$transaction(async (tx) => {
        await lockCampaign(tx, id);
        const { user } = await membership(tx, token, id, true);
        const result = await tx.campaignInvite.updateMany({
          where: { id: inviteId, campaignId: id },
          data: { revokedAt: new Date() },
        });
        if (!result.count) throw unavailable();
        await tx.auditLog.create({
          data: {
            actorId: user.id,
            campaignId: id,
            entityId: inviteId,
            action: "invite.revoke",
          },
        });
      });
    },
    async accept(token: string | undefined, input: unknown) {
      const data = acceptInviteSchema.parse(input);
      const invalidInvite = () =>
        new DomainError(
          400,
          "INVALID_INVITE",
          "Convite inválido, expirado, revogado ou esgotado.",
        );
      return db.$transaction(async (tx) => {
        const user = await sessionUser(tx, token);
        const candidate = await tx.campaignInvite.findUnique({
          where: { tokenHash: tokenHash(data.token) },
        });
        if (!candidate) throw invalidInvite();
        // Todas as operações de convite/arquivo seguem a mesma ordem de lock.
        await lockCampaign(tx, candidate.campaignId);
        const invite = await tx.campaignInvite.findUniqueOrThrow({
          where: { id: candidate.id },
          include: { campaign: true },
        });
        if (
          invite.revokedAt ||
          invite.expiresAt <= new Date() ||
          invite.campaign.archivedAt
        )
          throw invalidInvite();
        const existing = await tx.campaignMember.findUnique({
          where: {
            campaignId_userId: {
              campaignId: invite.campaignId,
              userId: user.id,
            },
          },
        });
        if (existing) return { campaignId: invite.campaignId }; // Repetição não consome uso nem rebaixa GM.
        if (invite.maxUses !== null && invite.useCount >= invite.maxUses)
          throw invalidInvite();
        await tx.campaignMember.create({
          data: {
            campaignId: invite.campaignId,
            userId: user.id,
            role: "PLAYER",
          },
        });
        await tx.campaignInvite.update({
          where: { id: invite.id },
          data: { useCount: { increment: 1 } },
        });
        await tx.auditLog.create({
          data: {
            actorId: user.id,
            campaignId: invite.campaignId,
            action: "invite.accept",
          },
        });
        return { campaignId: invite.campaignId };
      });
    },
  };
}
