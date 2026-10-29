-- Additive: preserve IDs, ownership, associations, names, levels and prior history.
ALTER TABLE "Character" ADD COLUMN "multiclassAdjustment" VARCHAR(1000) NOT NULL DEFAULT '';
CREATE TABLE "CharacterClass" (
  "characterId" UUID NOT NULL,
  "position" INTEGER NOT NULL CHECK ("position" BETWEEN 0 AND 19),
  "classId" VARCHAR(80), "className" VARCHAR(80) NOT NULL,
  "subclassId" VARCHAR(80), "subclassName" VARCHAR(80) NOT NULL DEFAULT '',
  "level" INTEGER NOT NULL CHECK ("level" BETWEEN 1 AND 20),
  "rulesVersion" VARCHAR(20) NOT NULL,
  "sourceId" VARCHAR(80) NOT NULL, "subclassSourceId" VARCHAR(80),
  "acquisitionLevels" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
  CONSTRAINT "CharacterClass_pkey" PRIMARY KEY ("characterId", "position"),
  CONSTRAINT "CharacterClass_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "CharacterClass" ("characterId", "position", "classId", "className", "subclassId", "subclassName", "level", "rulesVersion", "sourceId", "subclassSourceId")
SELECT id, 0, "classId", "className", "subclassId", "subclassName", level,
CASE WHEN "classId" LIKE 'srd521-%' THEN '2024' ELSE 'custom' END,
CASE WHEN "classId" LIKE 'srd521-%' THEN 'srd-5.2.1' ELSE 'custom' END,
CASE WHEN "subclassId" LIKE 'srd521-%' THEN 'srd-5.2.1' WHEN "subclassName" <> '' THEN 'custom' ELSE NULL END
FROM "Character";
