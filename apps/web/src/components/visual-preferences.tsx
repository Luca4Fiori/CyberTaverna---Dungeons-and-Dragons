"use client";
import { useEffect } from "react";
export function VisualPreferences() {
  useEffect(() => {
    const apply = () => {
      try {
        const value: unknown = JSON.parse(
          localStorage.getItem("ct-rpg:visual") ?? "{}",
        );
        if (value && typeof value === "object") {
          const prefs = value as Record<string, unknown>;
          document.documentElement.dataset.motion =
            prefs.reducedMotion === true ? "reduced" : "full";
          document.documentElement.dataset.effects =
            prefs.effects === false ? "off" : "on";
          document.documentElement.dataset.quality =
            prefs.quality === "low" ? "low" : "full";
        }
      } catch {
        /* Preferências locais inválidas usam os padrões do CSS. */
      }
    };
    apply();
    window.addEventListener("storage", apply);
    window.addEventListener("ct-preferences", apply);
    return () => {
      window.removeEventListener("storage", apply);
      window.removeEventListener("ct-preferences", apply);
    };
  }, []);
  return null;
}
