import { expect, it } from "vitest";
import {
  classes,
  species,
  backgrounds,
  subclasses,
  searchCatalog,
} from "../../packages/catalog/src/index";
import { validateCharacterOptions } from "../../packages/domain/src/character-options";
const input = {
  name: "Teste",
  className: "Guerreiro",
  species: "Humano",
  level: 3,
  experience: 0,
  hitPoints: 1,
  maxHitPoints: 1,
  temporaryHitPoints: 0,
  armorClass: 10,
  attributes: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
  classId: "srd521-fighter",
  subclassId: "srd521-champion",
  subclassName: "Campeão",
};
it("catálogo SRD possui IDs únicos e fonte rastreável", () => {
  expect(classes).toHaveLength(12);
  expect(species).toHaveLength(9);
  expect(backgrounds).toHaveLength(4);
  expect(subclasses).toHaveLength(12);
  const all = [...classes, ...species, ...backgrounds, ...subclasses];
  expect(new Set(all.map((item) => item.id)).size).toBe(all.length);
  for (const item of all) {
    expect(item.source.license).toBe("CC-BY-4.0");
    expect(item.page).toBeGreaterThan(0);
  }
});
it("busca sem acentos por nome português, inglês e descrição", () => {
  expect(searchCatalog(classes, "barbaro")[0]?.id).toBe("srd521-barbarian");
  expect(searchCatalog(species, "dwarf")[0]?.name).toBe("Anão");
  expect(searchCatalog(backgrounds, "inexistente")).toHaveLength(0);
});
it("nível 3 libera somente subclasses da classe selecionada", () => {
  expect(() => validateCharacterOptions(input)).not.toThrow();
  expect(() => validateCharacterOptions({ ...input, level: 2 })).toThrow();
  expect(() =>
    validateCharacterOptions({
      ...input,
      classId: "srd521-wizard",
      className: "Mago",
    }),
  ).toThrow();
});
it("permite opções manuais sem atribuir origem SRD e rejeita nome falsificado", () => {
  expect(() =>
    validateCharacterOptions({
      ...input,
      classId: null,
      subclassId: null,
      className: "Classe original",
      species: "Espécie original",
    }),
  ).not.toThrow();
  expect(() =>
    validateCharacterOptions({ ...input, className: "Falsa" }),
  ).toThrow();
});
