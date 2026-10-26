import "dotenv/config";
import { createDatabase } from "../packages/database/src/index";
export function testDatabaseUrl() {
  const url = new URL(
    process.env.TEST_DATABASE_URL ??
      "postgresql://ct_rpg:ct_rpg_local@localhost:5433/ct_rpg_test",
  );
  if (
    !["localhost", "127.0.0.1"].includes(url.hostname) ||
    url.pathname !== "/ct_rpg_test"
  )
    throw new Error("Testes permitidos apenas no banco local ct_rpg_test.");
  return url.toString();
}
export const testDatabase = () => createDatabase(testDatabaseUrl());
