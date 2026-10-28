"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function CampaignNavigation({ id, name }: { id: string; name: string }) {
  const path = usePathname();
  const base = `/campanhas/${id}`;
  return (
    <div className="campaign-context">
      <p>
        <Link href="/campanhas">Campanhas</Link> /{" "}
        <Link href={base}>{name}</Link>
      </p>
      <nav aria-label="Navegação da campanha" className="campaign-tabs">
        {[
          ["", "Visão da campanha"],
          ["/personagens", "Personagens"],
          ["/sessoes", "Sessões"],
        ].map(([suffix, label]) => (
          <Link
            key={suffix}
            href={`${base}${suffix}`}
            aria-current={
              (suffix ? path.startsWith(`${base}${suffix}`) : path === base)
                ? "page"
                : undefined
            }
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
