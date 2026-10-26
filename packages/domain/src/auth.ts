import type {
  PrismaClient,
  Prisma,
} from "../../database/generated/client/client";
import {
  registerSchema,
  loginSchema,
  forgotSchema,
  resetSchema,
  profileSchema,
} from "../../contracts/src/core";
import { hashPassword, verifyPassword, newToken, tokenHash } from "./security";
import { DomainError, unauthenticated } from "./errors";
export type Database = PrismaClient;
export type Transaction = Prisma.TransactionClient;
export type RecoveryMailer = (email: string, token: string) => Promise<void>;
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const invalidLogin = () =>
  new DomainError(401, "INVALID_CREDENTIALS", "Email ou senha inválidos.");
const invalidReset = () =>
  new DomainError(
    400,
    "INVALID_RESET",
    "Link inválido, expirado ou já utilizado.",
  );
let dummyHash: Promise<string> | undefined;
export async function sessionUser(
  db: Database | Transaction,
  token: string | undefined,
) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) throw unauthenticated();
  const session = await db.session.findUnique({
    where: { tokenHash: tokenHash(token) },
    include: { user: { include: { profile: true } } },
  });
  if (!session || session.expiresAt <= new Date() || session.user.suspendedAt)
    throw unauthenticated();
  const { user } = session;
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    timezone: user.profile?.timezone ?? "America/Sao_Paulo",
  };
}
export async function consumeRateLimit(
  db: Database,
  scope: string,
  identity: string,
  limit: number,
  windowMs: number,
) {
  const now = Date.now();
  const key = `${scope}:${tokenHash(identity)}:${Math.floor(now / windowMs)}`;
  const bucket = await db.rateLimitBucket.upsert({
    where: { key },
    create: { key, count: 1, expiresAt: new Date(now + windowMs) },
    update: { count: { increment: 1 } },
  });
  if (bucket.count > limit)
    throw new DomainError(
      429,
      "RATE_LIMIT",
      "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
    );
}
export function createAuthService(db: Database, sendRecovery?: RecoveryMailer) {
  return {
    async register(input: unknown) {
      const data = registerSchema.parse(input);
      const passwordHash = await hashPassword(data.password);
      try {
        const user = await db.$transaction(async (tx) => {
          const created = await tx.user.create({
            data: {
              email: data.email,
              displayName: data.displayName,
              passwordHash,
              profile: { create: {} },
            },
            select: { id: true },
          });
          await tx.auditLog.create({
            data: { actorId: created.id, action: "user.register" },
          });
          return created;
        });
        return user;
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2002"
        )
          throw new DomainError(
            409,
            "REGISTER_FAILED",
            "Não foi possível cadastrar. Tente entrar ou recuperar sua conta.",
          );
        throw error;
      }
    },
    async login(input: unknown, previousToken?: string) {
      const data = loginSchema.parse(input);
      const user = await db.user.findUnique({ where: { email: data.email } });
      dummyHash ??= hashPassword(newToken());
      const valid = await verifyPassword(
        user?.passwordHash ?? (await dummyHash),
        data.password,
      );
      if (!user || !valid || user.suspendedAt) throw invalidLogin();
      const token = newToken();
      const expiresAt = new Date(Date.now() + SESSION_MS);
      await db.$transaction(async (tx) => {
        // Serializa login e recuperação para não criar sessão com senha já revogada.
        await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${user.id}::uuid FOR UPDATE`;
        const current = await tx.user.findUniqueOrThrow({
          where: { id: user.id },
        });
        if (current.passwordHash !== user.passwordHash || current.suspendedAt)
          throw invalidLogin();
        if (previousToken)
          await tx.session.deleteMany({
            where: { tokenHash: tokenHash(previousToken) },
          });
        await tx.session.create({
          data: { userId: user.id, tokenHash: tokenHash(token), expiresAt },
        });
        await tx.auditLog.create({
          data: { actorId: user.id, action: "user.login" },
        });
      });
      return { token, expiresAt };
    },
    async logout(token?: string) {
      if (!token) return;
      await db.$transaction(async (tx) => {
        const session = await tx.session.findUnique({
          where: { tokenHash: tokenHash(token) },
        });
        await tx.session.deleteMany({ where: { tokenHash: tokenHash(token) } });
        if (session)
          await tx.auditLog.create({
            data: { actorId: session.userId, action: "user.logout" },
          });
      });
    },
    me: (token?: string) => sessionUser(db, token),
    async updateProfile(token: string | undefined, input: unknown) {
      const data = profileSchema.parse(input);
      return db.$transaction(async (tx) => {
        const user = await sessionUser(tx, token);
        await tx.user.update({
          where: { id: user.id },
          data: {
            displayName: data.displayName,
            profile: {
              upsert: {
                create: { timezone: data.timezone },
                update: { timezone: data.timezone },
              },
            },
          },
        });
        await tx.auditLog.create({
          data: { actorId: user.id, action: "user.profile.update" },
        });
        return sessionUser(tx, token);
      });
    },
    async forgot(input: unknown) {
      const { email } = forgotSchema.parse(input);
      if (!sendRecovery)
        throw new DomainError(
          503,
          "MAIL_UNAVAILABLE",
          "Recuperação indisponível: o serviço de email não foi configurado.",
        );
      const user = await db.user.findUnique({ where: { email } });
      if (!user || user.suspendedAt) return;
      const token = newToken();
      await db.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${user.id}::uuid FOR UPDATE`;
        await tx.passwordResetToken.updateMany({
          where: { userId: user.id, usedAt: null },
          data: { usedAt: new Date() },
        });
        await tx.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash: tokenHash(token),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          },
        });
      });
      try {
        await sendRecovery(email, token);
      } catch {
        await db.passwordResetToken.deleteMany({
          where: { tokenHash: tokenHash(token) },
        });
        // Não revelar existência da conta ou registrar o segredo do link.
        console.error("RECOVERY_DELIVERY_FAILED");
      }
    },
    async reset(input: unknown) {
      const data = resetSchema.parse(input);
      const candidate = await db.passwordResetToken.findUnique({
        where: { tokenHash: tokenHash(data.token) },
      });
      if (!candidate || candidate.usedAt || candidate.expiresAt <= new Date())
        throw invalidReset();
      const passwordHash = await hashPassword(data.password);
      await db.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${candidate.userId}::uuid FOR UPDATE`;
        const user = await tx.user.findUnique({
          where: { id: candidate.userId },
        });
        if (!user || user.suspendedAt) throw invalidReset();
        const consumed = await tx.passwordResetToken.updateMany({
          where: {
            id: candidate.id,
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
          data: { usedAt: new Date() },
        });
        if (consumed.count !== 1) throw invalidReset();
        await tx.user.update({
          where: { id: user.id },
          data: { passwordHash },
        });
        await tx.session.deleteMany({ where: { userId: user.id } });
        await tx.passwordResetToken.updateMany({
          where: { userId: user.id, usedAt: null },
          data: { usedAt: new Date() },
        });
        await tx.auditLog.create({
          data: { actorId: user.id, action: "user.password.reset" },
        });
      });
    },
  };
}
