import "server-only";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL não definido. Copie .env.local e suba o banco com `npm run db:up`.",
  );
}

// Reaproveita a conexão entre hot-reloads no dev (evita esgotar conexões).
const globalForDb = globalThis as unknown as { sql?: ReturnType<typeof postgres> };

export const sql =
  globalForDb.sql ?? postgres(connectionString, { max: 5 });

if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;
