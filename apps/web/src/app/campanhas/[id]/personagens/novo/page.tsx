import { viewer } from "@/server/viewer";
import { characters, campaigns } from "@/server/core";
import { CharacterEditor } from "@/components/character-editor";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { token } = await viewer();
  const { id } = await params;
  const campaign = await campaigns().detail(token, id);
  const policy = await characters().policy(token, id);
  return (
    <>
      <p className="eyebrow">{campaign.name}</p>
      <h1>Criar personagem</h1>
      <CharacterEditor
        campaignId={id}
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
