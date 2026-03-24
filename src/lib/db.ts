import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  // Check if we're in build mode or if credentials are missing
  if (!tursoUrl || !tursoToken) {
    // Return a dummy client for build time
    // This will be replaced at runtime with the real client
    console.warn("Warning: TURSO_DATABASE_URL or TURSO_AUTH_TOKEN not set. Using placeholder.");
  }

  const adapter = new PrismaLibSql({
    url: tursoUrl || "libsql://placeholder.turso.io",
    authToken: tursoToken || "placeholder",
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
