/** Dados de referência, separados do motor de regras. Adaptação pt-BR própria; ver docs/CATALOGO_SRD.md. */
export const srdSource = {
  id: "srd-5.2.1",
  version: "5.2.1",
  license: "CC-BY-4.0",
  url: "https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf",
} as const;
export type CatalogOption = {
  id: string;
  name: string;
  originalName: string;
  description: string;
  page: number;
  source: typeof srdSource;
  classId?: string;
  minimumLevel?: number;
};
function option(
  id: string,
  name: string,
  originalName: string,
  description: string,
  page: number,
): CatalogOption {
  return {
    id: `srd521-${id}`,
    name,
    originalName,
    description,
    page,
    source: srdSource,
  };
}
export const classes: CatalogOption[] = [
  option(
    "barbarian",
    "Bárbaro",
    "Barbarian",
    "Combate corpo a corpo com força e fúria.",
    28,
  ),
  option(
    "bard",
    "Bardo",
    "Bard",
    "Inspiração, expressão artística e magia.",
    31,
  ),
  option(
    "cleric",
    "Clérigo",
    "Cleric",
    "Magia divina e dedicação espiritual.",
    36,
  ),
  option(
    "druid",
    "Druida",
    "Druid",
    "Magia ligada à natureza e transformação.",
    41,
  ),
  option(
    "fighter",
    "Guerreiro",
    "Fighter",
    "Treinamento marcial com armas e armaduras.",
    47,
  ),
  option(
    "monk",
    "Monge",
    "Monk",
    "Disciplina corporal, mobilidade e artes marciais.",
    49,
  ),
  option(
    "paladin",
    "Paladino",
    "Paladin",
    "Juramento sagrado unido à capacidade marcial.",
    53,
  ),
  option(
    "ranger",
    "Patrulheiro",
    "Ranger",
    "Exploração, rastreamento e magia da natureza.",
    57,
  ),
  option(
    "rogue",
    "Ladino",
    "Rogue",
    "Perícia, furtividade e ataques oportunos.",
    61,
  ),
  option(
    "sorcerer",
    "Feiticeiro",
    "Sorcerer",
    "Poder mágico inato e flexível.",
    64,
  ),
  option(
    "warlock",
    "Bruxo",
    "Warlock",
    "Magia obtida por um pacto sobrenatural.",
    70,
  ),
  option(
    "wizard",
    "Mago",
    "Wizard",
    "Estudo arcano e preparação de magias.",
    77,
  ),
];
export const species: CatalogOption[] = [
  option(
    "dragonborn",
    "Draconato",
    "Dragonborn",
    "Herança dracônica e sopro elemental.",
    84,
  ),
  option("dwarf", "Anão", "Dwarf", "Resistência e afinidade com a pedra.", 84),
  option(
    "elf",
    "Elfo",
    "Elf",
    "Herança feérica, sentidos atentos e transe.",
    84,
  ),
  option("gnome", "Gnomo", "Gnome", "Pequena estatura e afinidade mágica.", 85),
  option(
    "goliath",
    "Golias",
    "Goliath",
    "Ancestralidade de gigantes e grande vigor.",
    85,
  ),
  option(
    "halfling",
    "Halfling",
    "Halfling",
    "Pequena estatura, coragem e sorte.",
    86,
  ),
  option(
    "human",
    "Humano",
    "Human",
    "Versatilidade e disposição para aprender.",
    86,
  ),
  option("orc", "Orc", "Orc", "Resiliência e explosões de energia.", 86),
  option(
    "tiefling",
    "Tiefling",
    "Tiefling",
    "Herança dos planos inferiores e dons mágicos.",
    86,
  ),
];
export const backgrounds: CatalogOption[] = [
  option(
    "acolyte",
    "Acólito",
    "Acolyte",
    "Uma formação ligada à prática religiosa.",
    83,
  ),
  option(
    "criminal",
    "Criminoso",
    "Criminal",
    "Experiência nas margens da lei.",
    83,
  ),
  option("sage", "Sábio", "Sage", "Uma vida dedicada ao estudo.", 83),
  option(
    "soldier",
    "Soldado",
    "Soldier",
    "Treinamento e experiência militar.",
    83,
  ),
];
export const subclasses: CatalogOption[] = [
  [
    "berserker",
    "Caminho do Berserker",
    "Path of the Berserker",
    "Fúria voltada ao combate intenso.",
    30,
    "barbarian",
  ],
  [
    "lore",
    "Colégio do Conhecimento",
    "College of Lore",
    "Tradição de aprendizado e versatilidade.",
    35,
    "bard",
  ],
  [
    "life",
    "Domínio da Vida",
    "Life Domain",
    "Dedicação à cura e à preservação da vida.",
    40,
    "cleric",
  ],
  [
    "land",
    "Círculo da Terra",
    "Circle of the Land",
    "Conexão mágica com os ambientes naturais.",
    46,
    "druid",
  ],
  [
    "champion",
    "Campeão",
    "Champion",
    "Aprimoramento da capacidade atlética e marcial.",
    49,
    "fighter",
  ],
  [
    "open-hand",
    "Guerreiro da Mão Aberta",
    "Warrior of the Open Hand",
    "Técnica e controle no combate desarmado.",
    52,
    "monk",
  ],
  [
    "devotion",
    "Juramento da Devoção",
    "Oath of Devotion",
    "Compromisso com ideais de proteção e honra.",
    56,
    "paladin",
  ],
  [
    "hunter",
    "Caçador",
    "Hunter",
    "Especialização em enfrentar e perseguir ameaças.",
    61,
    "ranger",
  ],
  [
    "thief",
    "Ladrão",
    "Thief",
    "Agilidade e habilidade com objetos.",
    64,
    "rogue",
  ],
  [
    "draconic",
    "Feitiçaria Dracônica",
    "Draconic Sorcery",
    "Magia inata ligada ao poder dos dragões.",
    69,
    "sorcerer",
  ],
  [
    "fiend",
    "Patrono Ínfero",
    "Fiend Patron",
    "Pacto com uma entidade dos planos inferiores.",
    76,
    "warlock",
  ],
  [
    "evoker",
    "Evocador",
    "Evoker",
    "Especialização em magia de evocação.",
    82,
    "wizard",
  ],
].map(([id, name, original, description, page, classId]) => ({
  ...option(
    String(id),
    String(name),
    String(original),
    String(description),
    Number(page),
  ),
  classId: `srd521-${classId}`,
  minimumLevel: 3,
}));
export function searchCatalog(options: CatalogOption[], query: string) {
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR");
  const term = normalize(query.trim());
  return options.filter((item) =>
    normalize(`${item.name} ${item.originalName} ${item.description}`).includes(
      term,
    ),
  );
}
