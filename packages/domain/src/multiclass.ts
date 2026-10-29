import { library, sources } from "../../catalog/src/library";
import {
  characterClassSchema,
  abilityKeys,
  type CharacterInput,
  type CharacterClassInput,
} from "../../contracts/src/characters";
import {
  totalLevel,
  prerequisiteIssues,
  validateAcquisition,
} from "../../rules/src/multiclass";
import { DomainError } from "./errors";
import { validateCharacterOptions } from "./character-options";
function invalid(message: string): never {
  throw new DomainError(400, "INVALID_MULTICLASS", message);
}
export function normalizeClasses(
  input: CharacterInput,
  isGM: boolean,
  previous?: CharacterInput,
) {
  if (!input.classes && (previous?.classes?.length ?? 0) > 1)
    throw new DomainError(
      409,
      "CLASSES_REQUIRED",
      "Esta ficha tem várias classes. Atualize o editor antes de salvar.",
    );
  const rows = input.classes ?? [
    characterClassSchema.parse({
      classId: input.classId ?? null,
      className: input.className,
      subclassId: input.subclassId ?? null,
      subclassName: input.subclassName ?? "",
      level: input.level,
      rulesVersion: input.classId ? "2024" : "custom",
    }),
  ];
  let level: number;
  try {
    level = totalLevel(rows);
    validateAcquisition(rows);
  } catch (e) {
    invalid((e as Error).message);
  }
  const keys = rows.map(
    (row) =>
      row.classId ??
      row.className
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase(),
  );
  if (new Set(keys).size !== keys.length)
    invalid("Distribua os níveis de cada classe em um único vínculo.");
  const issues = prerequisiteIssues(rows, input.attributes);
  const classes: CharacterClassInput[] = rows.map((row) => {
    validateCharacterOptions({ ...input, ...row });
    const known = library.classes.find((item) => item.id === row.classId);
    const sub = library.subclasses.find((item) => item.id === row.subclassId);
    if (known && row.rulesVersion !== known.source.edition)
      invalid("A versão de regras não corresponde à classe selecionada.");
    if (sub?.id === "tce2020-mercy" && row.rulesVersion === "2024")
      issues.push(
        "Caminho da Misericórdia (2020) tem revisão em 2024; use Guerreiro da Misericórdia ou registre uma exceção.",
      );
    if (
      !known &&
      !sources.some(
        (s) => s.id === row.sourceId && s.content !== "redistributable",
      )
    )
      invalid("Fonte personalizada desconhecida.");
    return {
      ...row,
      sourceId: known?.source.id ?? row.sourceId,
      subclassSourceId: sub?.source.id ?? (row.subclassName ? "custom" : null),
    };
  });
  const adjustment =
    input.multiclassAdjustment ?? previous?.multiclassAdjustment ?? "";
  if (!isGM && adjustment !== (previous?.multiclassAdjustment ?? ""))
    throw new DomainError(
      403,
      "GM_ADJUSTMENT_REQUIRED",
      "Somente o mestre pode autorizar ajustes.",
    );
  const signature = (value: CharacterInput) =>
    JSON.stringify({
      classes: value.classes?.map((row) => [
        row.classId,
        row.className,
        row.subclassId,
        row.subclassName,
        row.level,
        row.rulesVersion,
        row.sourceId,
        row.subclassSourceId,
        row.acquisitionLevels,
      ]),
      attributes: abilityKeys.map((ability) => value.attributes[ability]),
    });
  const unchangedApproval =
    previous &&
    adjustment &&
    signature({ ...input, classes }) === signature(previous);
  if (issues.length && !(isGM && adjustment.length >= 10) && !unchangedApproval)
    invalid(
      `${issues.join(" ")} O mestre pode registrar uma justificativa de pelo menos 10 caracteres.`,
    );
  return {
    classes,
    level,
    multiclassAdjustment: adjustment,
    className: classes[0]!.className,
    classId: classes[0]!.classId,
    subclassName: classes[0]!.subclassName,
    subclassId: classes[0]!.subclassId,
  };
}
