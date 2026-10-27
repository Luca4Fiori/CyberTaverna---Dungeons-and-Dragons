-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "className" VARCHAR(80) NOT NULL DEFAULT '',
ADD COLUMN     "species" VARCHAR(80) NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "GameSessionParticipant" (
    "campaignId" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "characterId" UUID,
    "joinedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "GameSessionParticipant_pkey" PRIMARY KEY ("campaignId","sessionId","userId")
);

-- CreateIndex
CREATE INDEX "GameSessionParticipant_campaignId_characterId_idx" ON "GameSessionParticipant"("campaignId", "characterId");

-- AddForeignKey
ALTER TABLE "GameSessionParticipant" ADD CONSTRAINT "GameSessionParticipant_campaignId_sessionId_fkey" FOREIGN KEY ("campaignId", "sessionId") REFERENCES "GameSession"("campaignId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSessionParticipant" ADD CONSTRAINT "GameSessionParticipant_campaignId_userId_fkey" FOREIGN KEY ("campaignId", "userId") REFERENCES "CampaignMember"("campaignId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSessionParticipant" ADD CONSTRAINT "GameSessionParticipant_campaignId_characterId_fkey" FOREIGN KEY ("campaignId", "characterId") REFERENCES "Character"("campaignId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
