import { expect, it } from "vitest";
import { swarm } from "../fixtures/swarm";
import { normalizeClasses } from "../../packages/domain/src/multiclass";
import {
  totalLevel,
  validateAcquisition,
} from "../../packages/rules/src/multiclass";
import { proficiencyBonus } from "../../packages/rules/src/index";
it("calcula 13 + 7, proficiência e fontes distintas sem inventar revisão", () => {
  const result = normalizeClasses(swarm, false);
  expect(result.level).toBe(20);
  expect(proficiencyBonus(result.level)).toBe(6);
  expect(result.classes.map((c) => c.subclassSourceId)).toEqual([
    "phb-2024",
    "tce-2020",
  ]);
  expect(result.classes.map((c) => c.sourceId)).toEqual([
    "srd-5.2.1",
    "srd-5.2.1",
  ]);
});
it("classe única não exige pré-requisitos de multiclasse", () => {
  expect(
    normalizeClasses(
      {
        ...swarm,
        classes: [swarm.classes![0]!],
        attributes: { ...swarm.attributes, DEX: 8 },
      },
      false,
    ).level,
  ).toBe(13);
});
it("rejeita níveis inválidos e total acima de 20", () => {
  for (const levels of [[], [0], [1.5], [21], [13, 8], [-1, 2]])
    expect(() => totalLevel(levels.map((level) => ({ level })))).toThrow();
});
it("confere requisitos de todas as classes; mestre pode justificar exceção", () => {
  const input = { ...swarm, attributes: { ...swarm.attributes, DEX: 8 } };
  expect(() => normalizeClasses(input, false)).toThrow("DEX 13");
  expect(() =>
    normalizeClasses(
      { ...input, multiclassAdjustment: "Regra da mesa: destreza dispensada." },
      false,
    ),
  ).toThrow("Somente o mestre");
  expect(
    normalizeClasses(
      { ...input, multiclassAdjustment: "Regra da mesa: destreza dispensada." },
      true,
    ).level,
  ).toBe(20);
});
it("subclasse pertence à classe e usa o nível da classe, não o total", () => {
  const rows = swarm.classes!;
  expect(() =>
    normalizeClasses(
      {
        ...swarm,
        classes: [
          { ...rows[0]!, level: 2 },
          { ...rows[1]!, level: 18 },
        ],
      },
      true,
    ),
  ).toThrow("subclasse");
  expect(() =>
    normalizeClasses(
      {
        ...swarm,
        classes: [
          {
            ...rows[0]!,
            subclassId: rows[1]!.subclassId,
            subclassName: rows[1]!.subclassName,
          },
          rows[1]!,
        ],
      },
      true,
    ),
  ).toThrow("subclasse");
});
it("rejeita classe duplicada e versão incorreta", () => {
  expect(() =>
    normalizeClasses(
      {
        ...swarm,
        classes: [
          { ...swarm.classes![0]!, level: 5 },
          { ...swarm.classes![0]!, level: 5 },
        ],
      },
      true,
    ),
  ).toThrow("único");
  expect(() =>
    normalizeClasses(
      { ...swarm, classes: [{ ...swarm.classes![0]!, rulesVersion: "2014" }] },
      true,
    ),
  ).toThrow("versão");
});
it("opção antiga revisada exige escolha explícita ou ajuste do mestre", () => {
  const input = {
    ...swarm,
    classes: [
      {
        ...swarm.classes![0]!,
        subclassId: "tce2020-mercy",
        subclassName: "Caminho da Misericórdia (2020)",
      },
    ],
  };
  expect(() => normalizeClasses(input, false)).toThrow("revisão");
  expect(
    normalizeClasses(
      {
        ...input,
        multiclassAdjustment: "Manter versão anterior por decisão da mesa.",
      },
      true,
    ).classes[0]?.subclassSourceId,
  ).toBe("tce-2020");
});
it("ordem opcional completa e sem repetições", () => {
  const rows = swarm.classes!.map((r, i) => ({
    ...r,
    acquisitionLevels: Array.from(
      { length: r.level },
      (_, n) => n + (i ? 14 : 1),
    ),
  }));
  expect(() => validateAcquisition(rows)).not.toThrow();
  expect(() =>
    validateAcquisition([{ ...rows[0]!, acquisitionLevels: [1] }, rows[1]!]),
  ).toThrow();
});
it("cliente antigo não pode apagar distribuição e aprovação não cobre novas escolhas", () => {
  const previous = {
    ...swarm,
    ...normalizeClasses(
      { ...swarm, multiclassAdjustment: "Ajuste aprovado pelo mestre." },
      true,
    ),
  };
  expect(() =>
    normalizeClasses({ ...swarm, classes: undefined }, false, previous),
  ).toThrow("várias classes");
  expect(() =>
    normalizeClasses(
      { ...swarm, attributes: { ...swarm.attributes, DEX: 8 } },
      false,
      previous,
    ),
  ).toThrow("DEX 13");
});

it("aprovação não depende da ordem das chaves recebidas pela API", () => {
  const base = {
    ...swarm,
    attributes: { ...swarm.attributes, DEX: 8 },
    multiclassAdjustment: "Destreza dispensada pelo mestre.",
  };
  const previous = { ...base, ...normalizeClasses(base, true) };
  const reordered = { ...previous };
  // Reverse nested keys independently, without dropping any value.
  reordered.classes = previous.classes.map(
    (row) => Object.fromEntries(Object.entries(row).reverse()) as typeof row,
  );
  reordered.attributes = Object.fromEntries(
    Object.entries(previous.attributes).reverse(),
  ) as typeof previous.attributes;
  expect(() => normalizeClasses(reordered, false, previous)).not.toThrow();
});
