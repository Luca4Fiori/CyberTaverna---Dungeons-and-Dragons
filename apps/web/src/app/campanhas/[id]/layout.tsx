import { notFound } from "next/navigation";
import { z } from "zod";
import { viewer } from "@/server/viewer";
import { campaigns } from "@/server/core";
import { CampaignNavigation } from "@/components/campaign-navigation";
import { DomainError } from "../../../../../../packages/domain/src/errors";
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { token } = await viewer();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const campaign = await campaigns()
    .detail(token, id)
    .catch((error: unknown) => {
      if (error instanceof DomainError && error.status === 404) notFound();
      throw error;
    });
  return (
    <>
      <CampaignNavigation id={id} name={campaign.name} />
      {children}
    </>
  );
}
