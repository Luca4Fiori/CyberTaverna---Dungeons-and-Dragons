import {
  characterClassSchema,
  type CharacterInput,
} from "../../packages/contracts/src/characters";
export const swarm: CharacterInput = {
  name: "Enxame da Misericórdia",
  className: "Monge",
  classId: "srd521-monk",
  species: "Shadar-kai",
  speciesId: "motm2022-shadar-kai",
  backgroundName: "Veterano Mercenário",
  backgroundId: "scag2015-mercenary-veteran",
  level: 20,
  experience: 355000,
  hitPoints: 140,
  maxHitPoints: 140,
  temporaryHitPoints: 0,
  armorClass: 18,
  attributes: { STR: 10, DEX: 18, CON: 14, INT: 10, WIS: 18, CHA: 8 },
  classes: [
    characterClassSchema.parse({
      classId: "srd521-monk",
      className: "Monge",
      level: 13,
      subclassId: "phb2024-mercy",
      subclassName: "Guerreiro da Misericórdia",
    }),
    characterClassSchema.parse({
      classId: "srd521-ranger",
      className: "Patrulheiro",
      level: 7,
      subclassId: "tce2020-swarmkeeper",
      subclassName: "Guardião do Enxame",
    }),
  ],
};
