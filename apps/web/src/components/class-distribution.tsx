"use client";
import { useState } from "react";
import type { CharacterClassInput } from "../../../../packages/contracts/src/characters";
import { library } from "../../../../packages/catalog/src/library";
import { CatalogChoice } from "./catalog-choice";
function AcquisitionOrder({
  value,
  onChange,
}: {
  value: number[];
  onChange: (value: number[]) => void;
}) {
  const [text, setText] = useState(value.join(", "));
  return (
    <input
      placeholder="1, 2, 3"
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        onChange(
          event.target.value
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
            .map(Number),
        );
      }}
    />
  );
}
export const emptyClass = (): CharacterClassInput => ({
  classId: null,
  className: "",
  subclassId: null,
  subclassName: "",
  level: 1,
  rulesVersion: "2024",
  sourceId: "custom",
  subclassSourceId: null,
  acquisitionLevels: [],
});
export function ClassDistribution({
  rows,
  onChange,
}: {
  rows: CharacterClassInput[];
  onChange: (rows: CharacterClassInput[]) => void;
}) {
  function change(index: number, values: Partial<CharacterClassInput>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...values } : row)));
  }
  return (
    <section className="wizard-section" aria-label="Distribuição de classes">
      <h3>
        Classes e níveis · Total {rows.reduce((sum, row) => sum + row.level, 0)}{" "}
        / 20
      </h3>
      <p>
        Os requisitos de multiclasse são conferidos ao salvar. Habilidades,
        magias e bônus de origens continuam manuais.
      </p>
      {rows.map((row, index) => (
        <fieldset key={index} className="wizard-section">
          <legend>Classe {index + 1}</legend>
          <div className="catalog-grid">
            <CatalogChoice
              label={`Classe ${index + 1}`}
              options={library.classes}
              id={row.classId}
              name={row.className}
              onChange={(classId, className) =>
                change(index, {
                  classId,
                  className,
                  subclassId: null,
                  subclassName: "",
                  sourceId: classId ? "srd-5.2.1" : "custom",
                  rulesVersion: classId ? "2024" : "custom",
                })
              }
            />
            <label>
              Níveis na classe {index + 1}
              <input
                type="number"
                required
                min={1}
                max={20}
                value={Number.isNaN(row.level) ? "" : row.level}
                onChange={(e) =>
                  change(index, { level: e.target.valueAsNumber })
                }
              />
            </label>
            <CatalogChoice
              label={`Subclasse ${index + 1}`}
              options={library.subclasses.filter(
                (s) =>
                  s.classId === row.classId &&
                  row.level >= (s.minimumLevel ?? 3),
              )}
              id={row.subclassId}
              name={row.subclassName}
              optional
              onChange={(subclassId, subclassName) =>
                change(index, { subclassId, subclassName })
              }
            />
            <label>
              Regras da classe {index + 1}
              <select
                value={row.rulesVersion}
                disabled={Boolean(row.classId)}
                onChange={(e) =>
                  change(index, {
                    rulesVersion: e.target
                      .value as CharacterClassInput["rulesVersion"],
                  })
                }
              >
                <option value="2024">2024</option>
                <option value="2014">2014 (manual)</option>
                <option value="custom">Personalizadas</option>
              </select>
            </label>
            <label>
              Ordem de aquisição da classe {index + 1} (opcional)
              <AcquisitionOrder
                key={`${index}-${row.classId ?? row.className}`}
                value={row.acquisitionLevels}
                onChange={(acquisitionLevels) =>
                  change(index, { acquisitionLevels })
                }
              />
              <small>
                Se informada, distribua todos os níveis entre as classes, sem
                repetir.
              </small>
            </label>
          </div>
          {rows.length > 1 && (
            <button
              type="button"
              className="button"
              onClick={() => onChange(rows.filter((_, i) => i !== index))}
            >
              Remover classe {index + 1}
            </button>
          )}
        </fieldset>
      ))}
      <button
        type="button"
        className="button"
        disabled={rows.length >= 20}
        onClick={() => onChange([...rows, emptyClass()])}
      >
        Adicionar outra classe
      </button>
    </section>
  );
}
