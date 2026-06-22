import "server-only";
import { sql } from "./db";

/**
 * Consultas às VIEWS de métricas (ver db/schema.sql).
 * Toda a inteligência mora no banco (auditável); aqui só tipamos e lemos.
 */

export type Dashboard = {
  atividades_orfas: number;
  processos_bf1: number;
  criticas_sem_redundancia: number;
  pessoas_acima_ico: number;
  falsos_backups: number;
  iro_ponderado: number;
  total_processos: number;
  total_atividades: number;
  total_colaboradores: number;
};

export type ProcessoRisco = {
  processo_id: number;
  nome: string;
  criticidade: string;
  bus_factor: number;
};

export type Concentracao = {
  colaborador_id: number;
  nome: string;
  ico: number;
  ico_alerta: number;
};

export type FalsoBackup = {
  colaborador: string;
  atividade: string;
};

export type Reconciliacao = {
  colaborador: string;
  atividade: string;
  execucoes: number;
};

const num = (v: unknown) => (v == null ? 0 : Number(v));

export async function getDashboard(): Promise<Dashboard> {
  const [row] = await sql<Dashboard[]>`select * from vw_dashboard`;
  // Postgres devolve numéricos como string; normalizamos.
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k, num(v)]),
  ) as Dashboard;
}

export async function getProcessosRisco(): Promise<ProcessoRisco[]> {
  const rows = await sql<ProcessoRisco[]>`
    select processo_id, nome, criticidade, bus_factor
    from vw_bus_factor_processo
    order by bus_factor asc, nome asc
  `;
  return rows.map((r) => ({ ...r, bus_factor: num(r.bus_factor) }));
}

export async function getConcentracao(): Promise<Concentracao[]> {
  const rows = await sql<Concentracao[]>`
    select colaborador_id, nome, ico, ico_alerta
    from vw_ico
    order by ico desc
  `;
  return rows.map((r) => ({
    ...r,
    ico: num(r.ico),
    ico_alerta: num(r.ico_alerta),
  }));
}

export async function getFalsosBackups(): Promise<FalsoBackup[]> {
  return sql<FalsoBackup[]>`
    select colaborador, atividade from vw_falso_backup order by colaborador
  `;
}

export type AtividadeBF = {
  atividade_id: number;
  nome: string;
  criticidade: string;
  bus_factor: number;
  categoria: string;
};

export async function getAtividadesBF(processoId: number): Promise<AtividadeBF[]> {
  const rows = await sql<AtividadeBF[]>`
    select atividade_id, nome, criticidade, bus_factor, categoria
    from vw_bus_factor_atividade
    where processo_id = ${processoId}
    order by bus_factor asc, nome asc
  `;
  return rows.map((r) => ({ ...r, bus_factor: num(r.bus_factor) }));
}

export async function getReconciliacao(): Promise<Reconciliacao[]> {
  const rows = await sql<Reconciliacao[]>`
    select colaborador, atividade, execucoes
    from vw_reconc_executor_nao_cadastrado
    order by execucoes desc
  `;
  return rows.map((r) => ({ ...r, execucoes: num(r.execucoes) }));
}
