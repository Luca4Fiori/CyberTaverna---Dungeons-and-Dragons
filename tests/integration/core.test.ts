import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { testDatabase } from "../database";
import {
  createAuthService,
  consumeRateLimit,
} from "../../packages/domain/src/auth";
import { createCampaignService } from "../../packages/domain/src/campaigns";
import { tokenHash } from "../../packages/domain/src/security";
const db = testDatabase();
const run = randomUUID();
const password = "Teste-seguro-12345";
const deliveries: { email: string; token: string }[] = [];
const auth = createAuthService(db, async (email, token) => {
  deliveries.push({ email, token });
});
const campaigns = createCampaignService(db);
const userIds: string[] = [];
const campaignIds: string[] = [];
const emails = [0, 1, 2, 3].map((i) => `core-${run}-${i}@example.test`);
const tokens: string[] = [];
function token(index: number) {
  const value = tokens[index];
  if (!value) throw new Error("Fixture ausente");
  return value;
}
beforeAll(async () => {
  for (const email of emails) {
    const user = await auth.register({
      email,
      password,
      displayName: "Pessoa de teste",
    });
    userIds.push(user.id);
    tokens.push((await auth.login({ email, password })).token);
  }
}, 30000);
afterAll(async () => {
  await db.auditLog.deleteMany({
    where: {
      OR: [{ actorId: { in: userIds } }, { campaignId: { in: campaignIds } }],
    },
  });
  await db.campaign.deleteMany({ where: { id: { in: campaignIds } } });
  await db.user.deleteMany({ where: { id: { in: userIds } } });
  await db.rateLimitBucket.deleteMany({
    where: { key: { startsWith: `test-${run}:` } },
  });
  await db.$disconnect();
});
describe("autenticação real em PostgreSQL", () => {
  it("normaliza email, impede duplicidade e não aceita papel administrativo", async () => {
    await expect(
      auth.register({
        email: emails[0]?.toUpperCase(),
        password,
        displayName: "Duplicado",
      }),
    ).rejects.toMatchObject({ status: 409 });
    await expect(
      auth.register({
        email: `admin-${run}@example.test`,
        password,
        displayName: "Admin",
        globalRole: "ADMIN",
      }),
    ).rejects.toThrow();
    const user = await db.user.findUniqueOrThrow({ where: { id: userIds[0] } });
    expect(user.globalRole).toBe("USER");
    expect(user.passwordHash).toMatch(/^\$argon2id\$/);
    expect(user.passwordHash).not.toContain(password);
  });
  it("rejeita senha errada e usuário inexistente com a mesma resposta", async () => {
    for (const email of [emails[0], `missing-${run}@example.test`])
      await expect(
        auth.login({ email, password: "senha-incorreta" }),
      ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  });
  it("armazena só hash da sessão e atualiza perfil persistido", async () => {
    const session = await db.session.findUniqueOrThrow({
      where: { tokenHash: tokenHash(token(0)) },
    });
    expect(session.tokenHash).not.toBe(token(0));
    await auth.updateProfile(token(0), {
      displayName: "Mestre do inverno",
      timezone: "America/Manaus",
    });
    expect(await auth.me(token(0))).toMatchObject({
      displayName: "Mestre do inverno",
      timezone: "America/Manaus",
    });
    await expect(
      auth.updateProfile(token(0), { displayName: "X", timezone: "invalido" }),
    ).rejects.toThrow();
  });
  it("logout revoga a sessão no servidor", async () => {
    const session = await auth.login({ email: emails[0], password });
    await auth.logout(session.token);
    await expect(auth.me(session.token)).rejects.toMatchObject({ status: 401 });
  });
  it("rejeita sessão expirada e conta suspensa", async () => {
    const session = await auth.login({ email: emails[0], password });
    await db.session.updateMany({
      where: { tokenHash: tokenHash(session.token) },
      data: { expiresAt: new Date(0) },
    });
    await expect(auth.me(session.token)).rejects.toMatchObject({ status: 401 });
    await db.user.update({
      where: { id: userIds[3] },
      data: { suspendedAt: new Date() },
    });
    await expect(auth.me(token(3))).rejects.toMatchObject({ status: 401 });
    await expect(
      auth.login({ email: emails[3], password }),
    ).rejects.toMatchObject({ status: 401 });
    await db.user.update({
      where: { id: userIds[3] },
      data: { suspendedAt: null },
    });
  });
  it("limita tentativas de forma atômica no banco", async () => {
    const results = await Promise.allSettled(
      Array.from({ length: 8 }, () =>
        consumeRateLimit(db, `test-${run}`, "identity", 3, 60000),
      ),
    );
    expect(
      results.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(3);
    expect(
      results.filter((result) => result.status === "rejected"),
    ).toHaveLength(5);
  });
});
describe("campanhas e isolamento", () => {
  let a = "";
  let b = "";
  it("cria campanha e GM atomicamente, sem papel global de mestre", async () => {
    const first = await campaigns.create(token(0), { name: "Campanha A" });
    a = first.id;
    campaignIds.push(a);
    const second = await campaigns.create(token(1), { name: "Campanha B" });
    b = second.id;
    campaignIds.push(b);
    expect((await campaigns.detail(token(0), a)).role).toBe("GM");
    await expect(campaigns.detail(token(1), a)).rejects.toMatchObject({
      status: 404,
    });
    await expect(
      campaigns.create(undefined, { name: "Sem sessão" }),
    ).rejects.toMatchObject({ status: 401 });
  });
  it("mesmo usuário é GM em A e PLAYER em B; escopos não se misturam", async () => {
    const invite = await campaigns.invite(token(1), b, { maxUses: 1 });
    await campaigns.accept(token(0), { token: invite.token });
    expect((await campaigns.detail(token(0), b)).role).toBe("PLAYER");
    await expect(
      campaigns.update(token(0), b, { name: "Ataque" }),
    ).rejects.toMatchObject({ status: 403 });
    await expect(campaigns.invite(token(0), b, {})).rejects.toMatchObject({
      status: 403,
    });
    await expect(campaigns.invites(token(0), b)).rejects.toMatchObject({
      status: 403,
    });
    await expect(campaigns.detail(token(2), b)).rejects.toMatchObject({
      status: 404,
    });
    expect((await campaigns.list(token(2))).length).toBe(0);
    expect(JSON.stringify(await campaigns.detail(token(0), b))).not.toContain(
      "tokenHash",
    );
  });
  it("convite de um uso resiste a aceitações concorrentes", async () => {
    const invite = await campaigns.invite(token(0), a, { maxUses: 1 });
    const attempts = await Promise.allSettled([
      campaigns.accept(token(2), { token: invite.token }),
      campaigns.accept(token(3), { token: invite.token }),
    ]);
    expect(
      attempts.filter((attempt) => attempt.status === "fulfilled"),
    ).toHaveLength(1);
    const saved = await db.campaignInvite.findUniqueOrThrow({
      where: { id: invite.id },
    });
    expect(saved.useCount).toBe(1);
    expect(saved.tokenHash).toBe(tokenHash(invite.token));
  });
  it("repetir aceite não gasta uso nem muda GM", async () => {
    const invite = await campaigns.invite(token(0), a, {});
    await campaigns.accept(token(0), { token: invite.token });
    expect((await campaigns.detail(token(0), a)).role).toBe("GM");
    expect(
      (await db.campaignInvite.findUniqueOrThrow({ where: { id: invite.id } }))
        .useCount,
    ).toBe(0);
  });
  it("rejeita convites expirados, revogados e revogação entre campanhas", async () => {
    const expired = await campaigns.invite(token(0), a, {});
    await db.campaignInvite.update({
      where: { id: expired.id },
      data: { expiresAt: new Date(0) },
    });
    await expect(
      campaigns.accept(token(1), { token: expired.token }),
    ).rejects.toMatchObject({ code: "INVALID_INVITE" });
    const revoked = await campaigns.invite(token(0), a, {});
    await expect(
      campaigns.revoke(token(1), b, revoked.id),
    ).rejects.toMatchObject({ status: 404 });
    await campaigns.revoke(token(0), a, revoked.id);
    await expect(
      campaigns.accept(token(1), { token: revoked.token }),
    ).rejects.toMatchObject({ code: "INVALID_INVITE" });
  });
  it("edita e arquiva, revogando convites; reativar não restaura convites", async () => {
    const invite = await campaigns.invite(token(0), a, {});
    const changed = await campaigns.update(token(0), a, {
      name: "Campanha editada",
      description: "Persistida",
      archived: true,
    });
    expect(changed.archivedAt).not.toBeNull();
    await expect(
      campaigns.accept(token(1), { token: invite.token }),
    ).rejects.toMatchObject({ code: "INVALID_INVITE" });
    await expect(campaigns.invite(token(0), a, {})).rejects.toMatchObject({
      code: "ARCHIVED",
    });
    await campaigns.update(token(0), a, {
      name: "Campanha editada",
      archived: false,
    });
    await expect(
      campaigns.accept(token(1), { token: invite.token }),
    ).rejects.toMatchObject({ code: "INVALID_INVITE" });
  });
});
describe("recuperação segura", () => {
  it("não expõe token em resposta, expira e invalida links anteriores", async () => {
    expect(await auth.forgot({ email: emails[3] })).toBeUndefined();
    const first = deliveries.at(-1)!;
    await auth.forgot({ email: emails[3] });
    const second = deliveries.at(-1)!;
    await expect(
      auth.reset({ token: first.token, password }),
    ).rejects.toMatchObject({ code: "INVALID_RESET" });
    await db.passwordResetToken.updateMany({
      where: { tokenHash: tokenHash(second.token) },
      data: { expiresAt: new Date(0) },
    });
    await expect(
      auth.reset({ token: second.token, password }),
    ).rejects.toMatchObject({ code: "INVALID_RESET" });
    const before = deliveries.length;
    await auth.forgot({ email: `missing-${run}@example.test` });
    expect(deliveries).toHaveLength(before);
  });
  it("consome link uma vez sob concorrência e revoga todas as sessões", async () => {
    await auth.forgot({ email: emails[3] });
    const resetToken = deliveries.at(-1)!.token;
    const attempts = await Promise.allSettled([
      auth.reset({ token: resetToken, password: "Senha-nova-segura-123" }),
      auth.reset({ token: resetToken, password: "Senha-nova-segura-123" }),
    ]);
    expect(
      attempts.filter((attempt) => attempt.status === "fulfilled"),
    ).toHaveLength(1);
    await expect(auth.me(token(3))).rejects.toMatchObject({ status: 401 });
    await expect(
      auth.login({ email: emails[3], password }),
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
    expect(
      (
        await auth.login({
          email: emails[3],
          password: "Senha-nova-segura-123",
        })
      ).token,
    ).toHaveLength(64);
  });
  it("sem SMTP não finge envio", async () => {
    await expect(
      createAuthService(db).forgot({ email: emails[0] }),
    ).rejects.toMatchObject({ status: 503 });
  });
});
