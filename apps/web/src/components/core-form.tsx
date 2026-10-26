"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
export type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "textarea" | "checkbox" | "number";
  value?: string;
  checked?: boolean;
  min?: number;
  max?: number;
  required?: boolean;
  autoComplete?: string;
};
export async function apiRequest(
  endpoint: string,
  method: string,
  body?: unknown,
) {
  const response = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error?.message ?? "Não foi possível concluir.");
  return data as Record<string, unknown>;
}
export function CoreForm({
  endpoint,
  method = "POST",
  fields = [],
  label,
  redirectTo,
  successMessage = "Alterações salvas.",
  tokenFromFragment = false,
  resultRoute,
}: {
  endpoint: string;
  method?: string;
  fields?: Field[];
  label: string;
  redirectTo?: string;
  successMessage?: string;
  tokenFromFragment?: boolean;
  resultRoute?: "campaign" | "invite";
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const secret = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (tokenFromFragment && secret.current && location.hash) {
      secret.current.value = location.hash.slice(1);
      history.replaceState(null, "", location.pathname);
    }
    const timeout = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(timeout);
  }, [tokenFromFragment]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError(false);
    const values = new FormData(event.currentTarget);
    const data: Record<string, unknown> = {};
    for (const field of fields)
      data[field.name] =
        field.type === "checkbox"
          ? values.has(field.name)
          : field.type === "number"
            ? Number(values.get(field.name))
            : values.get(field.name);
    if (tokenFromFragment) data.token = values.get("token");
    try {
      const result = await apiRequest(endpoint, method, data);
      setMessage(
        typeof result.message === "string" ? result.message : successMessage,
      );
      if (resultRoute)
        router.push(
          `/campanhas/${resultRoute === "campaign" ? result.id : result.campaignId}`,
        );
      else if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="core-form" onSubmit={submit}>
      <fieldset disabled={!ready || busy}>
        {fields.map((field) => (
          <label key={field.name}>
            {field.label}
            {field.type === "textarea" ? (
              <textarea
                name={field.name}
                defaultValue={field.value}
                maxLength={field.max}
                rows={5}
              />
            ) : (
              <input
                name={field.name}
                type={field.type ?? "text"}
                defaultValue={field.value}
                defaultChecked={field.checked}
                min={field.type === "number" ? field.min : undefined}
                max={field.type === "number" ? field.max : undefined}
                minLength={field.type !== "number" ? field.min : undefined}
                maxLength={field.type !== "number" ? field.max : undefined}
                required={field.required ?? field.type !== "checkbox"}
                autoComplete={field.autoComplete}
              />
            )}
          </label>
        ))}
        {tokenFromFragment && (
          <label>
            Código recebido
            <input
              ref={secret}
              name="token"
              required
              minLength={64}
              maxLength={64}
              autoComplete="off"
              spellCheck={false}
            />
          </label>
        )}
        <button className="button primary" type="submit">
          {busy ? "Aguarde…" : label}
        </button>
      </fieldset>
      {message && (
        <p
          role={error ? "alert" : "status"}
          className={error ? "form-error" : "form-success"}
        >
          {message}
        </p>
      )}
    </form>
  );
}
