import { notFound } from "next/navigation";
import { z } from "zod";
import { viewer } from "@/server/viewer";
import { campaigns } from "@/server/core";
import { CoreForm } from "@/components/core-form";
import { Invites } from "@/components/invites";
import { DomainError } from "../../../../../../packages/domain/src/errors";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { token } = await viewer();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const service = campaigns();
  const campaign = await service.detail(token, id).catch((error: unknown) => {
    if (error instanceof DomainError && error.status === 404) notFound();
    throw error;
  });
  const invites =
    campaign.role === "GM" ? await service.invites(token, id) : [];
  return (
    <>
      <p className="eyebrow">
        {campaign.role === "GM" ? "MESTRE" : "JOGADOR"} ·{" "}
        {campaign.archivedAt ? "ARQUIVADA" : "ATIVA"}
      </p>
      <h1>{campaign.name}</h1>
      <p className="lead preserve-lines">
        {campaign.description || "Sem descrição."}
      </p>
      {campaign.role === "GM" && (
        <section className="core-section">
          <h2>Configurações da campanha</h2>
          <CoreForm
            endpoint={`/api/campaigns/${id}`}
            method="PATCH"
            label="Salvar campanha"
            fields={[
              {
                name: "name",
                label: "Nome da campanha",
                value: campaign.name,
                min: 2,
                max: 120,
              },
              {
                name: "description",
                label: "Descrição",
                type: "textarea",
                value: campaign.description,
                max: 10000,
              },
              {
                name: "archived",
                label: "Arquivar campanha (revoga os convites abertos)",
                type: "checkbox",
                checked: Boolean(campaign.archivedAt),
              },
            ]}
          />
        </section>
      )}
      <section className="core-section">
        <h2>Participantes</h2>
        <ul className="member-list">
          {campaign.members.map((member) => (
            <li key={member.userId}>
              <span>{member.user.displayName}</span>
              <span>{member.role === "GM" ? "Mestre" : "Jogador"}</span>
            </li>
          ))}
        </ul>
      </section>
      {campaign.role === "GM" && (
        <Invites
          campaignId={id}
          archived={Boolean(campaign.archivedAt)}
          items={invites.map((invite) => ({
            ...invite,
            expiresAt: invite.expiresAt.toISOString(),
            revokedAt: invite.revokedAt?.toISOString() ?? null,
          }))}
        />
      )}
    </>
  );
}
