import "dotenv/config";
import { defineConfig } from "prisma/config";
export default defineConfig({
  schema: "packages/database/prisma/schema.prisma",
  migrations: { path: "packages/database/prisma/migrations" },
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://ct_rpg:ct_rpg_local@localhost:5432/ct_rpg",
  },
});
