import { library } from "../../catalog/src/library";
const { classes, species, backgrounds, subclasses } = library;
import type { CharacterInput } from "../../contracts/src/characters";
import { DomainError } from "./errors";
/** IDs de catálogo são explícitos. Nunca inferir equivalência de uma ficha antiga pelo nome. */
export function validateCharacterOptions(data: CharacterInput) {
  const pairs = [
    ["classId", "className", classes],
    ["speciesId", "species", species],
    ["backgroundId", "backgroundName", backgrounds],
    ["subclassId", "subclassName", subclasses],
  ] as const;
  for (const [key, name, options] of pairs) {
    const id = data[key];
    if (!id) continue;
    const selected = options.find((item) => item.id === id);
    if (!selected)
      throw new DomainError(
        400,
        "INVALID_CATALOG_OPTION",
        "Opção de catálogo desconhecida.",
      );
    if (selected.name !== data[name])
      throw new DomainError(
        400,
        "CATALOG_NAME_MISMATCH",
        "O nome não corresponde ao catálogo. Use a opção personalizada para editar livremente.",
      );
    if (
      key === "subclassId" &&
      (selected.classId !== data.classId ||
        data.level < (selected.minimumLevel ?? 3))
    )
      throw new DomainError(
        400,
        "SUBCLASS_UNAVAILABLE",
        "A subclasse não está disponível para esta classe e nível.",
      );
  }
}
