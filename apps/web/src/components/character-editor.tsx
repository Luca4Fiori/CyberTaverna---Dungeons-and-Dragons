"use client";
import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import {
  abilityKeys,
  abilityLabels,
  createCharacterSchema,
  characterFieldsSchema,
  type CharacterSheet,
  type CharacterInput,
} from "../../../../packages/contracts/src/characters";
import {
  classes,
  species,
  backgrounds,
  subclasses,
} from "../../../../packages/catalog/src/index";
import { abilityModifier } from "../../../../packages/rules/src/index";
import { CatalogChoice } from "./catalog-choice";
import { apiRequest } from "./core-form";
const subscribe = () => () => {};
const stages = ["Identidade", "Origens", "Atributos e defesa", "Revisão"];
export function CharacterEditor({
  campaignId,
  campaignName,
  initial,
  members,
  ownId,
  isGM,
  canCreate,
  returnSessionId,
}: {
  campaignId: string;
  campaignName?: string;
  initial?: CharacterSheet;
  members: { userId: string; label: string }[];
  ownId: string;
  isGM: boolean;
  canCreate: boolean;
  returnSessionId?: string;
}) {
  const router = useRouter();
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [data, setData] = useState<CharacterInput>(
    initial ?? {
      name: "",
      className: "",
      species: "",
      classId: null,
      speciesId: null,
      backgroundId: null,
      subclassId: null,
      backgroundName: "",
      subclassName: "",
      level: 1,
      experience: 0,
      hitPoints: 1,
      maxHitPoints: 1,
      temporaryHitPoints: 0,
      armorClass: 10,
      ownerId: ownId,
      attributes: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
    },
  );
  const [version, setVersion] = useState(initial?.version ?? 0);
  const [step, setStep] = useState(0);
  const [manual, setManual] = useState(Boolean(initial));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const editable = initial ? initial.canEdit : canCreate;
  const visible = (index: number) => manual || step === index;
  const change = (values: Partial<CharacterInput>) => {
    setData((previous) => ({ ...previous, ...values }));
    setMessage("");
  };
  function advance() {
    const fields = formRef.current?.querySelectorAll<
      HTMLInputElement | HTMLSelectElement
    >("section:not([hidden]) input, section:not([hidden]) select");
    if (fields && [...fields].some((field) => !field.reportValidity())) return;
    if (step === 1 && (!data.className.trim() || !data.species.trim())) {
      setFailed(true);
      setMessage(
        "Escolha uma classe e uma espécie, ou preencha opções personalizadas.",
      );
      return;
    }
    if (step === 2) {
      const parsed = characterFieldsSchema
        .strip()
        .refine((value) => value.hitPoints <= value.maxHitPoints, {
          message: "PV atuais não podem ultrapassar os máximos.",
        })
        .safeParse(data);
      if (!parsed.success) {
        setFailed(true);
        setMessage(parsed.error.issues.map((issue) => issue.message).join(" "));
        return;
      }
    }
    setMessage("");
    setStep(step + 1);
    setTimeout(() => heading.current?.focus(), 0);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!manual && step < 3) {
      advance();
      return;
    }
    setBusy(true);
    setMessage("");
    setFailed(false);
    // Envie apenas campos do contrato, sem metadados da resposta (id, modifiers, canEdit).
    const input = {
      name: data.name,
      className: data.className,
      species: data.species,
      classId: data.classId ?? null,
      speciesId: data.speciesId ?? null,
      backgroundId: data.backgroundId ?? null,
      subclassId: data.subclassId ?? null,
      backgroundName: data.backgroundName ?? "",
      subclassName: data.subclassName ?? "",
      level: data.level,
      experience: data.experience,
      hitPoints: data.hitPoints,
      maxHitPoints: data.maxHitPoints,
      temporaryHitPoints: data.temporaryHitPoints,
      armorClass: data.armorClass,
      attributes: data.attributes,
      ...(isGM ? { ownerId: data.ownerId } : {}),
    };
    try {
      const parsed = createCharacterSchema.safeParse(input);
      if (!parsed.success)
        throw new Error(
          parsed.error.issues.map((issue) => issue.message).join(" "),
        );
      const result = await apiRequest(
        `/api/campaigns/${campaignId}/characters${initial ? `/${initial.id}` : ""}`,
        initial ? "PATCH" : "POST",
        { ...input, ...(initial ? { expectedVersion: version } : {}) },
      );
      setMessage("Ficha salva com sucesso.");
      if (initial) {
        setVersion(Number(result.version));
      } else {
        router.push(
          returnSessionId
            ? `/campanhas/${campaignId}/sessoes/${returnSessionId}`
            : `/campanhas/${campaignId}/personagens/${result.id}`,
        );
        router.refresh();
      }
    } catch (error) {
      setFailed(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }
  function numberField(
    key:
      | "level"
      | "experience"
      | "hitPoints"
      | "maxHitPoints"
      | "temporaryHitPoints"
      | "armorClass",
    label: string,
    min: number,
    max: number,
  ) {
    return (
      <label>
        {label}
        <input
          name={key}
          type="number"
          required
          min={min}
          max={max}
          value={Number.isNaN(data[key]) ? "" : data[key]}
          onChange={(event) => {
            const value = event.target.valueAsNumber;
            change({
              [key]: value,
              ...(key === "level" && data.subclassId && value < 3
                ? { subclassId: null, subclassName: "" }
                : {}),
            });
          }}
        />
      </label>
    );
  }
  return (
    <>
      <p className="lead">
        {campaignName ? `Campanha: ${campaignName}. ` : ""}A ficha permanece
        vinculada a esta campanha.{" "}
        {initial
          ? "Edite os valores com o controle de versão preservado."
          : "Escolha as origens, confira os atributos e revise antes de salvar."}
      </p>
      <form
        ref={formRef}
        className="character-sheet"
        onSubmit={submit}
        noValidate
      >
        <fieldset disabled={!ready || busy || !editable}>
          <div className="sheet-heading">
            <Sparkles size={26} />
            <div>
              <p className="eyebrow">REGISTRO DO AVENTUREIRO</p>
              <h2 ref={heading} tabIndex={-1}>
                {manual
                  ? "Ficha de personagem"
                  : `Etapa ${step + 1} de 4 · ${stages[step]}`}
              </h2>
            </div>
            {initial && <span className="badge">VERSÃO {version}</span>}
          </div>
          {
            <>
              <ol
                className="creation-progress"
                aria-label="Progresso da criação"
              >
                {stages.map((stage, index) => (
                  <li
                    key={stage}
                    aria-current={
                      !manual && index === step ? "step" : undefined
                    }
                  >
                    {index + 1}. {stage}
                  </li>
                ))}
              </ol>
              <button
                type="button"
                className="button"
                onClick={() => {
                  setManual(!manual);
                  setStep(0);
                  setMessage("");
                }}
              >
                {manual ? "Usar criação guiada" : "Preenchimento manual"}
              </button>
            </>
          }
          <section hidden={!visible(0)} className="wizard-section">
            <h3>Identidade</h3>
            <div className="sheet-grid">
              <label>
                Nome do personagem
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={120}
                  value={data.name}
                  onChange={(event) => change({ name: event.target.value })}
                />
              </label>
              {numberField("level", "Nível", 1, 20)}
              {numberField("experience", "Experiência", 0, 2000000000)}
              {isGM && (
                <label>
                  Responsável pela ficha
                  <select
                    name="ownerId"
                    value={data.ownerId ?? ownId}
                    onChange={(event) =>
                      change({ ownerId: event.target.value })
                    }
                  >
                    {members.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          </section>
          <section hidden={!visible(1)} className="wizard-section">
            <h3>Origens e especialização</h3>
            {manual ? (
              <div className="sheet-grid">
                <label>
                  Classe
                  <input
                    name="className"
                    required
                    maxLength={80}
                    value={data.className}
                    onChange={(event) =>
                      change({
                        className: event.target.value,
                        classId: null,
                        subclassId: null,
                      })
                    }
                  />
                </label>
                <label>
                  Espécie
                  <input
                    name="species"
                    required
                    maxLength={80}
                    value={data.species}
                    onChange={(event) =>
                      change({ species: event.target.value, speciesId: null })
                    }
                  />
                </label>
                <label>
                  Antecedente
                  <input
                    maxLength={80}
                    value={data.backgroundName ?? ""}
                    onChange={(event) =>
                      change({
                        backgroundName: event.target.value,
                        backgroundId: null,
                      })
                    }
                  />
                </label>
                <label>
                  Subclasse
                  <input
                    maxLength={80}
                    value={data.subclassName ?? ""}
                    onChange={(event) =>
                      change({
                        subclassName: event.target.value,
                        subclassId: null,
                      })
                    }
                  />
                </label>
              </div>
            ) : (
              <div className="catalog-grid">
                <CatalogChoice
                  label="Classe"
                  options={classes}
                  id={data.classId}
                  name={data.className}
                  onChange={(classId, className) =>
                    change({
                      classId,
                      className,
                      subclassId: null,
                      subclassName: "",
                    })
                  }
                />
                <CatalogChoice
                  label="Espécie"
                  options={species}
                  id={data.speciesId}
                  name={data.species}
                  onChange={(speciesId, name) =>
                    change({ speciesId, species: name })
                  }
                />
                <CatalogChoice
                  label="Antecedente"
                  options={backgrounds}
                  id={data.backgroundId}
                  name={data.backgroundName ?? ""}
                  onChange={(backgroundId, backgroundName) =>
                    change({ backgroundId, backgroundName })
                  }
                  optional
                />
                {data.level >= 3 ? (
                  <CatalogChoice
                    label="Subclasse"
                    options={subclasses.filter(
                      (item) => item.classId === data.classId,
                    )}
                    id={data.subclassId}
                    name={data.subclassName ?? ""}
                    onChange={(subclassId, subclassName) =>
                      change({ subclassId, subclassName })
                    }
                    optional
                  />
                ) : (
                  <p className="field-help">
                    As subclasses do catálogo ficam disponíveis no nível 3. Você
                    poderá escolhê-las ao evoluir.
                  </p>
                )}
              </div>
            )}
            <p className="field-help">
              As descrições orientam a escolha. Bônus de antecedentes, talentos,
              habilidades e magias ainda não são aplicados automaticamente. O
              preenchimento manual permite regras da sua mesa.
            </p>
          </section>
          <section hidden={!visible(2)} className="wizard-section">
            <h3>Atributos finais</h3>
            <p>
              Informe os valores combinados com o mestre, incluindo ajustes já
              escolhidos. Os modificadores são calculados automaticamente.
            </p>
            <div className="ability-grid">
              {abilityKeys.map((ability) => {
                const value = data.attributes[ability];
                const mod =
                  Number.isInteger(value) && value >= 1 && value <= 30
                    ? abilityModifier(value)
                    : null;
                return (
                  <label className="ability-card" key={ability}>
                    <span>{abilityLabels[ability]}</span>
                    <input
                      aria-label={abilityLabels[ability]}
                      type="number"
                      min={1}
                      max={30}
                      required
                      value={Number.isNaN(value) ? "" : value}
                      onChange={(event) =>
                        change({
                          attributes: {
                            ...data.attributes,
                            [ability]: event.target.valueAsNumber,
                          },
                        })
                      }
                    />
                    <output
                      aria-label={`Modificador de ${abilityLabels[ability]}`}
                    >
                      {mod === null ? "—" : `${mod >= 0 ? "+" : ""}${mod}`}
                    </output>
                    <small>modificador</small>
                  </label>
                );
              })}
            </div>
            <div className="sheet-grid vitality">
              {numberField("hitPoints", "PV atuais", 0, 100000)}
              {numberField("maxHitPoints", "PV máximos", 1, 100000)}
              {numberField("temporaryHitPoints", "PV temporários", 0, 100000)}
              {numberField("armorClass", "Classe de armadura", 0, 100)}
            </div>
            <p className="field-help">
              PV e CA têm preenchimento manual. Confirme-os com o mestre antes
              de salvar.
            </p>
          </section>
          {!manual && step === 3 && (
            <section className="wizard-section">
              <h3>Revise sua ficha</h3>
              <dl className="review-grid">
                {[
                  ["Campanha", campaignName ?? campaignId],
                  ["Personagem", data.name],
                  ["Classe", data.className],
                  ["Espécie", data.species],
                  ["Antecedente", data.backgroundName || "Não escolhido"],
                  ["Subclasse", data.subclassName || "Não escolhida"],
                  ["Nível / XP", `${data.level} / ${data.experience}`],
                  [
                    "PV / máximos / temporários",
                    `${data.hitPoints} / ${data.maxHitPoints} / ${data.temporaryHitPoints}`,
                  ],
                  ["CA", data.armorClass],
                  ...(isGM
                    ? [
                        [
                          "Responsável",
                          members.find(
                            (member) => member.userId === data.ownerId,
                          )?.label ?? "",
                        ],
                      ]
                    : []),
                  ...abilityKeys.map((ability) => [
                    abilityLabels[ability],
                    `${data.attributes[ability]} (${abilityModifier(data.attributes[ability]) >= 0 ? "+" : ""}${abilityModifier(data.attributes[ability])})`,
                  ]),
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p>
                Nada foi salvo ainda. Volte para ajustar suas escolhas ou
                confirme abaixo.
              </p>
            </section>
          )}
          {editable && (
            <div className="inline-links">
              {!manual && step > 0 && (
                <button
                  type="button"
                  className="button"
                  onClick={() => {
                    setStep(step - 1);
                    setMessage("");
                  }}
                >
                  Voltar
                </button>
              )}
              {!manual && step < 3 ? (
                <button
                  key="advance"
                  type="button"
                  className="button primary"
                  onClick={(event) => {
                    event.preventDefault();
                    advance();
                  }}
                >
                  Continuar
                </button>
              ) : (
                <button key="save" type="submit" className="button primary">
                  {busy ? "Salvando…" : "Salvar personagem"}
                </button>
              )}
            </div>
          )}
        </fieldset>
        {message && (
          <p
            role={failed ? "alert" : "status"}
            className={failed ? "form-error" : "form-success"}
          >
            {message}
          </p>
        )}
        {!editable && (
          <p className="lead">
            Ficha somente para leitura. A campanha está arquivada ou o mestre
            bloqueou esta operação.
          </p>
        )}
      </form>
      {returnSessionId && (
        <Link
          className="button"
          href={`/campanhas/${campaignId}/sessoes/${returnSessionId}`}
        >
          Voltar à sessão
        </Link>
      )}
      <p className="sheet-help">
        Catálogo baseado no <Link href="/atribuicoes">SRD 5.2.1</Link>, com
        descrições próprias em português. A seleção não substitui o motor
        completo de regras.
      </p>
    </>
  );
}
