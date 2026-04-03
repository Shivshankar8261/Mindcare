import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "node:path";

declare global {
  // eslint-disable-next-line no-var
  var __mindcare_prisma__: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __mindcare_prisma_url__: string | undefined;
}

function resolveDatabaseUrl() {
  const databaseUrlRaw = process.env.DATABASE_URL ?? "";
  const trimmed = databaseUrlRaw.trim();

  if (trimmed.length > 0) {
    // Our current Prisma schema is SQLite-based.
    // Ignore Postgres connection strings coming from placeholder `.env`.
    if (trimmed.startsWith("postgresql://") || trimmed.startsWith("postgres://")) {
      // Fall back to local sqlite.
    } else if (trimmed.startsWith("file:")) {
      return trimmed.slice("file:".length);
    } else {
      // Assume it's a valid filesystem path for sqlite.
      return trimmed;
    }
  }

  // Local dev fallback: SQLite file in the workspace.
  // (This makes the prototype fully functional without needing Supabase credentials.)
  const dbFile = path.join(process.cwd(), "dev.db");
  return dbFile;
}

const databaseUrl = resolveDatabaseUrl();

const needsNewClient =
  !globalThis.__mindcare_prisma__ ||
  globalThis.__mindcare_prisma_url__ !== databaseUrl;

const prismaClient = needsNewClient
  ? new PrismaClient({
      adapter: new PrismaBetterSqlite3({ url: databaseUrl }),
    })
  : globalThis.__mindcare_prisma__;

if (!prismaClient) {
  // Should never happen, but keeps TypeScript happy in build mode.
  throw new Error("Prisma client initialization failed");
}

export const prisma = prismaClient;

if (process.env.NODE_ENV !== "production") {
  globalThis.__mindcare_prisma__ = prisma;
  globalThis.__mindcare_prisma_url__ = databaseUrl;
}

