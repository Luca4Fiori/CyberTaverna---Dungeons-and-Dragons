import { describe, expect, it } from "vitest";
import {
  abilityModifier,
  proficiencyBonus,
} from "../../packages/rules/src/index";
import {
  canManageCampaign,
  canMoveToken,
} from "../../packages/domain/src/permissions";
import {
  moveTokenSchema,
  realtimeEnvironmentSchema,
} from "../../packages/contracts/src/index";
describe("regras básicas", () => {
  it.each([
    [1, -5],
    [9, -1],
    [10, 0],
    [18, 4],
    [30, 10],
  ])("atributo %i resulta em %i", (score, expected) =>
    expect(abilityModifier(score)).toBe(expected),
  );
  it.each([
    [1, 2],
    [5, 3],
    [9, 4],
    [13, 5],
    [17, 6],
    [20, 6],
  ])("proficiência nível %i", (level, expected) =>
    expect(proficiencyBonus(level)).toBe(expected),
  );
  it("rejeita entradas inválidas", () => {
    expect(() => abilityModifier(NaN)).toThrow();
    expect(() => proficiencyBonus(21)).toThrow();
    expect(() => proficiencyBonus(1.5)).toThrow();
  });
});
describe("isolamento por campanha", () => {
  const gm = { userId: "u1", campaignId: "a", role: "GM" as const };
  it("mestre só administra a própria campanha", () => {
    expect(canManageCampaign("u1", "a", gm)).toBe(true);
    expect(canManageCampaign("u1", "b", gm)).toBe(false);
    expect(canManageCampaign("u2", "a", gm)).toBe(false);
  });
  it("exige participação mesmo para controlador do token", () =>
    expect(canMoveToken("u1", "a", null, "u1")).toBe(false));
  it("jogador movimenta somente token autorizado", () => {
    const player = { ...gm, role: "PLAYER" as const };
    expect(canMoveToken("u1", "a", player, "u1")).toBe(true);
    expect(canMoveToken("u1", "a", player, "u2")).toBe(false);
    expect(canMoveToken("u1", "b", player, "u1")).toBe(false);
  });
});
describe("contratos", () => {
  const movement = {
    campaignId: "00000000-0000-4000-8000-000000000001",
    sessionId: "00000000-0000-4000-8000-000000000002",
    tokenId: "00000000-0000-4000-8000-000000000003",
    x: 12,
    y: 20,
    expectedVersion: 0,
  };
  it("aceita movimento válido", () =>
    expect(moveTokenSchema.safeParse(movement).success).toBe(true));
  it("rejeita campos extras e valores não finitos", () => {
    expect(
      moveTokenSchema.safeParse({ ...movement, admin: true }).success,
    ).toBe(false);
    expect(
      moveTokenSchema.safeParse({ ...movement, x: Infinity }).success,
    ).toBe(false);
  });
  it("rejeita origem com caminho", () =>
    expect(
      realtimeEnvironmentSchema.safeParse({
        WEB_ORIGIN: "http://localhost:3000/path",
      }).success,
    ).toBe(false));
});
