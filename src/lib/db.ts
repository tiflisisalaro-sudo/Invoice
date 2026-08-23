import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function databaseUrl() {
  let url = process.env["DATABASE_URL"]?.trim() || "";
  if (url.toUpperCase().startsWith("DATABASE_URL=")) {
    url = url.slice("DATABASE_URL=".length).trim();
  }
  if (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    url = url.slice(1, -1);
  }
  return url;
}

function createPrisma() {
  const url = databaseUrl();
  if (!url) {
    return new PrismaClient({ log: ["error"] });
  }
  return new PrismaClient({
    log: ["error"],
    datasources: { db: { url } },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;