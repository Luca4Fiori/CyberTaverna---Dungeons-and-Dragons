import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, expect, it } from "vitest";
import { testDatabase } from "../database";
import { createAuthService } from "../../packages/domain/src/auth";
import { createCampaignService } from "../../packages/domain/src/campaigns";
import { createCharacterService } from "../../packages/domain/src/characters";
import { createGameSessionService } from "../../packages/domain/src/game-sessions";
const db = testDatabase(),
  auth = createAuthService(db),
  campaigns = createCampaignService(db),
  chars = createCharacterService(db),
  sessions = createGameSessionService(db);
const ids: string[] = [],
  campaignIds: string[] = [],
  tokens: string[] = [];
const data = {
  name: "Guardião",
  className: "Guerreiro",
  species: "Humano",
  level: 1,
  experience: 0,
  hitPoints: 12,
  maxHitPoints: 12,
  temporaryHitPoints: 0,
  armorClass: 16,
  attributes: { STR: 17, DEX: 9, CON: 14, INT: 10, WIS: 12, CHA: 8 },
};
let campaign = "",
  other = "",
  character = "";
beforeAll(async () => {
  const run = randomUUID();
  for (let i = 0; i < 3; i++) {
    const email = `chars-${run}-${i}@example.test`,
      password = "Senha-segura-12345";
    ids.push(
      (await auth.register({ email, password, displayName: `Pessoa ${i}` })).id,
    );
    tokens.push((await auth.login({ email, password })).token);
  }
  campaign = (await campaigns.create(tokens[0], { name: "Inverno" })).id;
  other = (await campaigns.create(tokens[1], { name: "Outra campanha" })).id;
  campaignIds.push(campaign, other);
  const invite = await campaigns.invite(tokens[0], campaign, { maxUses: 2 });
  await campaigns.accept(tokens[1], { token: invite.token });
  await campaigns.accept(tokens[2], { token: invite.token });
}, 30000);
afterAll(async () => {
  await db.gameSessionParticipant.deleteMany({
    where: { campaignId: { in: campaignIds } },
  });
  await db.auditLog.deleteMany({ where: { actorId: { in: ids } } });
  await db.campaign.deleteMany({ where: { id: { in: campaignIds } } });
  await db.user.deleteMany({ where: { id: { in: ids } } });
  await db.$disconnect();
});
it("persiste ficha e seis atributos com cálculos do servidor", async () => {
  const sheet = await chars.create(tokens[1], campaign, data);
  character = sheet.id;
  expect(sheet.modifiers).toEqual({
    STR: 3,
    DEX: -1,
    CON: 2,
    INT: 0,
    WIS: 1,
    CHA: -1,
  });
  expect(
    await db.characterAttribute.count({ where: { characterId: character } }),
  ).toBe(6);
  expect((await chars.get(tokens[1], campaign, character)).name).toBe(
    data.name,
  );
});
it("protege fichas de terceiros e escopo de campanha mesmo quando jogador é mestre em outra", async () => {
  expect(await chars.list(tokens[2], campaign)).toHaveLength(0);
  await expect(chars.get(tokens[2], campaign, character)).rejects.toMatchObject(
    { status: 404 },
  );
  await expect(
    chars.update(tokens[2], campaign, character, {
      ...data,
      expectedVersion: 0,
    }),
  ).rejects.toMatchObject({ status: 403 });
  await expect(chars.get(tokens[1], other, character)).rejects.toMatchObject({
    status: 404,
  });
  await expect(
    chars.create(tokens[1], campaign, { ...data, ownerId: ids[0] }),
  ).rejects.toMatchObject({ status: 403 });
  await expect(chars.create(undefined, campaign, data)).rejects.toMatchObject({
    status: 401,
  });
});
it("mestre edita todos os campos e grava histórico sem sobrescrever versão concorrente", async () => {
  const updated = await chars.update(tokens[0], campaign, character, {
    ...data,
    name: "Guardião editado",
    className: "Mago",
    species: "Elfo",
    level: 4,
    experience: 2700,
    hitPoints: 8,
    maxHitPoints: 20,
    temporaryHitPoints: 3,
    armorClass: 14,
    attributes: { ...data.attributes, STR: 20 },
    expectedVersion: 0,
  });
  expect(updated).toMatchObject({
    version: 1,
    name: "Guardião editado",
    level: 4,
    modifiers: { STR: 5 },
  });
  await expect(
    chars.update(tokens[1], campaign, character, {
      ...data,
      expectedVersion: 0,
    }),
  ).rejects.toMatchObject({ status: 409 });
  expect(
    await db.characterHistory.count({ where: { characterId: character } }),
  ).toBe(2);
});
it("configurações bloqueiam jogadores mas permitem intervenção do mestre", async () => {
  await chars.configure(tokens[0], campaign, {
    playersCanCreateCharacters: false,
    playersCanEditCharacters: false,
  });
  await expect(chars.create(tokens[1], campaign, data)).rejects.toMatchObject({
    status: 403,
  });
  await expect(
    chars.update(tokens[1], campaign, character, {
      ...data,
      expectedVersion: 1,
    }),
  ).rejects.toMatchObject({ status: 403 });
  expect((await chars.get(tokens[1], campaign, character)).canEdit).toBe(false);
  await chars.update(tokens[0], campaign, character, {
    ...data,
    expectedVersion: 1,
  });
  await expect(
    chars.configure(tokens[1], campaign, {
      playersCanCreateCharacters: true,
      playersCanEditCharacters: true,
    }),
  ).rejects.toMatchObject({ status: 403 });
});
it("sessão compartilhada persiste participantes e impede personagem alheio", async () => {
  const session = await sessions.create(tokens[0], campaign, {
    title: "O degelo",
  });
  await expect(
    sessions.create(tokens[1], campaign, { title: "Intrusão" }),
  ).rejects.toMatchObject({ status: 403 });
  await sessions.join(tokens[0], campaign, session.id, {});
  await sessions.join(tokens[1], campaign, session.id, {
    characterId: character,
  });
  await sessions.join(tokens[1], campaign, session.id, {
    characterId: character,
  });
  await expect(
    sessions.join(tokens[2], campaign, session.id, { characterId: character }),
  ).rejects.toMatchObject({ status: 403 });
  await expect(
    sessions.get(tokens[1], other, session.id),
  ).rejects.toMatchObject({ status: 404 });
  expect(
    (await sessions.get(tokens[1], campaign, session.id)).participants,
  ).toHaveLength(2);
  await sessions.status(tokens[0], campaign, session.id, {
    status: "FINISHED",
  });
  await expect(
    sessions.join(tokens[1], campaign, session.id, { characterId: character }),
  ).rejects.toMatchObject({ status: 409 });
});
it("arquivamento mantém leitura e bloqueia alterações", async () => {
  await campaigns.update(tokens[0], campaign, {
    name: "Inverno",
    archived: true,
  });
  await expect(
    chars.update(tokens[0], campaign, character, {
      ...data,
      expectedVersion: 2,
    }),
  ).rejects.toMatchObject({ code: "ARCHIVED" });
  expect((await chars.get(tokens[0], campaign, character)).canEdit).toBe(false);
});

it("catálogo persiste escolhas sem alterar o vínculo e mestre mantém edição manual", async () => {
  const input = {
    ...data,
    level: 3,
    classId: "srd521-fighter",
    speciesId: "srd521-human",
    backgroundId: "srd521-soldier",
    backgroundName: "Soldado",
    subclassId: "srd521-champion",
    subclassName: "Campeão",
  };
  const sheet = await chars.create(tokens[1], other, input);
  expect(await chars.get(tokens[1], other, sheet.id)).toMatchObject({
    campaignId: other,
    ownerId: ids[1],
    classId: "srd521-fighter",
    subclassName: "Campeão",
  });
  await chars.update(tokens[1], other, sheet.id, {
    ...input,
    classId: null,
    className: "Guardião das neves",
    subclassId: null,
    subclassName: "Sentinela",
    expectedVersion: 0,
  });
  expect(await chars.get(tokens[1], other, sheet.id)).toMatchObject({
    campaignId: other,
    ownerId: ids[1],
    classId: null,
    className: "Guardião das neves",
    backgroundName: "Soldado",
    version: 1,
  });
  await expect(
    chars.update(tokens[0], other, sheet.id, { ...input, expectedVersion: 1 }),
  ).rejects.toMatchObject({ status: 404 });
});
it("lista geral apenas reúne fichas próprias e busca elegível respeita campanha e proprietário", async () => {
  const mine = await chars.mine(tokens[1]);
  expect(mine.some((row) => row.id === character)).toBe(true);
  expect((await chars.mine(tokens[2])).length).toBe(0);
  expect(
    (await chars.eligible(tokens[1], campaign, "Guard")).some(
      (row) => row.id === character,
    ),
  ).toBe(true);
  expect(await chars.eligible(tokens[2], campaign, "Guard")).toHaveLength(0);
  await expect(chars.eligible(tokens[0], other)).rejects.toMatchObject({
    status: 404,
  });
});
it("servidor rejeita referência desconhecida, subclasse incompatível e troca de campanha no corpo", async () => {
  for (const values of [
    { classId: "proprietary-unknown" },
    {
      classId: "srd521-fighter",
      subclassId: "srd521-champion",
      subclassName: "Campeão",
    },
    {
      classId: "srd521-wizard",
      className: "Mago",
      level: 3,
      subclassId: "srd521-champion",
      subclassName: "Campeão",
    },
    { campaignId: campaign },
  ])
    await expect(
      chars.create(tokens[1], other, { ...data, ...values }),
    ).rejects.toThrow();
});
it("migração aditiva preserva registros e vínculos legados", async () => {
  const { readFile } = await import("node:fs/promises");
  const sql = await readFile(
    "packages/database/prisma/migrations/202610280001_character_catalog/migration.sql",
    "utf8",
  );
  await db.$transaction(async (tx) => {
    // Tabela temporária isolada, sem escrever em Character pública.
    await tx.$executeRaw`CREATE TEMP TABLE "Character" ON COMMIT DROP AS SELECT id, "campaignId", "ownerId", name, "className", species, version FROM public."Character" WHERE id = ${character}::uuid`;
    await tx.$executeRawUnsafe("SET LOCAL search_path TO pg_temp");
    const before = await tx.$queryRaw<
      Array<{ id: string; campaignId: string; ownerId: string; name: string }>
    >`SELECT * FROM "Character"`;
    await tx.$executeRawUnsafe(sql);
    const after = await tx.$queryRaw<
      Array<{
        id: string;
        campaignId: string;
        ownerId: string;
        name: string;
        classId: null;
        backgroundName: string;
      }>
    >`SELECT * FROM "Character"`;
    expect(after[0]).toMatchObject({
      ...before[0],
      classId: null,
      backgroundName: "",
    });
  });
});
