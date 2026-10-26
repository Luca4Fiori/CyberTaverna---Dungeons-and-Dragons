import { PrismaClient } from "../generated/client/client";
import { PrismaPg } from "@prisma/adapter-pg";
export function createDatabase(connectionString: string) {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}
