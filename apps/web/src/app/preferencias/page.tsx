"use client";
import { useSyncExternalStore } from "react";
import { z } from "zod";
const preferencesSchema = z.object({
  reducedMotion: z.boolean(),
  effects: z.boolean(),
  quality: z.enum(["low", "medium", "high"]),
});
type Preferences = {
  reducedMotion: boolean;
  effects: boolean;
  quality: string;
};
const defaults = '{"reducedMotion":false,"effects":true,"quality":"medium"}';
function snapshot() {
  try {
    return localStorage.getItem("ct-rpg:visual") ?? defaults;
  } catch {
    return defaults;
  }
}
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("ct-preferences", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("ct-preferences", callback);
  };
}
export default function Page() {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const raw = useSyncExternalStore(subscribe, snapshot, () => defaults);
  let settings: Preferences;
  try {
    settings = preferencesSchema.parse(JSON.parse(raw));
  } catch {
    settings = JSON.parse(defaults) as Preferences;
  }
  function update(change: Partial<Preferences>) {
    try {
      localStorage.setItem(
        "ct-rpg:visual",
        JSON.stringify({ ...settings, ...change }),
      );
      window.dispatchEvent(new Event("ct-preferences"));
    } catch {
      window.alert("Não foi possível salvar as preferências neste navegador.");
    }
  }
  return (
    <>
      <p className="eyebrow">NO SEU RITMO</p>
      <h1>Preferências visuais</h1>
      <p className="lead">
        Ajustes salvos apenas neste navegador. A preferência de movimento do
        sistema também é respeitada.
      </p>
      <section className="settings-panel">
        <label>
          <span>
            Reduzir movimento<small>Desativa transições decorativas.</small>
          </span>
          <input
            disabled={!hydrated}
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(event) =>
              update({ reducedMotion: event.target.checked })
            }
          />
        </label>
        <label>
          <span>
            Efeitos ambientais
            <small>Ativa iluminação e decoração do cenário.</small>
          </span>
          <input
            disabled={!hydrated}
            type="checkbox"
            checked={settings.effects}
            onChange={(event) => update({ effects: event.target.checked })}
          />
        </label>
        <label>
          <span>
            Qualidade visual
            <small>A opção baixa remove brilhos decorativos.</small>
          </span>
          <select
            disabled={!hydrated}
            value={settings.quality}
            onChange={(event) => update({ quality: event.target.value })}
          >
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
        </label>
      </section>
    </>
  );
}
