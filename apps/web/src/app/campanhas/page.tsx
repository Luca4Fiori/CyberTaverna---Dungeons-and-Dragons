import Link from "next/link";
import { viewer } from "@/server/viewer";
import { campaigns } from "@/server/core";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { token } = await viewer();
  const query = await searchParams;
  const page = Math.floor(
    Math.min(10000, Math.max(1, Number(query.page) || 1)),
  );
  const entries = await campaigns().list(token, page);
  return (
    <>
      <p className="eyebrow">SEUS MUNDOS</p>
      <h1>Suas campanhas</h1>
      <div className="inline-links">
        <Link className="button primary" href="/campanhas/nova">
          Criar campanha
        </Link>
        <Link className="button" href="/convites">
          Aceitar convite
        </Link>
      </div>
      {entries.length === 0 ? (
        <section className="empty-state">
          <h2>Nenhuma campanha nesta página</h2>
          <p>Crie uma campanha ou aceite um convite do seu grupo.</p>
        </section>
      ) : (
        <div className="cards campaign-list">
          {entries.map(({ campaign, role }) => (
            <Link
              className="feature-card"
              key={campaign.id}
              href={`/campanhas/${campaign.id}`}
            >
              <p className="eyebrow">
                {role === "GM" ? "MESTRE" : "JOGADOR"} ·{" "}
                {campaign.archivedAt ? "ARQUIVADA" : "ATIVA"}
              </p>
              <h2>{campaign.name}</h2>
              <p>{campaign.description.slice(0, 180)}</p>
            </Link>
          ))}
        </div>
      )}
      <div className="inline-links">
        {page > 1 && (
          <Link href={`/campanhas?page=${page - 1}`}>Página anterior</Link>
        )}
        {entries.length === 20 && (
          <Link href={`/campanhas?page=${page + 1}`}>Próxima página</Link>
        )}
      </div>
    </>
  );
}
