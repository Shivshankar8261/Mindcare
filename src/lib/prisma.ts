import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { execSync } from "node:child_process";

declare global {
  // eslint-disable-next-line no-var
  var __mindcare_prisma__: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __mindcare_prisma_url__: string | undefined;
  // eslint-disable-next-line no-var
  var __mindcare_prisma_sqlite_migrated__: boolean | undefined;
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

  // Serverless fallback:
  // - Vercel / Netlify serverless runs with a read-only bundle filesystem
  // - so file-based sqlite must live under /tmp to be writable
  // - if DATABASE_URL isn't set, we bootstrap sqlite + migrations automatically.
  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.NETLIFY) ||
    process.env.NODE_ENV === "production";

  const dbFile = isServerless ? "/tmp/mindcare-dev.db" : path.join(process.cwd(), "dev.db");
  return dbFile;
}

const databaseUrl = resolveDatabaseUrl();

// Ensure prisma has a sqlite URL in env when we are using the sqlite fallback.
// Prisma CLI + migrate deploy use this value.
if ((!process.env.DATABASE_URL || process.env.DATABASE_URL.trim().length === 0) && databaseUrl) {
  process.env.DATABASE_URL = `file:${databaseUrl}`;
}

function ensureSqliteMigratedOnce() {
  const shouldMigrate =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.NETLIFY) ||
    !process.env.DATABASE_URL ||
    process.env.DATABASE_URL.trim().length === 0;

  if (!shouldMigrate) return;
  if (globalThis.__mindcare_prisma_sqlite_migrated__) return;

  try {
    // Only attempt migrate when sqlite is file-based (fallback mode).
    // For serverless we copy DB into /tmp implicitly by choosing that path above.
    if (!fs.existsSync(databaseUrl)) {
      // /tmp exists on most hosts, but keep this defensive.
      fs.mkdirSync(path.dirname(databaseUrl), { recursive: true });
    }

    execSync("npx prisma migrate deploy", {
      stdio: "ignore",
      env: { ...process.env, DATABASE_URL: `file:${databaseUrl}` },
    });
  } catch {
    // If migrations fail, Prisma will surface the real DB error on the first query.
  } finally {
    globalThis.__mindcare_prisma_sqlite_migrated__ = true;
  }
}

ensureSqliteMigratedOnce();

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

