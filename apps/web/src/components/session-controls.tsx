"use client";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "./core-form";
const subscribe = () => () => {};
export function SessionControls({
  campaignId,
  sessionId,
  isGM,
  closed,
  characters,
}: {
  campaignId: string;
  sessionId: string;
  isGM: boolean;
  closed: boolean;
  characters: { id: string; name: string }[];
}) {
  const router = useRouter();
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await apiRequest(
        `/api/campaigns/${campaignId}/sessions/${sessionId}/join`,
        "POST",
        { characterId: form.get("characterId") || null },
      );
      setMessage("Participação registrada.");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Falha ao participar.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="core-form" onSubmit={submit}>
      <fieldset disabled={!ready || closed || busy}>
        <label>
          Personagem para esta sessão
          <select name="characterId" required={!isGM}>
            {isGM && <option value="">Participar como mestre</option>}
            {characters.map((character) => (
              <option key={character.id} value={character.id}>
                {character.name}
              </option>
            ))}
          </select>
        </label>
        <button
          className="button primary"
          disabled={!isGM && !characters.length}
        >
          Registrar participação
        </button>
      </fieldset>
      <p role="status">{message}</p>
    </form>
  );
}
