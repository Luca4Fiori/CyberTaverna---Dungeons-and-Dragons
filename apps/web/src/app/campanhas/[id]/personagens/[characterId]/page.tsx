import Link from "next/link";
import { notFound } from "next/navigation";
import { viewer } from "@/server/viewer";
import { characters, campaigns } from "@/server/core";
import { CharacterEditor } from "@/components/character-editor";
import { DomainError } from "../../../../../../../../packages/domain/src/errors";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string; characterId: string }>;
}) {
  const { token } = await viewer();
  const { id, characterId } = await params;
  const sheet = await characters()
    .get(token, id, characterId)
    .catch((error: unknown) => {
      if (error instanceof DomainError && error.status === 404) notFound();
      throw error;
    });
  const campaign = await campaigns().detail(token, id);
  const policy = await characters().policy(token, id);
  return (
    <>
      <p className="eyebrow">{campaign.name}</p>
      <h1>{sheet.name}</h1>
      <Link className="button" href={`/campanhas/${id}/personagens`}>
        Voltar aos personagens
      </Link>
      <CharacterEditor
        key={`${sheet.id}:${sheet.version}`}
        initial={sheet}
        campaignId={id}
        campaignName={campaign.name}
        ownId={policy.userId}
        isGM={policy.isGM}
        canCreate={false}
        members={campaign.members.map((member) => ({
          userId: member.userId,
          label: member.user.displayName,
        }))}
      />
    </>
  );
}
