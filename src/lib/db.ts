import "server-only";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL não definido. Copie .env.local e suba o banco com `npm run db:up`.",
  );
}

// Em poolers de transação (ex.: Supabase Supavisor/pgbouncer) prepared statements
// não são suportados; detectamos pela URL e desligamos quando necessário.
const usaPooler = /pooler\.supabase\.com|pgbouncer=true|:6543/.test(connectionString);

// Reaproveita a conexão entre hot-reloads no dev (evita esgotar conexões).
const globalForDb = globalThis as unknown as { sql?: ReturnType<typeof postgres> };

export const sql =
  globalForDb.sql ??
  postgres(connectionString, {
    // Em pooler de transação, queries paralelas precisam de conexões próprias
    // (pipelining numa só conexão trava o pgbouncer). prepare desligado é obrigatório.
    max: usaPooler ? 10 : 5,
    prepare: !usaPooler,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;
