import "dotenv/config";
import { Client } from "pg";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
const connection = new URL(process.env.DATABASE_URL);
if (
  !["localhost", "127.0.0.1"].includes(connection.hostname) ||
  connection.pathname !== "/ct_rpg"
)
  throw new Error("Preparação automática limitada ao banco local ct_rpg.");
connection.pathname = "/postgres";
const client = new Client({ connectionString: connection.toString() });
try {
  await client.connect();
  const found = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    ["ct_rpg_test"],
  );
  if (!found.rowCount) await client.query('CREATE DATABASE "ct_rpg_test"');
} finally {
  await client.end();
}
connection.pathname = "/ct_rpg_test";
execFileSync(
  process.execPath,
  [resolve("node_modules/prisma/build/index.js"), "migrate", "deploy"],
  {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: connection.toString() },
  },
);
console.log("Banco ct_rpg_test preparado; banco principal preservado.");
