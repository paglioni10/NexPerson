import "server-only";
import { sql } from "./db";

/** Acesso a dados do cadastro organizacional (ADR-005). */

export type Colaborador = {
  id: number;
  nome: string;
  cargo: string | null;
  area: string | null;
  departamento: string | null;
  senioridade: string | null;
  tempo_empresa: string | null;
  status: string;
};

export type Processo = {
  id: number;
  nome: string;
  descricao: string | null;
  area: string | null;
  criticidade: string;
};

export type Atividade = {
  id: number;
  processo_id: number;
  nome: string;
  descricao: string | null;
  criticidade: string;
  tempo_medio: string | null;
  frequencia: string | null;
};

// -------------------------------------------------------------------- Config
export async function getNivelMinimoCapaz(): Promise<number> {
  const [row] = await sql<{ nivel_minimo_capaz: number }[]>`
    select nivel_minimo_capaz from config_empresa where id = 1`;
  return Number(row?.nivel_minimo_capaz ?? 2);
}

// ---------------------------------------------------------------- Colaboradores
export async function listColaboradores(): Promise<Colaborador[]> {
  return sql<Colaborador[]>`select * from colaborador order by nome`;
}

export async function getColaborador(id: number): Promise<Colaborador | undefined> {
  const [c] = await sql<Colaborador[]>`select * from colaborador where id = ${id}`;
  return c;
}

export async function upsertColaborador(data: Omit<Colaborador, "id"> & { id?: number }) {
  if (data.id) {
    await sql`
      update colaborador set
        nome = ${data.nome}, cargo = ${data.cargo}, area = ${data.area},
        departamento = ${data.departamento}, senioridade = ${data.senioridade},
        tempo_empresa = ${data.tempo_empresa}, status = ${data.status}
      where id = ${data.id}`;
  } else {
    await sql`
      insert into colaborador (nome, cargo, area, departamento, senioridade, tempo_empresa, status)
      values (${data.nome}, ${data.cargo}, ${data.area}, ${data.departamento},
              ${data.senioridade}, ${data.tempo_empresa}, ${data.status})`;
  }
}

export async function deleteColaborador(id: number) {
  await sql`delete from colaborador where id = ${id}`;
}

// -------------------------------------------------------------------- Processos
export async function listProcessos(): Promise<(Processo & { atividades: number })[]> {
  return sql<(Processo & { atividades: number })[]>`
    select p.*, count(a.id)::int as atividades
    from processo p left join atividade a on a.processo_id = p.id
    group by p.id order by p.nome`;
}

export async function getProcesso(id: number): Promise<Processo | undefined> {
  const [p] = await sql<Processo[]>`select * from processo where id = ${id}`;
  return p;
}

export async function upsertProcesso(data: Omit<Processo, "id"> & { id?: number }) {
  if (data.id) {
    await sql`
      update processo set nome = ${data.nome}, descricao = ${data.descricao},
        area = ${data.area}, criticidade = ${data.criticidade}
      where id = ${data.id}`;
  } else {
    await sql`
      insert into processo (nome, descricao, area, criticidade)
      values (${data.nome}, ${data.descricao}, ${data.area}, ${data.criticidade})`;
  }
}

export async function deleteProcesso(id: number) {
  await sql`delete from processo where id = ${id}`;
}

// ------------------------------------------------------------------- Atividades
export async function listAtividades(processoId: number): Promise<Atividade[]> {
  return sql<Atividade[]>`
    select * from atividade where processo_id = ${processoId} order by id`;
}

export async function getAtividade(id: number): Promise<Atividade | undefined> {
  const [a] = await sql<Atividade[]>`select * from atividade where id = ${id}`;
  return a;
}

export async function upsertAtividade(data: Omit<Atividade, "id"> & { id?: number }) {
  if (data.id) {
    await sql`
      update atividade set nome = ${data.nome}, descricao = ${data.descricao},
        criticidade = ${data.criticidade}, tempo_medio = ${data.tempo_medio},
        frequencia = ${data.frequencia}
      where id = ${data.id}`;
  } else {
    await sql`
      insert into atividade (processo_id, nome, descricao, criticidade, tempo_medio, frequencia)
      values (${data.processo_id}, ${data.nome}, ${data.descricao},
              ${data.criticidade}, ${data.tempo_medio}, ${data.frequencia})`;
  }
}

export async function deleteAtividade(id: number) {
  await sql`delete from atividade where id = ${id}`;
}

// --------------------------------------------------------- Vínculos por atividade
export type VinculoRow = {
  colaborador_id: number;
  nome: string;
  status: string;
  nivel: number | null; // competência (capacidade)
  papel: string | null; // atribuição (designação)
};

/**
 * Para uma atividade, lista TODOS os colaboradores com seu nível (competência) e
 * papel (atribuição) — capacidade e designação separadas (ADR-005).
 */
export async function getVinculos(atividadeId: number): Promise<VinculoRow[]> {
  return sql<VinculoRow[]>`
    select col.id as colaborador_id, col.nome, col.status,
           c.nivel, a.papel
    from colaborador col
    left join competencia c on c.colaborador_id = col.id and c.atividade_id = ${atividadeId}
    left join atribuicao  a on a.colaborador_id = col.id and a.atividade_id = ${atividadeId}
    order by col.nome`;
}

/** Define (ou remove) o nível de competência de uma pessoa numa atividade. */
export async function setCompetencia(atividadeId: number, colaboradorId: number, nivel: number | null) {
  if (nivel == null) {
    await sql`delete from competencia where atividade_id = ${atividadeId} and colaborador_id = ${colaboradorId}`;
  } else {
    await sql`
      insert into competencia (colaborador_id, atividade_id, nivel)
      values (${colaboradorId}, ${atividadeId}, ${nivel})
      on conflict (colaborador_id, atividade_id) do update set nivel = ${nivel}`;
  }
}

/** Define (ou remove) o papel atribuído de uma pessoa numa atividade. */
export async function setAtribuicao(atividadeId: number, colaboradorId: number, papel: string | null) {
  await sql`delete from atribuicao where atividade_id = ${atividadeId} and colaborador_id = ${colaboradorId}`;
  if (papel) {
    await sql`
      insert into atribuicao (colaborador_id, atividade_id, papel)
      values (${colaboradorId}, ${atividadeId}, ${papel})`;
  }
}
