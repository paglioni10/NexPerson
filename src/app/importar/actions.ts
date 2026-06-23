"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { parseCsv } from "@/lib/csv";

export type ImportResult = {
  ok: boolean;
  importados: number;
  erros: { linha: number; motivo: string; conteudo: string }[];
  mensagem?: string;
};

const norm = (s: string) => s.trim().toLowerCase();

/**
 * Importa logs de execução (evento_execucao) a partir de CSV.
 * Formato esperado: colaborador, atividade, data (data opcional).
 * Casa por nome (ADR-002: CSV é fonte de execução, não de capacidade).
 */
export async function importarCsv(
  _prev: ImportResult,
  formData: FormData,
): Promise<ImportResult> {
  const file = formData.get("arquivo") as File | null;
  let texto = (formData.get("texto") ?? "").toString();
  if (file && file.size > 0) texto = await file.text();
  if (!texto.trim()) {
    return { ok: false, importados: 0, erros: [], mensagem: "Nenhum dado enviado." };
  }

  const linhas = parseCsv(texto);
  if (linhas.length === 0) {
    return { ok: false, importados: 0, erros: [], mensagem: "CSV vazio." };
  }

  // Detecta e pula o cabeçalho se a primeira linha tiver rótulos conhecidos.
  const header = linhas[0].map(norm);
  const temHeader = header.includes("colaborador") || header.includes("atividade");
  const dados = temHeader ? linhas.slice(1) : linhas;

  // Mapas nome → id (case-insensitive).
  const [colabs, ativs] = await Promise.all([
    sql<{ id: number; nome: string }[]>`select id, nome from colaborador`,
    sql<{ id: number; nome: string }[]>`select id, nome from atividade`,
  ]);
  const colabMap = new Map(colabs.map((c) => [norm(c.nome), c.id]));
  const ativMap = new Map(ativs.map((a) => [norm(a.nome), a.id]));

  const erros: ImportResult["erros"] = [];
  const eventos: { atividade_id: number; colaborador_id: number; executado_em: Date }[] = [];

  dados.forEach((cols, idx) => {
    const linha = (temHeader ? idx + 2 : idx + 1);
    const conteudo = cols.join(", ");
    const [colNome, ativNome, dataStr] = cols;
    if (!colNome || !ativNome) {
      erros.push({ linha, motivo: "Colunas insuficientes", conteudo });
      return;
    }
    const colId = colabMap.get(norm(colNome));
    const ativId = ativMap.get(norm(ativNome));
    if (colId == null) {
      erros.push({ linha, motivo: `Colaborador não encontrado: "${colNome}"`, conteudo });
      return;
    }
    if (ativId == null) {
      erros.push({ linha, motivo: `Atividade não encontrada: "${ativNome}"`, conteudo });
      return;
    }
    let data = new Date();
    if (dataStr) {
      const d = new Date(dataStr);
      if (!isNaN(d.getTime())) data = d;
    }
    eventos.push({ atividade_id: ativId, colaborador_id: colId, executado_em: data });
  });

  for (const e of eventos) {
    await sql`
      insert into evento_execucao (atividade_id, colaborador_id, executado_em, fonte)
      values (${e.atividade_id}, ${e.colaborador_id}, ${e.executado_em}, 'csv')`;
  }

  revalidatePath("/reconciliacao");
  revalidatePath("/dashboard");

  return {
    ok: true,
    importados: eventos.length,
    erros,
    mensagem: `${eventos.length} evento(s) importado(s).${erros.length ? ` ${erros.length} linha(s) ignorada(s).` : ""}`,
  };
}
