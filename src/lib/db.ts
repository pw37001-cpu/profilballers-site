import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Check if we have Turso credentials (for production/Vercel)
  const hasTurso = process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN;

  // Use Turso if credentials are available, otherwise use local SQLite
  const databaseUrl = hasTurso
    ? process.env.TURSO_DATABASE_URL!
    : process.env.DATABASE_URL || "file:./db/database.db";

  // Create adapter - authToken is only needed for Turso
  const adapter = new PrismaLibSql({
    url: databaseUrl,
    authToken: hasTurso ? process.env.TURSO_AUTH_TOKEN : undefined,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
