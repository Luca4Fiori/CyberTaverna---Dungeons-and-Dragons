-- Additive: do not change background, classes, ownership, versions or attendance.
ALTER TABLE "Character"
 ADD COLUMN "description" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "personality" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "ideals" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "bonds" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "flaws" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "backstory" TEXT NOT NULL DEFAULT '';
-- Preserve any text saved using the preceding identity increment.
UPDATE "Character" SET "backstory" = "biography" WHERE "biography" <> '';
