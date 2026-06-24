-- =====================================================================
-- NexPerson, Seed de demonstração: empresa fictícia "Acme"
-- Gargalos PLANTADOS de propósito para a demo evidenciar cada métrica:
--   • Folha de Pagamento com Bus Factor = 1 (exemplo canônico da spec)
--   • Atividade ÓRFÃ (BF=0): "Escalonamento de chamados"
--   • FALSO BACKUP: Fernanda é backup de "Gestão de benefícios" mas é Iniciante
--   • BACKUP INATIVO: Lucas (inativo) era o único backup de "Contas a pagar"
--   • RECONCILIAÇÃO: Beatriz executa "Contas a pagar" nos logs mas não está
--     cadastrada como competente → sugestão de backup real para uma atividade crítica
--   • Maria = ponto de concentração (ICO alto)
--   • Atendimento ao cliente resiliente (BF=3) como contraste saudável
--
-- Rodar APÓS schema.sql.
-- =====================================================================

-- Parâmetros (defaults do ADR-001)
insert into config_empresa (id) values (1);

-- ---------------------------------------------------------------------
-- Colaboradores  (níveis usados nas competências: 1 Inic, 2 Int, 3 Av, 4 Esp)
-- ---------------------------------------------------------------------
insert into colaborador (id, nome, cargo, area, departamento, senioridade, tempo_empresa, status) values
 (1, 'Maria Silva',     'Analista Financeiro Sênior', 'Financeiro',  'Administrativo', 'Sênior', '8 anos', 'ativo'),
 (2, 'Carlos Souza',    'Analista Financeiro',        'Financeiro',  'Administrativo', 'Pleno',  '4 anos', 'ativo'),
 (3, 'João Pereira',    'Analista de Compras',        'Compras',     'Suprimentos',    'Pleno',  '5 anos', 'ativo'),
 (4, 'Ana Lima',        'Analista de RH',             'RH',          'Pessoas',        'Pleno',  '6 anos', 'ativo'),
 (5, 'Pedro Costa',     'Atendente',                  'Atendimento', 'Operações',      'Júnior', '2 anos', 'ativo'),
 (6, 'Beatriz Rocha',   'Coordenadora de Operações',  'Compras',     'Suprimentos',    'Sênior', '7 anos', 'ativo'),
 (7, 'Lucas Almeida',   'Ex-Analista Financeiro',     'Financeiro',  'Administrativo', 'Pleno',  '-',      'inativo'),
 (8, 'Fernanda Dias',   'Assistente de RH',           'RH',          'Pessoas',        'Júnior', '1 ano',  'ativo');

-- ---------------------------------------------------------------------
-- Processos
-- ---------------------------------------------------------------------
insert into processo (id, nome, descricao, area, criticidade) values
 (1, 'Financeiro',          'Gestão financeira e contábil',        'Financeiro',  'Alta'),
 (2, 'Compras',             'Aquisição de bens e serviços',        'Compras',     'Média'),
 (3, 'RH',                  'Gestão de pessoas',                   'RH',          'Baixa'),
 (4, 'Folha de Pagamento',  'Processamento da folha mensal',       'Financeiro',  'Alta'),
 (5, 'Atendimento',         'Atendimento e suporte ao cliente',    'Atendimento', 'Média');

-- ---------------------------------------------------------------------
-- Atividades
-- ---------------------------------------------------------------------
insert into atividade (id, processo_id, nome, criticidade, frequencia) values
 -- Financeiro
 (1, 1, 'Conciliação bancária',            'Alta',  'Diária'),
 (2, 1, 'Contas a pagar',                  'Alta',  'Diária'),
 (3, 1, 'Emissão de relatórios financeiros','Média','Mensal'),
 -- Folha de Pagamento (exemplo canônico)
 (4, 4, 'Conferir notas fiscais',          'Alta',  'Mensal'),
 (5, 4, 'Aprovar pagamentos',              'Alta',  'Mensal'),
 (6, 4, 'Pagamento bancário',              'Alta',  'Mensal'),
 (7, 4, 'Fechar competência',              'Alta',  'Mensal'),
 -- Compras
 (8, 2, 'Cotação de fornecedores',         'Média', 'Semanal'),
 (9, 2, 'Aprovar compras',                 'Média', 'Semanal'),
 (10,2, 'Receber mercadoria',              'Baixa', 'Diária'),
 -- RH
 (11,3, 'Admissão de funcionário',         'Baixa', 'Eventual'),
 (12,3, 'Gestão de benefícios',            'Média', 'Mensal'),
 -- Atendimento
 (13,5, 'Atendimento ao cliente',          'Média', 'Diária'),
 (14,5, 'Escalonamento de chamados',       'Alta',  'Diária');

-- ---------------------------------------------------------------------
-- COMPETÊNCIA (capacidade real) , nivel: 1..4
-- ---------------------------------------------------------------------
insert into competencia (colaborador_id, atividade_id, nivel) values
 -- Financeiro
 (1, 1, 4), (2, 1, 3),               -- Conciliação: Maria(Esp)+Carlos(Av) → BF=2 saudável
 (1, 2, 4),                          -- Contas a pagar: só Maria capaz (Lucas inativo) → BF=1 CRÍTICO
 (7, 2, 3),                          -- Lucas era capaz, mas está INATIVO → não conta
 (1, 3, 4), (2, 3, 2),               -- Relatórios: Maria+Carlos → BF=2
 -- Folha de Pagamento (BF do processo = mín(1,2,1,1) = 1)
 (1, 4, 4),                          -- Conferir NF: só Maria → BF=1
 (1, 5, 4), (2, 5, 3),               -- Aprovar pag.: Maria+Carlos → BF=2
 (2, 6, 3),                          -- Pagamento bancário: só Carlos → BF=1
 (1, 7, 4),                          -- Fechar competência: só Maria → BF=1
 -- Compras
 (3, 8, 3), (6, 8, 2),               -- Cotação: João+Beatriz → BF=2
 (3, 9, 3),                          -- Aprovar compras: só João → BF=1 (Média)
 (6, 10, 2), (8, 10, 2),             -- Receber mercadoria: Beatriz+Fernanda → BF=2
 -- RH
 (4, 11, 3),                         -- Admissão: só Ana → BF=1 (Baixa)
 (4, 12, 3), (8, 12, 1),             -- Benefícios: Ana(Av) + Fernanda(Iniciante=NÃO capaz) → BF=1
 -- Atendimento
 (5, 13, 3), (6, 13, 3), (8, 13, 2), -- Atendimento: 3 capazes → BF=3 RESILIENTE
 (5, 14, 1);                         -- Escalonamento: Pedro Iniciante (NÃO capaz) → BF=0 ÓRFÃ

-- ---------------------------------------------------------------------
-- ATRIBUIÇÃO (papel designado), independe da capacidade
-- ---------------------------------------------------------------------
insert into atribuicao (colaborador_id, atividade_id, papel) values
 -- Financeiro
 (1, 1, 'principal'), (2, 1, 'backup'),
 (1, 2, 'principal'), (7, 2, 'backup'),       -- backup = Lucas (INATIVO) → alerta
 (1, 3, 'principal'), (2, 3, 'backup'),
 -- Folha
 (1, 4, 'principal'),
 (1, 5, 'principal'), (2, 5, 'backup'),
 (2, 6, 'principal'),
 (1, 7, 'principal'),
 -- Compras
 (3, 8, 'principal'), (6, 8, 'backup'),
 (3, 9, 'principal'),
 (6, 10,'principal'), (8, 10,'secundario'),
 -- RH
 (4, 11,'principal'),
 (4, 12,'principal'), (8, 12,'backup'),        -- FALSO BACKUP: Fernanda é Iniciante
 -- Atendimento
 (5, 13,'principal'), (6, 13,'secundario'), (8, 13,'secundario'),
 (5, 14,'principal');                          -- principal sem capacidade → órfã

-- ---------------------------------------------------------------------
-- EVENTOS DE EXECUÇÃO (logs importados via CSV), para reconciliação
-- ---------------------------------------------------------------------
insert into evento_execucao (atividade_id, colaborador_id, executado_em, fonte) values
 -- Execuções coerentes com o cadastro
 (1, 1, now() - interval '2 days',  'csv'),
 (1, 2, now() - interval '5 days',  'csv'),
 (5, 1, now() - interval '20 days', 'csv'),
 (6, 2, now() - interval '20 days', 'csv'),
 (8, 3, now() - interval '3 days',  'csv'),
 (13,5, now() - interval '1 day',   'csv'),
 (13,6, now() - interval '1 day',   'csv'),
 -- RECONCILIAÇÃO: Beatriz executou "Contas a pagar" (crítica!) mas NÃO está
 -- cadastrada como competente → sistema sugere backup real para a a2 (BF=1)
 (2, 6, now() - interval '4 days',  'csv'),
 (2, 6, now() - interval '11 days', 'csv'),
 (2, 1, now() - interval '1 day',   'csv');
