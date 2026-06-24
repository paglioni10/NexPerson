// Aplica db/schema.sql e db/seed.sql no banco apontado por DATABASE_URL.
// Uso: DATABASE_URL="postgres://..." node db/migrate.mjs [--no-seed]
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const dir = dirname(fileURLToPath(import.meta.url));

// Fallback: lê DATABASE_URL do .env.local se não estiver no ambiente.
function lerEnvLocal() {
  try {
    const txt = readFileSync(join(dir, "..", ".env.local"), "utf8");
    const linha = txt.split("\n").find((l) => l.startsWith("DATABASE_URL="));
    return linha?.slice("DATABASE_URL=".length).trim();
  } catch {
    return undefined;
  }
}

const url = process.env.DATABASE_URL || lerEnvLocal();
if (!url) {
  console.error("Defina DATABASE_URL (ambiente ou .env.local) antes de rodar.");
  process.exit(1);
}

const sql = postgres(url, { max: 1, prepare: false });

async function run(arquivo) {
  const conteudo = readFileSync(join(dir, arquivo), "utf8");
  console.log(`Aplicando ${arquivo}...`);
  await sql.unsafe(conteudo);
  console.log(`OK: ${arquivo}`);
}

try {
  await run("schema.sql");
  if (!process.argv.includes("--no-seed")) await run("seed.sql");
  const [{ n }] = await sql`select count(*)::int as n from colaborador`;
  console.log(`Concluído. ${n} colaboradores no banco.`);
} catch (e) {
  console.error("Falha na migração:", e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
