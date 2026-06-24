-- =====================================================================
-- NexPerson, Schema PostgreSQL (DDL) + Views das Métricas
-- Materializa o ADR-005 (modelo de dados) e o ADR-001 (métricas auditáveis).
--
-- Princípio: as métricas (Bus Factor, ICO, IRO) são VIEWS SQL, qualquer
-- pessoa lê a consulta e confere de onde vem cada número. Sem "score mágico".
--
-- Escopo MVP: empresa única (sem empresa_id / multi-tenant, ver ADR-005 SaaS).
-- =====================================================================

-- Limpeza idempotente (facilita rodar de novo durante o desenvolvimento)
drop view  if exists vw_dashboard               cascade;
drop view  if exists vw_reconc_backup_inativo   cascade;
drop view  if exists vw_reconc_executor_nao_cadastrado cascade;
drop view  if exists vw_falso_backup            cascade;
drop view  if exists vw_iro                      cascade;
drop view  if exists vw_ico                      cascade;
drop view  if exists vw_bus_factor_processo      cascade;
drop view  if exists vw_bus_factor_atividade     cascade;
drop view  if exists vw_executor_capaz           cascade;
drop function if exists fn_peso(text)            cascade;
drop table if exists evento_execucao             cascade;
drop table if exists atribuicao                  cascade;
drop table if exists competencia                 cascade;
drop table if exists atividade                   cascade;
drop table if exists processo                    cascade;
drop table if exists colaborador                 cascade;
drop table if exists config_empresa              cascade;

-- =====================================================================
-- 1. PARÂMETROS (ADR-001): tudo que governa as métricas mora aqui.
-- =====================================================================
create table config_empresa (
    id                  int primary key default 1,
    nivel_minimo_capaz  int  not null default 2,   -- 2 = Intermediário
    peso_baixa          int  not null default 1,
    peso_media          int  not null default 3,
    peso_alta           int  not null default 5,
    ico_alerta          numeric not null default 25,
    constraint singleton check (id = 1)             -- garante linha única no MVP
);

-- =====================================================================
-- 2. CADASTRO ORGANIZACIONAL
-- =====================================================================
create table colaborador (
    id            serial primary key,
    nome          text not null,
    cargo         text,
    area          text,
    departamento  text,
    senioridade   text,
    tempo_empresa text,
    status        text not null default 'ativo'
                  check (status in ('ativo','inativo'))
);

create table processo (
    id          serial primary key,
    nome        text not null,
    descricao   text,
    area        text,
    criticidade text not null check (criticidade in ('Baixa','Média','Alta'))
);

create table atividade (
    id           serial primary key,
    processo_id  int not null references processo(id) on delete cascade,
    nome         text not null,
    descricao    text,
    criticidade  text not null check (criticidade in ('Baixa','Média','Alta')),
    tempo_medio  text,
    frequencia   text
);

-- =====================================================================
-- 3. VÍNCULO PESSOA↔ATIVIDADE, SEPARADO em duas tabelas (ADR-005)
--    capacidade (competencia)  ≠  designação (atribuicao)
-- =====================================================================

-- CAPACIDADE: o que a pessoa é capaz de fazer. TODAS as métricas leem daqui.
create table competencia (
    colaborador_id int not null references colaborador(id) on delete cascade,
    atividade_id   int not null references atividade(id)   on delete cascade,
    nivel          int not null check (nivel between 1 and 4), -- 1..4 (Inic..Esp)
    primary key (colaborador_id, atividade_id)
);

-- DESIGNAÇÃO: o papel que a empresa atribuiu (independe da capacidade real).
create table atribuicao (
    colaborador_id int not null references colaborador(id) on delete cascade,
    atividade_id   int not null references atividade(id)   on delete cascade,
    papel          text not null check (papel in ('principal','secundario','backup')),
    primary key (colaborador_id, atividade_id, papel)
);

-- FATO BRUTO de execução (ADR-002): append-only, vem de import CSV. Imutável.
-- Separado de competencia DE PROPÓSITO: execução ≠ capacidade.
create table evento_execucao (
    id             bigserial primary key,
    atividade_id   int not null references atividade(id)   on delete cascade,
    colaborador_id int not null references colaborador(id) on delete cascade,
    executado_em   timestamptz not null,
    fonte          text not null default 'csv'
);

-- =====================================================================
-- 4. HELPER: peso da criticidade (lê os parâmetros de config_empresa)
-- =====================================================================
create function fn_peso(crit text) returns int as $$
    select case crit
        when 'Alta'  then (select peso_alta  from config_empresa where id = 1)
        when 'Média' then (select peso_media from config_empresa where id = 1)
        when 'Baixa' then (select peso_baixa from config_empresa where id = 1)
        else 0
    end;
$$ language sql stable;

-- =====================================================================
-- 5. MÉTRICAS (VIEWS), o coração auditável do NexPerson
-- =====================================================================

-- 5.1 Quem é "Executor Capaz" (ADR-001 §0): ativo E nível >= threshold.
create view vw_executor_capaz as
select c.atividade_id, c.colaborador_id, c.nivel
from   competencia c
join   colaborador col on col.id = c.colaborador_id
where  col.status = 'ativo'
  and  c.nivel >= (select nivel_minimo_capaz from config_empresa where id = 1);

-- 5.2 Bus Factor por atividade = nº de executores capazes (0 = órfã).
create view vw_bus_factor_atividade as
select a.id          as atividade_id,
       a.processo_id,
       a.nome,
       a.criticidade,
       count(ec.colaborador_id) as bus_factor,
       case
           when count(ec.colaborador_id) = 0 then 'Órfã'
           when count(ec.colaborador_id) = 1 then 'Risco crítico'
           when count(ec.colaborador_id) = 2 then 'Risco moderado'
           else 'Resiliente'
       end as categoria
from   atividade a
left join vw_executor_capaz ec on ec.atividade_id = a.id
group by a.id;

-- 5.3 Bus Factor por processo = MÍNIMO entre as atividades CRÍTICAS (Alta).
--     (o elo mais fraco derruba a cadeia, média mascararia o risco)
create view vw_bus_factor_processo as
select p.id   as processo_id,
       p.nome,
       p.criticidade,
       min(bfa.bus_factor) as bus_factor
from   processo p
join   atividade a    on a.processo_id = p.id and a.criticidade = 'Alta'
join   vw_bus_factor_atividade bfa on bfa.atividade_id = a.id
group by p.id;

-- 5.4 ICO por pessoa (ADR-001 §2).
--     numerador: soma sobre atividades que executa de forma capaz, com
--                peso × fator_exclusividade (1/BF)
--     denominador: soma do peso de TODAS as atividades críticas (Alta) da empresa
create view vw_ico as
with contrib as (
    select ec.colaborador_id,
           fn_peso(bfa.criticidade) * (1.0 / bfa.bus_factor) as contribuicao
    from   vw_executor_capaz ec
    join   vw_bus_factor_atividade bfa on bfa.atividade_id = ec.atividade_id
    where  bfa.bus_factor > 0
),
total as (
    select nullif(sum(fn_peso(criticidade)), 0) as total_peso
    from   atividade
    where  criticidade = 'Alta'
)
select col.id   as colaborador_id,
       col.nome,
       round(coalesce(sum(contrib.contribuicao), 0)
             / (select total_peso from total) * 100, 1) as ico,
       (select ico_alerta from config_empresa where id = 1) as ico_alerta
from   colaborador col
left join contrib on contrib.colaborador_id = col.id
where  col.status = 'ativo'
group by col.id;

-- 5.5 IRO global (ADR-001 §3): simples + ponderado por criticidade.
create view vw_iro as
select
    round( (select count(*) from vw_bus_factor_atividade where bus_factor >= 2)::numeric
           / nullif((select count(*) from atividade), 0) * 100, 1) as iro_simples,
    round( (select coalesce(sum(fn_peso(criticidade)), 0)
              from vw_bus_factor_atividade where bus_factor >= 2)::numeric
           / nullif((select sum(fn_peso(criticidade)) from atividade), 0) * 100, 1)
        as iro_ponderado;

-- 5.6 FALSO BACKUP: designado como backup mas SEM capacidade real.
--     (papel ≠ capacidade, um dos insights centrais do produto)
create view vw_falso_backup as
select atr.colaborador_id,
       col.nome as colaborador,
       atr.atividade_id,
       a.nome   as atividade
from   atribuicao atr
join   colaborador col on col.id = atr.colaborador_id
join   atividade   a   on a.id   = atr.atividade_id
where  atr.papel = 'backup'
  and  not exists (
        select 1 from vw_executor_capaz ec
        where ec.colaborador_id = atr.colaborador_id
          and ec.atividade_id   = atr.atividade_id
  );

-- =====================================================================
-- 6. RECONCILIAÇÃO declarado-vs-real (ADR-002), cruza eventos × cadastro
-- =====================================================================

-- 6.1 Quem EXECUTOU (nos logs) mas NÃO está cadastrado como competente.
--     → sugestão de vínculo faltante / cadastro desatualizado.
create view vw_reconc_executor_nao_cadastrado as
select distinct
       e.colaborador_id,
       col.nome as colaborador,
       e.atividade_id,
       a.nome   as atividade,
       count(*) over (partition by e.colaborador_id, e.atividade_id) as execucoes
from   evento_execucao e
join   colaborador col on col.id = e.colaborador_id
join   atividade   a   on a.id   = e.atividade_id
where  not exists (
        select 1 from competencia c
        where c.colaborador_id = e.colaborador_id
          and c.atividade_id   = e.atividade_id
  );

-- 6.2 Backup que NUNCA executou de fato (suspeita de backup só no papel).
create view vw_reconc_backup_inativo as
select atr.colaborador_id,
       col.nome as colaborador,
       atr.atividade_id,
       a.nome   as atividade
from   atribuicao atr
join   colaborador col on col.id = atr.colaborador_id
join   atividade   a   on a.id   = atr.atividade_id
where  atr.papel = 'backup'
  and  not exists (
        select 1 from evento_execucao e
        where e.colaborador_id = atr.colaborador_id
          and e.atividade_id   = atr.atividade_id
  );

-- =====================================================================
-- 7. DASHBOARD EXECUTIVO, contagens acionáveis (ADR-001 §4)
-- =====================================================================
create view vw_dashboard as
select
    (select count(*) from vw_bus_factor_atividade where bus_factor = 0)        as atividades_orfas,
    (select count(*) from vw_bus_factor_processo  where bus_factor = 1)        as processos_bf1,
    (select count(*) from vw_bus_factor_atividade
        where bus_factor = 1 and criticidade = 'Alta')                         as criticas_sem_redundancia,
    (select count(*) from vw_ico
        where ico > (select ico_alerta from config_empresa where id = 1))      as pessoas_acima_ico,
    (select count(*) from vw_falso_backup)                                     as falsos_backups,
    (select iro_ponderado from vw_iro)                                         as iro_ponderado,
    (select count(*) from processo)                                           as total_processos,
    (select count(*) from atividade)                                          as total_atividades,
    (select count(*) from colaborador where status = 'ativo')                 as total_colaboradores;
