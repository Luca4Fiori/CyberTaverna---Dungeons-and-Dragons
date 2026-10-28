import Link from "next/link";
import { viewer } from "@/server/viewer";
import { characters, campaigns } from "@/server/core";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { token } = await viewer();
  const { id } = await params;
  const query = await searchParams;
  const page = Math.floor(
    Math.max(1, Math.min(10000, Number(query.page) || 1)),
  );
  const campaign = await campaigns().detail(token, id);
  const policy = await characters().policy(token, id);
  const rows = await characters().list(token, id, page);
  return (
    <>
      <p className="eyebrow">{campaign.name}</p>
      <h1>Personagens da campanha</h1>
      <p className="lead">
        {policy.isGM
          ? "Como mestre, você pode visualizar e editar todas as fichas desta campanha."
          : "Aqui estão as suas fichas. Personagens de outros jogadores permanecem protegidos."}
      </p>
      <div className="inline-links">
        {!policy.archived &&
          (policy.isGM || policy.playersCanCreateCharacters) && (
            <Link
              className="button primary"
              href={`/campanhas/${id}/personagens/novo`}
            >
              Criar personagem nesta campanha
            </Link>
          )}
        <Link className="button" href={`/campanhas/${id}`}>
          Voltar à campanha
        </Link>
      </div>
      {rows.length === 0 ? (
        <section className="empty-state">
          <h2>Nenhum personagem nesta página</h2>
          <p>Uma nova história começa com a sua primeira ficha.</p>
        </section>
      ) : (
        <div className="cards campaign-list">
          {rows.map((row) => (
            <Link
              className="feature-card"
              key={row.id}
              href={`/campanhas/${id}/personagens/${row.id}`}
            >
              <p className="eyebrow">
                NÍVEL {row.level} · {row.species || "Espécie não informada"}
              </p>
              <h2>{row.name}</h2>
              <p>
                {row.className || "Classe não informada"} · PV {row.hitPoints}/
                {row.maxHitPoints} · CA {row.armorClass}
              </p>
              <span className="small-tag">
                {row.canEdit ? "Abrir ficha" : "Somente leitura"}
              </span>
            </Link>
          ))}
        </div>
      )}
      <div className="inline-links">
        {page > 1 && <Link href={`?page=${page - 1}`}>Página anterior</Link>}
        {rows.length === 20 && (
          <Link href={`?page=${page + 1}`}>Próxima página</Link>
        )}
      </div>
    </>
  );
}
