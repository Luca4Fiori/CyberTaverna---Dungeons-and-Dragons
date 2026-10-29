import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { beforeAll, afterAll, it, expect } from "vitest";
import { testDatabase } from "../database";
import { createAuthService } from "../../packages/domain/src/auth";
import { createCampaignService } from "../../packages/domain/src/campaigns";
import { createCharacterService } from "../../packages/domain/src/characters";
import { swarm } from "../fixtures/swarm";
const db = testDatabase(),
  auth = createAuthService(db),
  campaigns = createCampaignService(db),
  characters = createCharacterService(db);
const ids: string[] = [],
  tokens: string[] = [],
  campaignIds: string[] = [];
let campaign: string, other: string, character: string;
beforeAll(async () => {
  const run = randomUUID();
  for (let i = 0; i < 3; i++) {
    const input = {
      email: `multi-${run}-${i}@example.test`,
      password: "Senha-segura-12345",
      displayName: `Pessoa ${i}`,
    };
    ids.push((await auth.register(input)).id);
    tokens.push(
      (await auth.login({ email: input.email, password: input.password }))
        .token,
    );
  }
  campaign = (await campaigns.create(tokens[0], { name: "Multiclasse" })).id;
  other = (await campaigns.create(tokens[1], { name: "Outra mesa" })).id;
  campaignIds.push(campaign, other);
  const invite = await campaigns.invite(tokens[0], campaign, { maxUses: 2 });
  await campaigns.accept(tokens[1], { token: invite.token });
  await campaigns.accept(tokens[2], { token: invite.token });
}, 30000);
afterAll(async () => {
  await db.auditLog.deleteMany({ where: { actorId: { in: ids } } });
  await db.campaign.deleteMany({ where: { id: { in: campaignIds } } });
  await db.user.deleteMany({ where: { id: { in: ids } } });
  await db.$disconnect();
});
it("cria e recupera Enxame da Misericórdia no PostgreSQL com duas classes e fontes", async () => {
  const created = await characters.create(tokens[1], campaign, swarm);
  character = created.id;
  const saved = await characters.get(tokens[0], campaign, character);
  expect(saved).toMatchObject({
    name: swarm.name,
    level: 20,
    proficiency: 6,
    speciesId: swarm.speciesId,
    backgroundId: swarm.backgroundId,
    ownerId: ids[1],
  });
  expect(saved.classes).toHaveLength(2);
  expect(saved.classes?.map((x) => [x.level, x.subclassSourceId])).toEqual([
    [13, "phb-2024"],
    [7, "tce-2020"],
  ]);
  expect(
    await db.characterClass.count({ where: { characterId: character } }),
  ).toBe(2);
});
it("mestre edita distribuição e registra exceção; jogador não aprova e terceiro não edita", async () => {
  const input = {
    ...swarm,
    attributes: { ...swarm.attributes, DEX: 8 },
    multiclassAdjustment: "Exceção de destreza autorizada nesta mesa.",
    expectedVersion: 0,
  };
  await expect(
    characters.update(tokens[1], campaign, character, input),
  ).rejects.toMatchObject({ status: 403 });
  await expect(
    characters.update(tokens[2], campaign, character, input),
  ).rejects.toMatchObject({ status: 403 });
  await expect(
    characters.get(tokens[1], other, character),
  ).rejects.toMatchObject({ status: 404 });
  const saved = await characters.update(tokens[0], campaign, character, input);
  expect(saved.version).toBe(1);
  const { characterFieldsSchema } =
    await import("../../packages/contracts/src/characters");
  const permitted = characterFieldsSchema.strip().parse(saved);
  expect(
    (
      await characters.update(tokens[1], campaign, character, {
        ...permitted,
        name: "Enxame renomeado",
        expectedVersion: 1,
      })
    ).version,
  ).toBe(2);
  await expect(
    characters.update(tokens[1], campaign, character, {
      ...permitted,
      attributes: { ...permitted.attributes, WIS: 9 },
      expectedVersion: 2,
    }),
  ).rejects.toMatchObject({ code: "INVALID_MULTICLASS" });
  await expect(
    characters.update(tokens[0], campaign, character, {
      ...swarm,
      expectedVersion: 0,
    }),
  ).rejects.toMatchObject({ status: 409 });
  const history = await db.characterHistory.findUniqueOrThrow({
    where: { characterId_version: { characterId: character, version: 1 } },
  });
  expect(history.actorId).toBe(ids[0]);
  expect(JSON.stringify(history.changes)).toContain(input.multiclassAdjustment);
});
it("migração SQL preserva ficha, nível, dono e campanha, criando vínculo único", async () => {
  const sql = await readFile(
    "packages/database/prisma/migrations/202610290001_multiclass/migration.sql",
    "utf8",
  );
  await db.$transaction(async (tx) => {
    await tx.$executeRaw`CREATE TEMP TABLE "Character" ON COMMIT DROP AS SELECT * FROM public."Character" WHERE id = ${character}::uuid`;
    await tx.$executeRawUnsafe("SET LOCAL search_path TO pg_temp");
    await tx.$executeRawUnsafe(
      'ALTER TABLE "Character" ADD PRIMARY KEY (id), DROP COLUMN "multiclassAdjustment"',
    );
    const before = await tx.$queryRaw<
      Array<Record<string, unknown>>
    >`SELECT * FROM "Character"`;
    for (const statement of sql.split(";").filter((s) => s.trim()))
      await tx.$executeRawUnsafe(statement);
    const after = await tx.$queryRaw<
      Array<Record<string, unknown>>
    >`SELECT * FROM "Character"`;
    expect(after[0]).toMatchObject(before[0]!);
    const rows = await tx.$queryRaw<
      Array<{
        characterId: string;
        level: number;
        classId: string;
        subclassId: string;
      }>
    >`SELECT * FROM "CharacterClass"`;
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      characterId: character,
      level: 20,
      classId: "srd521-monk",
      subclassId: "phb2024-mercy",
    });
    // Temporary table lifecycle must not survive pool reuse.
    await tx.$executeRawUnsafe('DROP TABLE "CharacterClass"');
  });
});
