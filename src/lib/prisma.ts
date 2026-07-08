import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../prisma/generated/prisma";
import { getDatabaseUrl } from "./config";
import pg from "pg";

let prismaInstance: PrismaClient | null = null;

/**
 * Creates the real Prisma Client instance using the validated configuration.
 */
function createPrismaInstance(): PrismaClient {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL not configured or invalid in Secrets.");
  }

  const pool = new pg.Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({ adapter });

  return client;
}

/**
 * Proxy for PrismaClient that allows reinitialization after installation.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    if (!prismaInstance) {
      try {
        prismaInstance = createPrismaInstance();
      } catch (e) {
        throw new Error(
          `Prisma cannot be used before installation. The field '${String(prop)}' was accessed but DATABASE_URL is empty.`
        );
      }
    }
    return (prismaInstance as any)[prop];
  }
});

export function resetPrismaInstance() {
  prismaInstance = null;
}
