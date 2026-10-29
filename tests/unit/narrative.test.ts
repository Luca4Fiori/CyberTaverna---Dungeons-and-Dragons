import { expect, it } from "vitest";
import {
  narrativeSchema,
  narrativeFields,
  createCharacterSchema,
} from "../../packages/contracts/src/characters";
import { eligibleSubclasses } from "../../packages/catalog/src/library";
import { swarm } from "../fixtures/swarm";

it("campos narrativos são opcionais e aceitam parágrafos sem confundir antecedente", () => {
  expect(narrativeSchema.parse({})).toEqual({});
  const data = createCharacterSchema.parse({
    ...swarm,
    backstory: "Primeiro capítulo.\n\nSegundo capítulo.",
    personality: "Reservado\nGentil",
  });
  expect(data.backstory).toContain("\n\n");
  expect(data.backgroundId).toBe(swarm.backgroundId);
  expect(data.attributes).toEqual(swarm.attributes);
});
it("limites de cada campo são aplicados no contrato", () => {
  for (const field of narrativeFields) {
    expect(
      narrativeSchema.safeParse({ [field.key]: "a".repeat(field.maxLength) })
        .success,
    ).toBe(true);
    expect(
      narrativeSchema.safeParse({
        [field.key]: "a".repeat(field.maxLength + 1),
      }).success,
    ).toBe(false);
  }
});
it("conteúdo que parece HTML continua sendo texto, sem transformação de regras", () => {
  const backstory = "<img src=x onerror=alert(1)>\n<script>alert(2)</script>";
  expect(narrativeSchema.parse({ backstory }).backstory).toBe(backstory);
});
it("imagem aceita somente URL HTTPS sem credenciais", () => {
  for (const portraitUrl of [
    "javascript:alert(1)",
    "data:text/html,<script>",
    "http://example.test/a",
    "https://user:password@example.test/a",
  ])
    expect(
      createCharacterSchema.safeParse({ ...swarm, portraitUrl }).success,
    ).toBe(false);
  expect(
    createCharacterSchema.safeParse({
      ...swarm,
      portraitUrl: "https://example.test/portrait.png",
    }).success,
  ).toBe(true);
});
it("Monge 4 inclui subclasse SRD e referências, sem filtrar pela edição da classe", () => {
  const options = eligibleSubclasses("srd521-monk", 4);
  expect(options.map((x) => x.id)).toEqual(
    expect.arrayContaining([
      "srd521-open-hand",
      "phb2024-mercy",
      "tce2020-mercy",
    ]),
  );
  expect(options.find((x) => x.id === "srd521-open-hand")?.source.content).toBe(
    "redistributable",
  );
  expect(options.find((x) => x.id === "phb2024-mercy")?.source.content).toBe(
    "reference-only",
  );
  expect(eligibleSubclasses("srd521-monk", 2)).toHaveLength(0);
  expect(eligibleSubclasses(null, 4)).toHaveLength(0);
  expect(
    eligibleSubclasses("srd521-wizard", 4).some(
      (x) => x.id === "srd521-open-hand",
    ),
  ).toBe(false);
});
