import type {
  Ability,
  CharacterClassInput,
} from "../../contracts/src/characters";
/** SRD 5.2.1, multiclassing pp. 24–25 and class primary abilities. OR inside each group. */
const prerequisites: Record<string, Ability[][]> = {
  barbarian: [["STR"]],
  bard: [["CHA"]],
  cleric: [["WIS"]],
  druid: [["WIS"]],
  fighter: [["STR", "DEX"]],
  monk: [["DEX"], ["WIS"]],
  paladin: [["STR"], ["CHA"]],
  ranger: [["DEX"], ["WIS"]],
  rogue: [["DEX"]],
  sorcerer: [["CHA"]],
  warlock: [["CHA"]],
  wizard: [["INT"]],
};
export function totalLevel(rows: Pick<CharacterClassInput, "level">[]) {
  if (
    !rows.length ||
    rows.some((r) => !Number.isInteger(r.level) || r.level < 1 || r.level > 20)
  )
    throw new Error("Cada classe precisa ter entre 1 e 20 níveis.");
  const total = rows.reduce((sum, row) => sum + row.level, 0);
  if (total > 20) throw new Error("O nível total não pode ultrapassar 20.");
  return total;
}
export function prerequisiteIssues(
  rows: CharacterClassInput[],
  attributes: Record<Ability, number>,
): string[] {
  if (rows.length < 2) return [];
  return rows.flatMap((row) => {
    const groups = row.classId?.startsWith("srd521-")
      ? prerequisites[row.classId.slice(7)]
      : undefined;
    if (!groups)
      return [
        `${row.className}: requisitos personalizados precisam de aprovação do mestre.`,
      ];
    return groups
      .filter((group) => !group.some((a) => attributes[a] >= 13))
      .map((group) => `${row.className}: requer ${group.join(" ou ")} 13.`);
  });
}
/** A full acquisition sequence is optional, but partial/duplicate sequences are never invented. */
export function validateAcquisition(rows: CharacterClassInput[]) {
  const total = totalLevel(rows);
  if (rows.every((row) => row.acquisitionLevels.length === 0)) return;
  const sequence = rows.flatMap((row) => row.acquisitionLevels);
  if (
    rows.some((row) => row.acquisitionLevels.length !== row.level) ||
    new Set(sequence).size !== total ||
    sequence.some((n) => !Number.isInteger(n) || n < 1 || n > total)
  )
    throw new Error(
      "Informe a ordem completa: cada nível total deve aparecer uma única vez.",
    );
}
