import { viewer } from "@/server/viewer";
import { characters, campaigns, gameSessions } from "@/server/core";
import { z } from "zod";
import { CharacterEditor } from "@/components/character-editor";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session?: string }>;
}) {
  const { token } = await viewer();
  const { id } = await params;
  const campaign = await campaigns().detail(token, id);
  const policy = await characters().policy(token, id);
  const query = await searchParams;
  let returnSessionId: string | undefined;
  if (z.uuid().safeParse(query.session).success) {
    const session = await gameSessions().get(token, id, query.session!);
    returnSessionId = session.id;
  }
  return (
    <>
      <p className="eyebrow">{campaign.name}</p>
      <h1>Criar personagem</h1>
      <CharacterEditor
        campaignId={id}
        campaignName={campaign.name}
        returnSessionId={returnSessionId}
        ownId={policy.userId}
        isGM={policy.isGM}
        canCreate={
          !policy.archived && (policy.isGM || policy.playersCanCreateCharacters)
        }
        members={campaign.members.map((member) => ({
          userId: member.userId,
          label: member.user.displayName,
        }))}
      />
    </>
  );
}
