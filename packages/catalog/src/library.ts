import {
  classes,
  subclasses,
  species,
  backgrounds,
  srdSource,
  type CatalogSource,
  type CatalogOption,
  type CatalogRecord,
} from "./index";
const external = (
  id: string,
  name: string,
  edition: string,
  version: string,
  url: string,
): CatalogSource => ({
  id,
  name,
  edition,
  version,
  url,
  license: "Proprietary — metadata only",
  content: "reference-only",
});
export const sources: CatalogSource[] = [
  srdSource,
  external(
    "phb-2024",
    "Player’s Handbook (2024)",
    "2024",
    "2024",
    "https://www.dndbeyond.com/sources/dnd/phb-2024",
  ),
  external(
    "tce-2020",
    "Tasha’s Cauldron of Everything",
    "2014",
    "2020",
    "https://www.dndbeyond.com/sources/dnd/tcoe",
  ),
  external(
    "motm-2022",
    "Mordenkainen Presents: Monsters of the Multiverse",
    "2014",
    "2022",
    "https://www.dndbeyond.com/sources/dnd/motm",
  ),
  external(
    "scag-2015",
    "Sword Coast Adventurer’s Guide",
    "2014",
    "2015",
    "https://www.dndbeyond.com/sources/dnd/scag",
  ),
  {
    id: "custom",
    name: "Conteúdo personalizado da mesa",
    edition: "custom",
    version: "1",
    license: "User content — no redistribution grant",
    content: "user-content",
    url: "",
  },
];
function reference(
  id: string,
  name: string,
  originalName: string,
  sourceId: string,
  classId?: string,
): CatalogOption {
  const source = sources.find((s) => s.id === sourceId)!;
  return {
    id,
    name,
    originalName,
    source,
    page: 0,
    description:
      "Referência externa. Consulte a fonte original; regras e habilidades não implementadas.",
    compatibility: source.edition === "2024" ? "native" : "legacy-manual",
    ...(classId ? { classId, minimumLevel: 3 } : {}),
  };
}
export const library = {
  classes,
  subclasses: [
    ...subclasses,
    reference(
      "phb2024-mercy",
      "Guerreiro da Misericórdia",
      "Warrior of Mercy",
      "phb-2024",
      "srd521-monk",
    ),
    reference(
      "tce2020-mercy",
      "Caminho da Misericórdia (2020)",
      "Way of Mercy",
      "tce-2020",
      "srd521-monk",
    ),
    reference(
      "tce2020-swarmkeeper",
      "Guardião do Enxame",
      "Swarmkeeper",
      "tce-2020",
      "srd521-ranger",
    ),
  ],
  species: [
    ...species,
    reference("motm2022-shadar-kai", "Shadar-kai", "Shadar-kai", "motm-2022"),
  ],
  backgrounds: [
    ...backgrounds,
    reference(
      "scag2015-mercenary-veteran",
      "Veterano Mercenário",
      "Mercenary Veteran",
      "scag-2015",
    ),
  ],
  features: [] as CatalogOption[],
  feats: [] as CatalogOption[],
  spells: [] as CatalogOption[],
};
/** Versioned IDs are immutable. Never replace a legacy option with its revision. */
export const records: CatalogRecord[] = [
  ...library.classes.map((x) => ({ ...x, kind: "class" as const })),
  ...library.subclasses.map((x) => ({ ...x, kind: "subclass" as const })),
  ...library.species.map((x) => ({ ...x, kind: "species" as const })),
  ...library.backgrounds.map((x) => ({ ...x, kind: "background" as const })),
  ...library.features.map((x) => ({ ...x, kind: "feature" as const })),
  ...library.feats.map((x) => ({ ...x, kind: "feat" as const })),
  ...library.spells.map((x) => ({ ...x, kind: "spell" as const })),
];

export type CharacterCatalog = typeof library;
