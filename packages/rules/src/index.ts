/** Cálculos básicos; não representa o motor completo de D&D 2024. */
export function abilityModifier(score: number): number {
  if (!Number.isInteger(score) || score < 1 || score > 30)
    throw new RangeError("Atributo deve estar entre 1 e 30");
  return Math.floor((score - 10) / 2);
}
export function proficiencyBonus(level: number): number {
  if (!Number.isInteger(level) || level < 1 || level > 20)
    throw new RangeError("Nível deve estar entre 1 e 20");
  return 2 + Math.floor((level - 1) / 4);
}
