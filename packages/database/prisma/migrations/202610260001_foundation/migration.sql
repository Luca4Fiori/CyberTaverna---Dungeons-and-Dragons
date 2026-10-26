-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
-- Domain constraints below are maintained in SQL because Prisma does not model CHECK.
CREATE TYPE "GlobalRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "CampaignRole" AS ENUM ('GM', 'PLAYER');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PLANNED', 'ACTIVE', 'FINISHED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" VARCHAR(80) NOT NULL,
    "globalRole" "GlobalRole" NOT NULL DEFAULT 'USER',
    "suspendedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "userId" UUID NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "reducedMotion" BOOLEAN NOT NULL DEFAULT false,
    "effects" BOOLEAN NOT NULL DEFAULT true,
    "visualQuality" TEXT NOT NULL DEFAULT 'medium',

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "archivedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignMember" (
    "campaignId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "CampaignRole" NOT NULL DEFAULT 'PLAYER',
    "joinedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignMember_pkey" PRIMARY KEY ("campaignId","userId")
);

-- CreateTable
CREATE TABLE "CampaignSettings" (
    "campaignId" UUID NOT NULL,
    "playersCanCreateCharacters" BOOLEAN NOT NULL DEFAULT true,
    "playersCanEditCharacters" BOOLEAN NOT NULL DEFAULT true,
    "homebrewEnabled" BOOLEAN NOT NULL DEFAULT false,
    "ruleOverrides" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "CampaignSettings_pkey" PRIMARY KEY ("campaignId")
);

-- CreateTable
CREATE TABLE "CampaignInvite" (
    "id" UUID NOT NULL,
    "campaignId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "revokedAt" TIMESTAMPTZ(3),
    "maxUses" INTEGER,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" UUID NOT NULL,
    "campaignId" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "hitPoints" INTEGER NOT NULL DEFAULT 1,
    "maxHitPoints" INTEGER NOT NULL DEFAULT 1,
    "temporaryHitPoints" INTEGER NOT NULL DEFAULT 0,
    "armorClass" INTEGER NOT NULL DEFAULT 10,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterAttribute" (
    "characterId" UUID NOT NULL,
    "ability" VARCHAR(3) NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "CharacterAttribute_pkey" PRIMARY KEY ("characterId","ability")
);

-- CreateTable
CREATE TABLE "CharacterHistory" (
    "id" UUID NOT NULL,
    "characterId" UUID NOT NULL,
    "actorId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "changes" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSession" (
    "id" UUID NOT NULL,
    "campaignId" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "scheduledAt" TIMESTAMPTZ(3),
    "status" "SessionStatus" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleMap" (
    "id" UUID NOT NULL,
    "campaignId" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "gridSize" INTEGER NOT NULL DEFAULT 64,
    "width" INTEGER NOT NULL DEFAULT 2048,
    "height" INTEGER NOT NULL DEFAULT 2048,
    "visible" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "BattleMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" UUID NOT NULL,
    "campaignId" UUID NOT NULL,
    "mapId" UUID NOT NULL,
    "controllerId" UUID,
    "name" VARCHAR(120) NOT NULL,
    "x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "size" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignNote" (
    "id" UUID NOT NULL,
    "campaignId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "body" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CampaignNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadedAsset" (
    "id" UUID NOT NULL,
    "campaignId" UUID NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "originalName" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadedAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "campaignId" UUID,
    "action" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "CampaignMember_userId_idx" ON "CampaignMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignInvite_tokenHash_key" ON "CampaignInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "CampaignInvite_campaignId_expiresAt_idx" ON "CampaignInvite"("campaignId", "expiresAt");

-- CreateIndex
CREATE INDEX "Character_campaignId_ownerId_idx" ON "Character"("campaignId", "ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Character_campaignId_id_key" ON "Character"("campaignId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterHistory_characterId_version_key" ON "CharacterHistory"("characterId", "version");

-- CreateIndex
CREATE INDEX "GameSession_campaignId_scheduledAt_idx" ON "GameSession"("campaignId", "scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "GameSession_campaignId_id_key" ON "GameSession"("campaignId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "BattleMap_campaignId_id_key" ON "BattleMap"("campaignId", "id");

-- CreateIndex
CREATE INDEX "Token_campaignId_mapId_visible_idx" ON "Token"("campaignId", "mapId", "visible");

-- CreateIndex
CREATE INDEX "CampaignNote_campaignId_private_idx" ON "CampaignNote"("campaignId", "private");

-- CreateIndex
CREATE UNIQUE INDEX "UploadedAsset_storageKey_key" ON "UploadedAsset"("storageKey");

-- CreateIndex
CREATE INDEX "UploadedAsset_campaignId_idx" ON "UploadedAsset"("campaignId");

-- CreateIndex
CREATE INDEX "AuditLog_campaignId_createdAt_idx" ON "AuditLog"("campaignId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMember" ADD CONSTRAINT "CampaignMember_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMember" ADD CONSTRAINT "CampaignMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignSettings" ADD CONSTRAINT "CampaignSettings_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignInvite" ADD CONSTRAINT "CampaignInvite_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_campaignId_ownerId_fkey" FOREIGN KEY ("campaignId", "ownerId") REFERENCES "CampaignMember"("campaignId", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterAttribute" ADD CONSTRAINT "CharacterAttribute_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterHistory" ADD CONSTRAINT "CharacterHistory_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleMap" ADD CONSTRAINT "BattleMap_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_campaignId_mapId_fkey" FOREIGN KEY ("campaignId", "mapId") REFERENCES "BattleMap"("campaignId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_campaignId_controllerId_fkey" FOREIGN KEY ("campaignId", "controllerId") REFERENCES "CampaignMember"("campaignId", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignNote" ADD CONSTRAINT "CampaignNote_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignNote" ADD CONSTRAINT "CampaignNote_campaignId_authorId_fkey" FOREIGN KEY ("campaignId", "authorId") REFERENCES "CampaignMember"("campaignId", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedAsset" ADD CONSTRAINT "UploadedAsset_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Domain integrity (Prisma does not represent CHECK constraints).
ALTER TABLE "Character" ADD CONSTRAINT "Character_bounds" CHECK ("level" BETWEEN 1 AND 20 AND "experience" >= 0 AND "hitPoints" >= 0 AND "maxHitPoints" >= 1 AND "temporaryHitPoints" >= 0 AND "version" >= 0);
ALTER TABLE "CharacterAttribute" ADD CONSTRAINT "CharacterAttribute_bounds" CHECK ("score" BETWEEN 1 AND 30 AND "ability" IN ('STR','DEX','CON','INT','WIS','CHA'));
ALTER TABLE "CampaignInvite" ADD CONSTRAINT "CampaignInvite_bounds" CHECK ("useCount" >= 0 AND ("maxUses" IS NULL OR ("maxUses" > 0 AND "useCount" <= "maxUses")));
ALTER TABLE "BattleMap" ADD CONSTRAINT "BattleMap_bounds" CHECK ("gridSize" > 0 AND "width" > 0 AND "height" > 0 AND "version" >= 0);
ALTER TABLE "Token" ADD CONSTRAINT "Token_bounds" CHECK ("size" > 0 AND "size" <= 1000 AND "version" >= 0 AND "x" BETWEEN -100000 AND 100000 AND "y" BETWEEN -100000 AND 100000 AND "rotation" BETWEEN -360 AND 360);
ALTER TABLE "UploadedAsset" ADD CONSTRAINT "UploadedAsset_size" CHECK ("sizeBytes" > 0);
