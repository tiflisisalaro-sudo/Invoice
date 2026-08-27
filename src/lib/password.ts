import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { prisma } from "@/lib/db";

const scryptAsync = promisify(scrypt);
export const MIN_PASSWORD_LEN = 4;

let passwordColumnReady = false;

async function ensurePasswordColumn() {
  if (passwordColumnReady) return;
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Setting" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT NOT NULL DEFAULT ''`,
    );
  } catch {
    // Pooler/permissions may reject DDL; the select below will still fail if the column is missing.
  }
  passwordColumnReady = true;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [saltHex, keyHex] = stored.split(":");
  if (!saltHex || !keyHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(keyHex, "hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

function envPassword() {
  return process.env.APP_PASSWORD?.trim() || "";
}

export async function getPasswordState() {
  if (!process.env.DATABASE_URL?.trim()) {
    const envSet = Boolean(envPassword());
    return { stored: false, envSet, configured: envSet, needsSetup: !envSet };
  }
  await ensurePasswordColumn();
  const s = await prisma.setting.findUnique({
    where: { id: "default" },
    select: { passwordHash: true },
  });
  const stored = Boolean(s?.passwordHash);
  const envSet = Boolean(envPassword());
  return {
    stored,
    envSet,
    configured: stored || envSet,
    needsSetup: !stored && !envSet,
  };
}

export async function checkPassword(password: string) {
  const expectedEnv = envPassword();
  if (!process.env.DATABASE_URL?.trim()) {
    if (!expectedEnv) return false;
    const a = Buffer.from(password);
    const b = Buffer.from(expectedEnv);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }
  await ensurePasswordColumn();
  const s = await prisma.setting.findUnique({
    where: { id: "default" },
    select: { passwordHash: true },
  });
  if (s?.passwordHash) {
    return verifyPassword(password, s.passwordHash);
  }
  const expected = envPassword();
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
