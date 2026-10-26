"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "./core-form";
export type InviteItem = {
  id: string;
  expiresAt: string;
  revokedAt: string | null;
  maxUses: number | null;
  useCount: number;
};
export function Invites({
  campaignId,
  items,
  archived,
}: {
  campaignId: string;
  items: InviteItem[];
  archived: boolean;
}) {
  const router = useRouter();
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const data = new FormData(event.currentTarget);
    try {
      const result = await apiRequest(
        `/api/campaigns/${campaignId}/invites`,
        "POST",
        {
          expiresInHours: Number(data.get("hours")),
          maxUses: Number(data.get("uses")),
        },
      );
      setLink(String(result.link));
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível criar o convite.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function revoke(id: string) {
    setBusy(true);
    try {
      await apiRequest(
        `/api/campaigns/${campaignId}/invites/${id}`,
        "DELETE",
        {},
      );
      setLink("");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Não foi possível revogar.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="core-section">
      <h2>Convites para jogadores</h2>
      <p>
        O link é exibido apenas ao criar. Compartilhe somente com quem deve
        entrar na campanha.
      </p>
      <form className="core-form" onSubmit={create}>
        <fieldset disabled={busy || archived}>
          <label>
            Validade em horas
            <input
              name="hours"
              type="number"
              min={1}
              max={720}
              defaultValue={168}
              required
            />
          </label>
          <label>
            Limite de usos
            <input
              name="uses"
              type="number"
              min={1}
              max={100}
              defaultValue={1}
              required
            />
          </label>
          <button className="button" type="submit">
            Gerar convite
          </button>
        </fieldset>
      </form>
      {link && (
        <label>
          Link do convite
          <input
            className="share-link"
            value={link}
            readOnly
            onFocus={(event) => event.target.select()}
          />
        </label>
      )}
      {message && <p role="alert">{message}</p>}
      <ul className="member-list">
        {items.map((item) => (
          <li key={item.id}>
            <span>
              {item.revokedAt ? "Revogado" : "Convite"} · {item.useCount}/
              {item.maxUses ?? "∞"} usos · expira em{" "}
              <time dateTime={item.expiresAt}>
                {new Intl.DateTimeFormat("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(new Date(item.expiresAt))}{" "}
                (São Paulo)
              </time>
            </span>
            {!item.revokedAt && (
              <button
                className="button"
                type="button"
                disabled={busy}
                onClick={() => revoke(item.id)}
              >
                Revogar
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
