"use client";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Heart, Sparkles } from "lucide-react";
import {
  abilityKeys,
  abilityLabels,
  type CharacterSheet,
} from "../../../../packages/contracts/src/characters";
import { abilityModifier } from "../../../../packages/rules/src/index";
import { apiRequest } from "./core-form";
const subscribe = () => () => {};
export function CharacterEditor({
  campaignId,
  initial,
  members,
  ownId,
  isGM,
  canCreate,
}: {
  campaignId: string;
  initial?: CharacterSheet;
  members: { userId: string; label: string }[];
  ownId: string;
  isGM: boolean;
  canCreate: boolean;
}) {
  const router = useRouter();
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [attributes, setAttributes] = useState(
    initial?.attributes ?? {
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10,
    },
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const editable = initial ? initial.canEdit : canCreate;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const data = {
      name: String(form.get("name")),
      className: String(form.get("className")),
      species: String(form.get("species")),
      level: Number(form.get("level")),
      experience: Number(form.get("experience")),
      hitPoints: Number(form.get("hitPoints")),
      maxHitPoints: Number(form.get("maxHitPoints")),
      temporaryHitPoints: Number(form.get("temporaryHitPoints")),
      armorClass: Number(form.get("armorClass")),
      attributes,
      ...(isGM ? { ownerId: String(form.get("ownerId")) } : {}),
      ...(initial ? { expectedVersion: initial.version } : {}),
    };
    try {
      const result = await apiRequest(
        `/api/campaigns/${campaignId}/characters${initial ? `/${initial.id}` : ""}`,
        initial ? "PATCH" : "POST",
        data,
      );
      setMessage("Ficha salva no banco de dados.");
      if (!initial)
        router.push(`/campanhas/${campaignId}/personagens/${result.id}`);
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Não foi possível salvar.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <form className="character-sheet" onSubmit={submit}>
        <fieldset disabled={!ready || busy || !editable}>
          <div className="sheet-heading">
            <Sparkles size={26} />
            <div>
              <p className="eyebrow">REGISTRO DO AVENTUREIRO</p>
              <h2>
                {initial ? "Ficha de personagem" : "Um novo nome na história"}
              </h2>
            </div>
            {initial && <span className="badge">VERSÃO {initial.version}</span>}
          </div>
          <div className="sheet-grid">
            <label>
              Nome do personagem
              <input
                name="name"
                required
                minLength={2}
                maxLength={120}
                defaultValue={initial?.name}
              />
            </label>
            <label>
              Classe
              <input
                name="className"
                required
                maxLength={80}
                defaultValue={initial?.className}
                placeholder="Ex.: Guerreiro"
              />
            </label>
            <label>
              Espécie
              <input
                name="species"
                required
                maxLength={80}
                defaultValue={initial?.species}
                placeholder="Ex.: Humano"
              />
            </label>
            <label>
              Nível
              <input
                name="level"
                type="number"
                min={1}
                max={20}
                required
                defaultValue={initial?.level ?? 1}
              />
            </label>
            <label>
              Experiência
              <input
                name="experience"
                type="number"
                min={0}
                max={2000000000}
                required
                defaultValue={initial?.experience ?? 0}
              />
            </label>
            {isGM && (
              <label>
                Responsável pela ficha
                <select name="ownerId" defaultValue={initial?.ownerId ?? ownId}>
                  {members.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <h3 className="sheet-section-title">Os seis atributos</h3>
          <div className="ability-grid">
            {abilityKeys.map((ability) => {
              const value = attributes[ability];
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
                      setAttributes({
                        ...attributes,
                        [ability]: event.target.valueAsNumber,
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
            <label>
              <Heart size={18} /> PV atuais
              <input
                name="hitPoints"
                type="number"
                min={0}
                max={100000}
                required
                defaultValue={initial?.hitPoints ?? 1}
              />
            </label>
            <label>
              PV máximos
              <input
                name="maxHitPoints"
                type="number"
                min={1}
                max={100000}
                required
                defaultValue={initial?.maxHitPoints ?? 1}
              />
            </label>
            <label>
              PV temporários
              <input
                name="temporaryHitPoints"
                type="number"
                min={0}
                max={100000}
                required
                defaultValue={initial?.temporaryHitPoints ?? 0}
              />
            </label>
            <label>
              <Shield size={18} /> Classe de armadura
              <input
                name="armorClass"
                type="number"
                min={0}
                max={100}
                required
                defaultValue={initial?.armorClass ?? 10}
              />
            </label>
          </div>
          {editable && (
            <button className="button primary" type="submit">
              {busy ? "Salvando…" : "Salvar personagem"}
            </button>
          )}
        </fieldset>
        {message && (
          <p role="status" className="sheet-message">
            {message}
          </p>
        )}
        {!editable && (
          <p className="lead">
            Ficha somente para leitura. A campanha pode estar arquivada ou o
            mestre pode ter bloqueado a edição.
          </p>
        )}
      </form>
      <p className="sheet-help">
        Modificadores são calculados automaticamente. Classe, espécie, nível,
        XP, PV e CA têm preenchimento manual; não aplicamos habilidades ou
        evolução automaticamente. Atributos acima de 20 permitem ajustes
        definidos pelo mestre.{" "}
        <Link href="/atribuicoes">Referência: SRD 5.2.1</Link>.
      </p>
    </>
  );
}
