import type { CampaignRole } from "../../contracts/src/index";
export type Membership = {
  userId: string;
  campaignId: string;
  role: CampaignRole;
};
export function canManageCampaign(
  userId: string,
  campaignId: string,
  membership: Membership | null,
): boolean {
  return (
    membership?.userId === userId &&
    membership.campaignId === campaignId &&
    membership.role === "GM"
  );
}
export function canMoveToken(
  userId: string,
  campaignId: string,
  membership: Membership | null,
  controllerId: string | null,
): boolean {
  if (
    !membership ||
    membership.userId !== userId ||
    membership.campaignId !== campaignId
  )
    return false;
  return membership.role === "GM" || controllerId === userId;
}
