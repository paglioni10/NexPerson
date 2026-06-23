import "server-only";
import { sql } from "./db";

/** Dados do mapa: processo → atividade → colaborador, com Bus Factor. */

export type GrafoProcesso = { id: number; nome: string; bus_factor: number | null };
export type GrafoAtividade = {
  id: number;
  processo_id: number;
  nome: string;
  criticidade: string;
  bus_factor: number;
};
export type GrafoLink = {
  atividade_id: number;
  colaborador_id: number;
  nome: string;
  nivel: number;
  capaz: boolean;
};

export type Grafo = {
  processos: GrafoProcesso[];
  atividades: GrafoAtividade[];
  links: GrafoLink[];
};

export async function getGrafo(): Promise<Grafo> {
  const nivelMin = await sql<{ n: number }[]>`
    select nivel_minimo_capaz as n from config_empresa where id = 1`;
  const min = Number(nivelMin[0]?.n ?? 2);

  const [processos, atividades, links] = await Promise.all([
    sql<GrafoProcesso[]>`
      select p.id, p.nome,
             (select min(b.bus_factor) from vw_bus_factor_processo b where b.processo_id = p.id) as bus_factor
      from processo p order by p.id`,
    sql<GrafoAtividade[]>`
      select atividade_id as id, processo_id, nome, criticidade, bus_factor
      from vw_bus_factor_atividade order by processo_id, atividade_id`,
    sql<GrafoLink[]>`
      select c.atividade_id, c.colaborador_id, col.nome, c.nivel,
             (col.status = 'ativo' and c.nivel >= ${min}) as capaz
      from competencia c
      join colaborador col on col.id = c.colaborador_id
      order by c.atividade_id`,
  ]);

  return {
    processos: processos.map((p) => ({
      ...p,
      bus_factor: p.bus_factor == null ? null : Number(p.bus_factor),
    })),
    atividades: atividades.map((a) => ({ ...a, bus_factor: Number(a.bus_factor) })),
    links: links.map((l) => ({ ...l, nivel: Number(l.nivel), capaz: Boolean(l.capaz) })),
  };
}
