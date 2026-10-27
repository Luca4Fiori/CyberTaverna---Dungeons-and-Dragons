import { expect, it } from "vitest";
import {
  abilityModifier,
  proficiencyBonus,
} from "../../packages/rules/src/index";
import { createCharacterSchema } from "../../packages/contracts/src/characters";
it("modificadores SRD de 1 a 30", () => {
  expect(Array.from({ length: 30 }, (_, i) => abilityModifier(i + 1))).toEqual([
    -5, -4, -4, -3, -3, -2, -2, -1, -1, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6,
    6, 7, 7, 8, 8, 9, 9, 10,
  ]);
});
it("proficiência nos vinte níveis", () => {
  expect(Array.from({ length: 20 }, (_, i) => proficiencyBonus(i + 1))).toEqual(
    [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6],
  );
});
it("rejeita atributos e pontos de vida inválidos", () => {
  for (const value of [0, 31, 1.5, NaN])
    expect(() => abilityModifier(value)).toThrow();
  expect(
    createCharacterSchema.safeParse({
      name: "Inválido",
      attributes: { STR: 99 },
    }).success,
  ).toBe(false);
});
