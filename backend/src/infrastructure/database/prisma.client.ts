import { PrismaClient } from "../../generated/prisma/index";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma v7: $on() event-based logging has been removed.
// Use stdout log levels via the `log` array instead.
const isDev = process.env.NODE_ENV !== "production";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  // Prisma v7 requires a driver adapter
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: isDev
      ? ["query", "info", "warn", "error"] // stdout in dev
      : ["warn", "error"], // minimal in prod
  });
}

const prisma = global.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

export { prisma };
