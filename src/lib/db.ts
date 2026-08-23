import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function databaseUrl() {
  const url = process.env["DATABASE_URL"];
  if (!url) {
    throw new Error(
      "DATABASE_URL is missing. Add it in Vercel → Settings → Environment Variables, then Redeploy.",
    );
  }
  return url;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
    datasources: { db: { url: databaseUrl() } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;