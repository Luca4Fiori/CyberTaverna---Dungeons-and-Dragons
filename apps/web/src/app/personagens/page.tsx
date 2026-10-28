import Link from "next/link";
import { viewer } from "@/server/viewer";
import { characters } from "@/server/core";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { token } = await viewer();
  const query = await searchParams;
  const page = Math.floor(
    Math.max(1, Math.min(10000, Number(query.page) || 1)),
  );
  const rows = await characters().mine(token, page);
  return (
    <>
      <p className="eyebrow">HERÓIS DO INVERNO</p>
      <h1>Seus personagens</h1>
      <p className="lead">
        Suas fichas reunidas, cada uma no mundo ao qual pertence. Para criar
        outra, escolha a campanha em que vai jogar.
      </p>
      <Link className="button primary" href="/campanhas">
        Escolher campanha para criar personagem
      </Link>
      {rows.length ? (
        <div className="cards campaign-list">
          {rows.map((row) => (
            <Link
              className="feature-card"
              key={row.id}
              href={`/campanhas/${row.campaignId}/personagens/${row.id}`}
            >
              <p className="eyebrow">
                {row.campaign.name}
                {row.campaign.archivedAt ? " · Arquivada" : ""}
              </p>
              <h2>{row.name}</h2>
              <p>
                {row.className || "Classe não informada"} ·{" "}
                {row.species || "Espécie não informada"} · Nível {row.level}
              </p>
              <span className="small-tag">Abrir ficha</span>
            </Link>
          ))}
        </div>
      ) : (
        <section className="empty-state">
          <h2>Nenhuma ficha nesta página</h2>
          <p>
            Entre em uma campanha e abra a aba Personagens para começar sua
            história.
          </p>
        </section>
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
