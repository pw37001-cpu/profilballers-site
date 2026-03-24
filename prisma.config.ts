import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasourceUrl: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "file:./db/database.db",
});
