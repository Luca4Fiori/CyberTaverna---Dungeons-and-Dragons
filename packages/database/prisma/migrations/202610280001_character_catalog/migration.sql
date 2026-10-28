-- Migração aditiva: nenhuma ficha, associação, atributo ou histórico é reescrito.
ALTER TABLE "Character"
 ADD COLUMN "classId" VARCHAR(80),
 ADD COLUMN "speciesId" VARCHAR(80),
 ADD COLUMN "backgroundId" VARCHAR(80),
 ADD COLUMN "subclassId" VARCHAR(80),
 ADD COLUMN "backgroundName" VARCHAR(80) NOT NULL DEFAULT '',
 ADD COLUMN "subclassName" VARCHAR(80) NOT NULL DEFAULT '';
