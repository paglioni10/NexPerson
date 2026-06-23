import "server-only";
import { sql } from "./db";

/**
 * Simulação de impacto DETERMINÍSTICA (sem IA): recalcula o risco como se um
 * colaborador deixasse a empresa. Compara métricas antes × depois.
 */

export type AtividadeImpacto = {
  nome: string;
  processo: string;
  criticidade: string;
  bf_antes: number;
  bf_depois: number;
  situacao: "Órfã" | "Vira crítica" | "Perde redundância";
};

export type ProcessoImpacto = {
  nome: string;
  bf_antes: number;
  bf_depois: number;
};

export type Simulacao = {
  colaborador: { id: number; nome: string };
  resumo: {
    atividades_impactadas: number;
    novas_orfas: number;
    novas_criticas: number;
    processos_comprometidos: number;
    iro_antes: number;
    iro_depois: number;
  };
  atividades: AtividadeImpacto[];
  processos: ProcessoImpacto[];
};

export async function listColaboradoresAtivos() {
  return sql<{ id: number; nome: string }[]>`
    select id, nome from colaborador where status = 'ativo' order by nome`;
}

export async function getSimulacao(colaboradorId: number): Promise<Simulacao | null> {
  const [col] = await sql<{ id: number; nome: string }[]>`
    select id, nome from colaborador where id = ${colaboradorId}`;
  if (!col) return null;

  const [cfg] = await sql<
    { nivel_minimo_capaz: number; peso_baixa: number; peso_media: number; peso_alta: number }[]
  >`select nivel_minimo_capaz, peso_baixa, peso_media, peso_alta from config_empresa where id = 1`;
  const min = Number(cfg.nivel_minimo_capaz);
  const peso = (c: string) =>
    c === "Alta" ? Number(cfg.peso_alta) : c === "Média" ? Number(cfg.peso_media) : Number(cfg.peso_baixa);

  // Bus Factor por atividade, antes e depois de remover o colaborador.
  const rows = await sql<
    {
      atividade: string;
      processo: string;
      processo_id: number;
      criticidade: string;
      bf_antes: number;
      bf_depois: number;
    }[]
  >`
    select a.nome as atividade, p.nome as processo, p.id as processo_id, a.criticidade,
           count(cz.colaborador_id)::int as bf_antes,
           count(cz.colaborador_id) filter (where cz.colaborador_id <> ${colaboradorId})::int as bf_depois
    from atividade a
    join processo p on p.id = a.processo_id
    left join (
      select c.atividade_id, c.colaborador_id
      from competencia c
      join colaborador col on col.id = c.colaborador_id
      where col.status = 'ativo' and c.nivel >= ${min}
    ) cz on cz.atividade_id = a.id
    group by a.id, p.id
    order by p.nome, a.nome`;

  // Atividades impactadas (a pessoa era capaz → bf cai).
  const atividades: AtividadeImpacto[] = rows
    .filter((r) => r.bf_depois < r.bf_antes)
    .map((r) => ({
      nome: r.atividade,
      processo: r.processo,
      criticidade: r.criticidade,
      bf_antes: r.bf_antes,
      bf_depois: r.bf_depois,
      situacao:
        r.bf_depois === 0 ? "Órfã" : r.bf_depois === 1 ? "Vira crítica" : "Perde redundância",
    }));

  // Processos: BF = mínimo entre as atividades CRÍTICAS (Alta).
  const procMap = new Map<number, ProcessoImpacto>();
  for (const r of rows) {
    if (r.criticidade !== "Alta") continue;
    const cur = procMap.get(r.processo_id) ?? {
      nome: r.processo,
      bf_antes: Infinity,
      bf_depois: Infinity,
    };
    cur.bf_antes = Math.min(cur.bf_antes, r.bf_antes);
    cur.bf_depois = Math.min(cur.bf_depois, r.bf_depois);
    procMap.set(r.processo_id, cur);
  }
  const processos = [...procMap.values()].filter((p) => p.bf_depois < p.bf_antes);

  // IRO ponderado antes × depois.
  const totalPeso = rows.reduce((s, r) => s + peso(r.criticidade), 0);
  const pesoAntes = rows.filter((r) => r.bf_antes >= 2).reduce((s, r) => s + peso(r.criticidade), 0);
  const pesoDepois = rows.filter((r) => r.bf_depois >= 2).reduce((s, r) => s + peso(r.criticidade), 0);
  const pct = (n: number) => (totalPeso ? Math.round((n / totalPeso) * 1000) / 10 : 0);

  return {
    colaborador: col,
    resumo: {
      atividades_impactadas: atividades.length,
      novas_orfas: atividades.filter((a) => a.situacao === "Órfã").length,
      novas_criticas: atividades.filter((a) => a.situacao === "Vira crítica").length,
      processos_comprometidos: processos.length,
      iro_antes: pct(pesoAntes),
      iro_depois: pct(pesoDepois),
    },
    atividades,
    processos,
  };
}
