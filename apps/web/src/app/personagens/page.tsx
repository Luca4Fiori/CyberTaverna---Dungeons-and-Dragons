import Link from "next/link";
import { viewer } from "@/server/viewer";
import { campaigns } from "@/server/core";
export default async function Page() {
  const { token } = await viewer();
  const rows = await campaigns().list(token);
  return (
    <>
      <p className="eyebrow">HERÓIS DO INVERNO</p>
      <h1>Seus personagens</h1>
      <p className="lead">
        Escolha uma campanha para criar ou consultar suas fichas.
      </p>
      <div className="cards">
        {rows.map(({ campaign }) => (
          <Link
            className="feature-card"
            key={campaign.id}
            href={`/campanhas/${campaign.id}/personagens`}
          >
            <h2>{campaign.name}</h2>
          </Link>
        ))}
      </div>
      <Link href="/campanhas">Ver todas as campanhas</Link>
    </>
  );
}
