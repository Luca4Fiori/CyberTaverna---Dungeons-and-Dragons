"use client";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "./core-form";
const subscribe = () => () => {};
export function SessionControls({
  campaignId,
  sessionId,
  isGM,
  closed,
  characters,
  selectedId,
  canCreate,
}: {
  campaignId: string;
  sessionId: string;
  isGM: boolean;
  closed: boolean;
  characters: { id: string; name: string }[];
  selectedId?: string;
  canCreate: boolean;
}) {
  const router = useRouter();
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState(characters);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(
    selectedId ?? (isGM ? "" : (characters[0]?.id ?? "")),
  );
  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/campaigns/${campaignId}/eligible-characters?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        if (!response.ok)
          throw new Error("Não foi possível buscar personagens.");
        const rows: { id: string; name: string }[] = await response.json();
        setOptions(rows);
      } catch (error) {
        if (!controller.signal.aborted)
          setMessage(
            error instanceof Error ? error.message : "Falha na busca.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [campaignId, query]);
  const visible = query ? options : characters;
  const chosen = [...characters, ...options].find(
    (item) => item.id === selected,
  );
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
      <p>
        {selectedId
          ? "Seu personagem registrado foi selecionado."
          : isGM
            ? "Você pode participar como mestre ou escolher uma ficha desta campanha."
            : "Sugerimos suas fichas desta campanha. Confirme a escolha para participar."}
      </p>
      <fieldset disabled={!ready || closed || busy}>
        <label>
          Buscar personagem elegível
          <input
            type="search"
            maxLength={120}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setLoading(false);
            }}
          />
        </label>
        {loading && <p role="status">Buscando personagens…</p>}
        <label>
          Personagem para esta sessão
          <select
            name="characterId"
            required={!isGM}
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
          >
            {isGM && <option value="">Participar como mestre</option>}
            {!isGM && <option value="">Escolha seu personagem</option>}
            {chosen && !visible.some((item) => item.id === chosen.id) && (
              <option value={chosen.id}>{chosen.name}</option>
            )}
            {visible.map((character) => (
              <option key={character.id} value={character.id}>
                {character.name}
              </option>
            ))}
          </select>
        </label>
        <button className="button primary" disabled={!isGM && !selected}>
          Registrar participação
        </button>
      </fieldset>
      {!visible.length && (
        <p>
          Nenhuma ficha elegível encontrada. Somente personagens autorizados
          desta campanha podem participar.
        </p>
      )}
      {canCreate && !closed && (
        <Link
          href={`/campanhas/${campaignId}/personagens/novo?session=${sessionId}`}
        >
          Criar personagem nesta campanha
        </Link>
      )}
      <p role="status">{message}</p>
    </form>
  );
}
