"use client";
import { useId, useState } from "react";
import {
  searchCatalog,
  type CatalogOption,
} from "../../../../packages/catalog/src/index";
export function CatalogChoice({
  label,
  options,
  id,
  name,
  onChange,
  optional = false,
}: {
  label: string;
  options: CatalogOption[];
  id: string | null | undefined;
  name: string;
  onChange: (id: string | null, name: string) => void;
  optional?: boolean;
}) {
  const key = useId();
  const [query, setQuery] = useState("");
  const [manualSelected, setManualSelected] = useState(false);
  const custom = !id && (manualSelected || Boolean(name));
  const [edition, setEdition] = useState("");
  const [source, setSource] = useState("");
  const filtered = searchCatalog(options, query).filter(
    (item) =>
      (!edition || item.source.edition === edition) &&
      (!source || item.source.id === source),
  );
  const selected = options.find((item) => item.id === id);
  const rows =
    selected && !filtered.includes(selected)
      ? [selected, ...filtered]
      : filtered;
  return (
    <section className="catalog-choice">
      <h3>{label}</h3>
      <label>
        Buscar {label.toLocaleLowerCase("pt-BR")} no catálogo
        <input
          type="search"
          value={query}
          maxLength={120}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <details>
        <summary>Opções avançadas de {label.toLowerCase()}</summary>
        <div className="sheet-grid">
          <label>
            Edição de {label.toLowerCase()}
            <select
              aria-label={`Edição de ${label.toLowerCase()}`}
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
            >
              <option value="">Todas</option>
              {[...new Set(options.map((x) => x.source.edition))].map(
                (value) => (
                  <option key={value}>{value}</option>
                ),
              )}
            </select>
          </label>
          <label>
            Fonte de {label.toLowerCase()}
            <select
              aria-label={`Fonte de ${label.toLowerCase()}`}
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="">Todas</option>
              {[
                ...new Map(
                  options.map((x) => [x.source.id, x.source]),
                ).values(),
              ].map((value) => (
                <option key={value.id} value={value.id}>
                  {value.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {selected && (
          <p className="field-help">
            {selected.source.name} · edição {selected.source.edition} · versão{" "}
            {selected.source.version}
            {selected.page ? `, p. ${selected.page}` : ""}
          </p>
        )}
        <button
          type="button"
          className="button"
          onClick={() => {
            setSource("");
            setEdition("");
            setQuery("");
          }}
        >
          Limpar filtros de {label.toLowerCase()}
        </button>
      </details>
      <label>
        {label}
        <select
          aria-label={label}
          value={custom ? "custom" : (id ?? "")}
          onChange={(event) => {
            const value = event.target.value;
            setManualSelected(value === "custom");
            const item = options.find((option) => option.id === value);
            onChange(item?.id ?? null, item?.name ?? "");
          }}
        >
          <option value="">
            {optional ? "Não selecionar agora" : "Selecione uma opção"}
          </option>
          {rows.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} —{" "}
              {item.source.content === "reference-only"
                ? "Referência"
                : item.source.content === "user-content"
                  ? "Personalizada"
                  : "SRD"}
            </option>
          ))}
          <option value="custom">Personalizado / preenchimento manual</option>
        </select>
      </label>
      {!filtered.length && (
        <p>
          Nenhuma opção encontrada para estes filtros e nível. Limpe os filtros
          ou selecione uma opção personalizada.
        </p>
      )}
      {custom && (
        <label>
          {label} personalizada
          <input
            value={name}
            maxLength={80}
            onChange={(event) => onChange(null, event.target.value)}
            aria-describedby={`${key}-help`}
          />
        </label>
      )}
      <p id={`${key}-help`} className="field-help">
        {custom
          ? "Combine esta escolha com o mestre. Ela não aplica habilidades automaticamente."
          : selected
            ? `${selected.description} ${selected.compatibility === "legacy-manual" ? "Opção anterior: adaptação manual com o mestre." : ""}`
            : "Escolha uma opção para consultar a descrição."}
      </p>
    </section>
  );
}
