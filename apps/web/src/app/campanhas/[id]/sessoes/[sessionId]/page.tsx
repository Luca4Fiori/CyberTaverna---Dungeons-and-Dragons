import Link from "next/link";
import { viewer } from "@/server/viewer";
import { characters, gameSessions } from "@/server/core";
import { SessionControls } from "@/components/session-controls";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const { token } = await viewer();
  const { id, sessionId } = await params;
  const session = await gameSessions().get(token, id, sessionId);
  const sheets = await characters().list(token, id);
  const status = {
    PLANNED: "Planejada",
    ACTIVE: "Em andamento",
    FINISHED: "Encerrada",
    CANCELLED: "Cancelada",
  }[session.status];
  return (
    <>
      <p className="eyebrow">SALA DE PREPARAÇÃO · {status}</p>
      <h1>{session.title}</h1>
      <p className="lead">{session.description}</p>
      <Link href={`/campanhas/${id}/sessoes`}>Todas as sessões</Link>
      <SessionControls
        campaignId={id}
        sessionId={sessionId}
        isGM={session.role === "GM"}
        closed={
          session.archived || ["FINISHED", "CANCELLED"].includes(session.status)
        }
        characters={sheets}
      />
      <section className="core-section">
        <h2>Participantes registrados</h2>
        <p>
          O registro persiste entre acessos e não representa presença online.
          Atualize a página para consultar alterações.
        </p>
        <ul className="member-list">
          {session.participants.map((participant) => (
            <li key={participant.userId}>
              <span>
                {participant.member.user.displayName} ·{" "}
                {participant.member.role === "GM" ? "Mestre" : "Jogador"}
              </span>
              <span>{participant.character?.name ?? "Sem personagem"}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
