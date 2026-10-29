import "dotenv/config";
import { Client } from "pg";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
const url = new URL(process.env.DATABASE_URL);
if (
  !["localhost", "127.0.0.1"].includes(url.hostname) ||
  url.pathname !== "/ct_rpg"
)
  throw new Error("Validação limitada ao banco local ct_rpg.");
const client = new Client({ connectionString: url.toString() });
const query =
  'SELECT id, "campaignId", "ownerId", name, "className", "classId", "subclassId", "subclassName", "speciesId", species, "backgroundId", "backgroundName", level, version FROM "Character" ORDER BY id';
const digest = (rows) =>
  createHash("sha256").update(JSON.stringify(rows)).digest("hex");
try {
  await client.connect();
  const before = await client.query(query);
  execFileSync(
    process.execPath,
    [resolve("node_modules/prisma/build/index.js"), "migrate", "deploy"],
    { stdio: "inherit" },
  );
  const after = await client.query(query);
  if (digest(before.rows) !== digest(after.rows))
    throw new Error(
      "Os registros mudaram durante a validação; investigar antes de prosseguir.",
    );
  const missing = await client.query(
    'SELECT count(*)::int AS count FROM "Character" c WHERE NOT EXISTS (SELECT 1 FROM "CharacterClass" cc WHERE cc."characterId" = c.id)',
  );
  if (missing.rows[0].count !== 0)
    throw new Error("Há fichas sem distribuição de classes.");
  console.log(
    `${after.rowCount} fichas verificadas: identidade, vínculos, campos legados e versões preservados; todas possuem classes relacionais.`,
  );
} finally {
  await client.end();
}
