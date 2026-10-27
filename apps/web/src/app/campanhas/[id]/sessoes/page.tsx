import Link from "next/link";
import { viewer } from "@/server/viewer";
import { campaigns, gameSessions } from "@/server/core";
import { CoreForm } from "@/components/core-form";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { token } = await viewer();
  const { id } = await params;
  const campaign = await campaigns().detail(token, id);
  const sessions = await gameSessions().list(token, id);
  return (
    <>
      <p className="eyebrow">{campaign.name}</p>
      <h1>Sessões da campanha</h1>
      <p className="lead">
        Prepare o grupo e registre seus personagens. A mesa virtual será
        desenvolvida em uma próxima etapa.
      </p>
      <Link href={`/campanhas/${id}`}>Voltar à campanha</Link>
      {campaign.role === "GM" && !campaign.archivedAt && (
        <section className="core-section">
          <h2>Criar sessão</h2>
          <CoreForm
            endpoint={`/api/campaigns/${id}/sessions`}
            label="Criar sessão"
            fields={[
              { name: "title", label: "Título da sessão", min: 2, max: 120 },
              {
                name: "description",
                label: "Descrição",
                type: "textarea",
                max: 10000,
              },
            ]}
          />
        </section>
      )}
      <section className="cards">
        {sessions.map((session) => (
          <Link
            className="feature-card"
            key={session.id}
            href={`/campanhas/${id}/sessoes/${session.id}`}
          >
            <h2>{session.title}</h2>
            <p>{session.description}</p>
          </Link>
        ))}
        {!sessions.length && <p>Nenhuma sessão criada.</p>}
      </section>
    </>
  );
}
