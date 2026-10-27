import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

function prepareDatabaseUrl() {
  if (!process.env.VERCEL) return;
  const tmpDb = "/tmp/shift.db";
  if (!existsSync(tmpDb)) {
    const candidates = [
      path.join(process.cwd(), "prisma", "prod.db"),
      path.join(process.cwd(), "prisma", "dev.db"),
    ];
    const source = candidates.find((file) => existsSync(file));
    if (source) copyFileSync(source, tmpDb);
  }
  process.env.DATABASE_URL = `file:${tmpDb}`;
}

prepareDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
