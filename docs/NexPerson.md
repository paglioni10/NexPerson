# NexPerson, Mapa de Dependência Humana da Empresa

> **Slogan:** "Transformando conhecimento em continuidade."
>
> Plataforma web que identifica, visualiza e monitora a dependência de pessoas nos
> processos de uma empresa, transformando risco operacional invisível em dados
> concretos e acionáveis.
>
> **Documento único e completo do projeto.** Reúne visão de produto,
> funcionalidades, decisões de arquitetura (ADRs), a especificação detalhada das
> métricas e a identidade visual.

---

## Sumário

- [Convenção de escopo (MVP × SaaS)](#convenção-de-escopo)
- [Parte I, Visão de Produto](#parte-i-visão-de-produto)
- [Parte II, Funcionalidades](#parte-ii-funcionalidades)
- [Parte III, Decisões de Arquitetura (ADRs)](#parte-iii-decisões-de-arquitetura-adrs)
  - [ADR-001, Métricas baseadas em capacidade auditável](#adr-001-métricas-de-risco-baseadas-em-capacidade-auditável)
  - [ADR-002, Integração é reconciliação, não fonte da verdade](#adr-002-origem-dos-dados-integração-é-reconciliação-não-fonte-da-verdade)
  - [ADR-003/004, Governança, LGPD e ética](#adr-003004-governança-lgpd-e-ética)
  - [ADR-005, Modelo de dados (separar capacidade de designação)](#adr-005-modelo-de-dados-separar-capacidade-de-designação-opção-b)
  - [Decisões pendentes](#decisões-pendentes)
- [Parte IV, Especificação de Métricas (detalhada)](#parte-iv-especificação-de-métricas-detalhada)
- [Parte V, Stack e Identidade Visual](#parte-v-stack-e-identidade-visual)

---

## Convenção de escopo

Toda decisão é registrada em **duas trilhas paralelas**:

- 🎓 **MVP (Portfólio)**, versão demonstrável, focada em conseguir a vaga.
  Critério: entregável sozinho, sem dependências externas, 100% funcional e
  defensável numa entrevista.
- 🚀 **Produto (SaaS)**, para onde a decisão evolui num produto real e vendável.
  Critério: viável comercialmente, escalável, multi-empresa.

> O MVP nunca promete o que não entrega; o SaaS é sempre roadmap explícito.
> **Regra anti-escopo:** na dúvida entre MVP e SaaS, é SaaS. O MVP deve doer de tão
> enxuto, é assim que ele fica terminável.

---

# Parte I, Visão de Produto

## Objetivo
Desenvolver uma plataforma web que identifique, visualize e monitore a dependência
de pessoas dentro dos processos de uma empresa, permitindo detectar riscos
operacionais causados pela concentração de conhecimento ou execução de atividades
críticas em poucos colaboradores. O sistema fornece indicadores, dashboards e
análises que ajudam gestores a decidir sobre sucessão, treinamento, distribuição de
responsabilidades e continuidade operacional.

## Problema de Negócio
Em muitas empresas, colaboradores concentram conhecimento crítico sobre processos:
- Apenas uma pessoa sabe executar determinada atividade.
- Não há substitutos treinados para funções críticas.
- Férias, desligamentos ou indisponibilidade interrompem processos importantes.
- Gestores não têm visibilidade de onde estão os maiores riscos de dependência.

O objetivo da plataforma é transformar esse risco invisível em dados concretos e
acionáveis.

## Público-Alvo
Gestores · Coordenadores · RH · Equipes de Processos · Equipes de Transformação
Digital · Consultorias Empresariais.

## Diferenciais
- Visualização em grafos.
- Indicadores de risco operacional **auditáveis** (não scores arbitrários).
- Reconciliação entre o que é declarado e o que de fato acontece na operação.
- Simulação de desligamento de colaboradores (determinística).
- Recomendações por IA na camada de linguagem.
- Foco em continuidade operacional e governança, não em avaliação de pessoas.

## Valor para Portfólio
Demonstra competências de Transformação Digital: mapeamento e otimização de
processos, governança corporativa, gestão do conhecimento, indicadores de negócio,
visualização de dados, arquitetura full stack, aplicação prática de IA em problemas
reais e pensamento estratégico voltado à redução de riscos operacionais.

---

# Parte II, Funcionalidades

## 1. Cadastro Organizacional
**Colaboradores:** nome, cargo, área, departamento, tempo de empresa, nível de
senioridade, status (ativo/inativo).

**Processos:** nome, descrição, área responsável, criticidade (Baixa/Média/Alta).
*Exemplos:* Compras, Financeiro, RH, Atendimento, Marketing, TI.

**Atividades** (cada processo tem N): nome, descrição, tempo médio de execução,
criticidade, frequência de execução.
*Exemplo, processo "Pagamento de Fornecedores":* conferir notas fiscais, aprovar
pagamentos, realizar pagamento bancário.

## 2. Relacionamento entre Pessoas e Atividades
Associa colaboradores a atividades. **Decisão de modelagem (ADR-005):** separar
*capacidade* de *designação*.
- **Capacidade (competência):** nível de domínio na atividade, Iniciante,
  Intermediário, Avançado, Especialista.
- **Designação (atribuição):** papel, executor principal, secundário, backup.

> A separação é o que permite detectar o "falso backup" (designado como backup, mas
> sem capacidade real), um dos insights centrais do produto.

## 3. Mapeamento de Dependência (automático)
O sistema identifica automaticamente:
- **Atividades sem backup capaz** → risco crítico. *Ex.: "Conferência Fiscal",
  responsável Maria, sem backup → Risco Crítico.*
- **Processos dependentes de uma única pessoa** → alta dependência operacional.
  *Ex.: Folha de Pagamento toda executada por Carlos.*
- **Pessoas com excesso de concentração** → risco de conhecimento. *Ex.: Maria em
  Financeiro, Compras, Contratos e Auditoria.*

## 4. Dashboard Executivo
**Indicadores gerais:** total de processos, atividades e colaboradores; processos
críticos; atividades sem backup; colaboradores com alta concentração.

**Contagens acionáveis** (ver ADR-001) no topo, em vez de um "Índice de
Dependência" arbitrário. Rankings de processos críticos e de concentração, com o
número sempre rastreável até a sua origem.

## 5. Visualização em Grafo
Mapa interativo Processo → Atividade → Colaborador, com zoom, filtros, pesquisa e
destaque de gargalos.
```
Financeiro
├── Conferência Fiscal
│   └── Maria
└── Pagamentos
    ├── João
    └── Carlos
```

## 6. Indicadores Inteligentes
Bus Factor, Índice de Concentração Operacional (ICO), Índice de Redundância
Operacional (IRO). Definição completa e auditável na [Parte IV](#parte-iv-especificação-de-métricas-detalhada).

## 7. Módulo de IA
IA aplicada **apenas na camada de linguagem**:
- **Diagnóstico:** *"Existem 18 atividades críticas sem backup definido."*
- **Recomendações:** *"Treinar João para atuar como substituto em atividades
  financeiras."*
- **Resumo executivo:** *"Os maiores riscos estão na área financeira. Dois
  colaboradores concentram 73% das atividades críticas."*

A **simulação de impacto é determinística** (recálculo, não predição por IA):
*"Se Maria sair: 7 atividades sem responsável, 3 processos comprometidos, cobertura
cai de 79% para 52%."*

---

# Parte III, Decisões de Arquitetura (ADRs)

## ADR-001, Métricas de risco baseadas em capacidade auditável
**Problema:** evitar scores arbitrários (ex.: "Índice de Dependência = 92").
**Status:** Decidido. Especificação detalhada na [Parte IV](#parte-iv-especificação-de-métricas-detalhada).

**Decisão comum às duas trilhas:** três métricas derivadas de um único parâmetro
auditável (`NÍVEL_MÍNIMO_CAPAZ`): Bus Factor, ICO e IRO. Nada de score composto
opaco, o topo do dashboard usa **contagens acionáveis** (atividades órfãs,
processos com BF=1, pessoas acima do ICO, falsos backups, IRO ponderado).

| Aspecto | 🎓 MVP (Portfólio) | 🚀 Produto (SaaS) |
|---------|-------------------|-------------------|
| Pesos de criticidade | Fixos configuráveis (1/3/5) | Configuráveis por empresa/perfil |
| `ICO_ALERTA` | Corte absoluto fixo (=25) | Calibração **relativa** (top X% da distribuição da própria empresa) |
| Bus Factor de processo | Mínimo das atividades críticas | Idem + modelagem de dependência/ordem entre atividades |
| Threshold "capaz" | Global, configurável | Configurável **por processo** |

## ADR-002, Origem dos dados: integração é reconciliação, não fonte da verdade
**Problema (nº4):** quem alimenta os dados? Como manter o mapa vivo sem cadastro
manual interminável.

**Insight central:** logs de ERP/Monday medem **execução**, não **capacidade**.
As métricas exigem capacidade (quem é capaz, em que nível, e quem é backup, que
por definição quase não aparece nos logs). Portanto a integração **não pode ser a
fonte da verdade de capacidade**. Seu papel correto é **bootstrap + reconciliação**.

> Frase-guia: *"O NexPerson não adivinha quem é capaz a partir dos logs, ele usa
> os logs para questionar o que o gestor declarou e manter o mapa honesto."*

| Aspecto | 🎓 MVP (Portfólio) | 🚀 Produto (SaaS) |
|---------|-------------------|-------------------|
| Entrada de dados | **Import CSV/planilha genérico** (export de qualquer ERP/Monday → CSV) | Conectores nativos (Sankhya, Monday, etc.) implementando a interface abstrata |
| Arquitetura | **Conector abstrato** `evento → atividade → executor → timestamp`, com CSV como 1ª implementação | Múltiplas implementações do mesmo conector |
| Papel da automação | Sugerir candidatos ao cadastro (tira a folha em branco) | Idem + sincronização contínua |
| Reconciliação declarado-vs-real | **Sim, recurso central** (caça "falsos backups", valida BF=1, sugere vínculos faltantes) | Idem, contínua e com alertas |
| Risco de execução (concentração) | Exibido, **rotulado como distinto** de risco de capacidade | Idem |
| Integração nativa com ERP | ❌ Fora do escopo, apenas roadmap citado | ✅ Núcleo do valor |

**Por que não citar Sankhya no MVP:** sem ambiente real para testar, integração
nativa vira slide, não software. CSV genérico cobre 100% dos sistemas, é
demonstrável de verdade e prova a arquitetura de conectores.

## ADR-003/004, Governança, LGPD e ética
**Problema (nº5):** mitigar LGPD, ética e percepção interna dos colaboradores.

**Posicionamento (comum às duas trilhas):** plataforma de **gestão de risco
operacional e continuidade**, não de avaliação de pessoas. Recomendações
(treinamento cruzado, backups, sucessão) visam resiliência do processo.

**Reenquadramento crítico, assumir, não negar:** o NexPerson **processa dado
pessoal e gera, sim, indicadores individuais** (o ICO é um número por pessoa). A
proteção não vem de negar isso, vem do **propósito + controles**. Negar a
existência do dado individual é insustentável e desmorona em due diligence.

> O human-in-the-loop do ADR-002 (gestor valida) + métricas auditáveis do ADR-001
> **são** o mecanismo de conformidade do art. 20 (não-decisão-automatizada).

| Aspecto | 🎓 MVP (Portfólio) | 🚀 Produto (SaaS) |
|---------|-------------------|-------------------|
| Reconhecer dado individual | Sim, UI/README assumem que ICO é indicador individual com propósito de risco | Idem + mapeamento formal de dados pessoais |
| Base legal | Citada no README (legítimo interesse: continuidade) | **LIA documentada** (teste de proporcionalidade) |
| Minimização | Declarar o que **não** se coleta (sem salário, sem desempenho, sem dado sensível) | Política formal + enforcement no schema |
| Controle de acesso | Visões agregadas por padrão; nominal sinalizado | RBAC por finalidade; nominal exige permissão+justificativa |
| Transparência ao colaborador | Mockup/visão "meus dados" demonstrável | Portal do titular (ver/corrigir os próprios dados) |
| Decisão automatizada | Tudo rotulado como **sugestão**, com cálculo auditável atrás | Direito de revisão (art. 20) implementado |
| Re-identificação em grupos pequenos | Aviso quando agregado identifica (time < N) | Supressão de agregados abaixo de limiar N |
| Retenção / ex-colaboradores | Premissa declarada | Política de retenção e descarte |

**Insight de produto:** declarar o que se **recusa a coletar** é uma das provas
mais fortes de conformidade, e a transparência ao colaborador melhora o dado
(ele corrige) e a aceitação interna.

## ADR-005, Modelo de dados: separar capacidade de designação (Opção B)
**Problema:** como modelar o vínculo pessoa↔atividade. **Status:** Decidido.

**Decisão:** sobre **PostgreSQL** (relacional, não banco de grafo, o "grafo" tem só
3 níveis e as métricas são agregações, melhor servidas por SQL auditável). O vínculo
pessoa↔atividade é modelado em **duas tabelas distintas**, porque *capacidade ≠
designação*, e é isso que torna a detecção de "falso backup" um simples JOIN.

**Esquema central:**
```
colaborador      (id, nome, cargo, area, departamento, senioridade,
                  tempo_empresa, status)
processo         (id, nome, descricao, area, criticidade)
atividade        (id, processo_id→, nome, descricao, criticidade,
                  tempo_medio, frequencia)

competencia      (colaborador_id→, atividade_id→, nivel)    ← CAPACIDADE
                                                              (todas as métricas leem aqui)
atribuicao       (colaborador_id→, atividade_id→, papel)    ← DESIGNAÇÃO da empresa
                                                              (principal/secundário/backup)
evento_execucao  (atividade_id→, colaborador_id→,           ← append-only, imutável
                  executado_em, fonte)                        (reconciliação, ADR-002)
config_empresa   (nivel_minimo_capaz, pesos_criticidade,    ← parâmetros do ADR-001
                  ico_alerta, …)
```

**Por que assim:**
- **Competência** (estado declarado, mutável, curado) e **evento_execucao** (fato
  histórico, imutável, externo) são tabelas separadas → o schema *força* a não
  inferir capacidade a partir de execução (honra o ADR-002).
- "Falso backup" = `atribuicao.papel='backup' AND (competencia ausente OU nivel <
  threshold)` → JOIN trivial.
- As métricas (Bus Factor, ICO, IRO) são implementadas como **views SQL** sobre o
  schema, qualquer um lê o SQL e confere o número (honra o princípio de
  auditabilidade do ADR-001).

**Por que não banco de grafo (Neo4j):** travessias profundas não são o gargalo aqui;
as métricas são contagens/agregações que o Postgres faz melhor e com SQL auditável.
O grafo de 3 níveis é serializado para o React Flow no frontend. Neo4j só entraria
num SaaS com grafos de conhecimento muito mais ricos (decisão consciente de roadmap).

| Aspecto | 🎓 MVP (Portfólio) | 🚀 Produto (SaaS) |
|---------|-------------------|-------------------|
| Multi-tenant | Tabelas simples + `config_empresa` global | `empresa_id` em tudo + RLS por empresa |
| Métricas | Views / materialized views | Idem + cache/particionamento |
| Histórico | Estado atual | Versionamento de `competencia` (evolução de treinamento) |
| `evento_execucao` | Tabela append-only simples | Particionamento por data |

## ADR-006, Stack, autenticação e escopo do MVP
**Status:** Decidido.

- **Backend:** **somente Next.js** (API routes / server actions) + Supabase.
  FastAPI cortado, um único deploy, MVP terminável. (Python, se desejado, em
  projeto à parte.)
- **Visualização:** **React Flow** (D3.js descartado).
- **Autenticação:** **Supabase Auth**, integrada ao RLS, reforça a narrativa de
  LGPD/controle de acesso (ADR-003/004).
- **Escopo do MVP:** núcleo (cadastro + métricas como views + dashboard + grafo)
  **+ simulação de impacto + import CSV + módulo de IA**.

| Recurso | 🎓 MVP | 🚀 SaaS |
|---------|--------|---------|
| Simulação de impacto | ✅ (determinística) | + cenários combinados |
| Import CSV | ✅ (bootstrap do cadastro) | Conectores nativos |
| Reconciliação declarado-vs-real | ✅ (cruza `evento_execucao` × `competencia`, caça falso backup) | ✅ contínua, com alertas |
| Módulo de IA | ✅ camada de linguagem | + análises mais ricas |

**Provedor de IA (MVP):** **Google Gemini API (free tier)**, cota grátis,
suficiente para gerar texto a partir dos números. A camada de IA é fina e isolada,
então trocar de provedor (Groq, OpenRouter, Anthropic) é trivial.

## Decisões pendentes
- [x] Seed de dados realista com gargalos plantados → `db/seed.sql`.
- [x] DDL completo (Postgres) com as views das métricas → `db/schema.sql`
      (validado em Postgres 16, números conferem com o gabarito).
- [x] Prompts da camada de IA → `docs/ia-prompts.md`.
- [ ] (Opcional) Contagem executiva "processos comprometidos (BF≤1)", hoje um
      processo com atividade crítica órfã (BF=0) não é destacado no nível de processo.

> Toda decisão futura segue o formato 🎓 MVP / 🚀 SaaS.

---

# Parte IV, Especificação de Métricas (detalhada)

> **Princípio reitor:** toda métrica deve ser **explicável, reproduzível e
> auditável**. Nenhum número aparece na tela sem que o usuário possa clicar e ver de
> quais atividades, pessoas e pesos ele deriva. Não há "score mágico".
>
> **Foco:** risco de *processo* e *continuidade operacional*, nunca avaliação de
> desempenho de pessoas.

## 0. Parâmetro central: o que é um "Executor Capaz"
Todas as métricas derivam de **uma única definição**, configurável e visível na UI.

```
NÍVEL_MÍNIMO_CAPAZ = Intermediário   (padrão; configurável por empresa e por processo)

Escala de níveis (ordinal):
  Iniciante      = 1
  Intermediário  = 2
  Avançado       = 3
  Especialista   = 4
```

> Uma pessoa é **Executor Capaz** de uma atividade se:
> `status = ativo` **E** `nível_de_domínio ≥ NÍVEL_MÍNIMO_CAPAZ`.

**Decisões deliberadas:**
- **Capacidade ≠ papel.** Alguém marcado como "Backup" mas com nível `Iniciante`
  **não** conta como redundância. Detectar esse caso ("falsa sensação de
  segurança") é um dos insights centrais do produto.
- **Inativos nunca contam** como capacidade, mas geram alerta se ainda vinculados
  ("o único backup de X era João, que está inativo").
- O threshold é **único** para as três métricas → coerência. E é **auditável**: a
  frase "consideramos capaz quem tem nível ≥ Intermediário" aparece junto de todo
  indicador.

### Pesos de criticidade
```
peso(Baixa) = 1
peso(Média) = 3
peso(Alta)  = 5
```
Valores **explícitos, configuráveis e constantes** em qualquer comparação.
Parâmetro documentado e ajustável ≠ número arbitrário escondido.

## 1. Bus Factor (BF), métrica principal
Mede o **número mínimo de pessoas cuja indisponibilidade interrompe a execução**.

### Por atividade
```
BF(atividade) = nº de Executores Capazes da atividade
```

| BF | Categoria | Significado |
|----|-----------|-------------|
| 0  | **Órfã**       | Ninguém capaz. Pior que risco crítico, atividade descoberta. |
| 1  | **Risco crítico** | Uma única ausência interrompe a atividade. |
| 2  | **Risco moderado** | Tolera uma ausência. |
| ≥3 | **Resiliente** | Folga operacional. |

> **BF = 0 é categoria própria**, nunca somado ao "risco normal". Órfã é problema de
> cobertura, não de concentração.

### Por processo, usa o MÍNIMO, não a média
```
BF(processo) = mínimo de BF(atividade) entre as atividades CRÍTICAS do processo
```
**Por que mínimo:** o elo mais fraco derruba a cadeia. Um processo com 9 atividades
cobertas e 1 com BF=1 **não** é saudável, ele quebra exatamente naquela atividade.
A média mascararia o risco; o mínimo o expõe.

*Simplificação documentada:* assume-se que toda atividade crítica é necessária à
execução do processo (sem modelar dependências/ordem entre atividades, fica para
v2).

## 2. Índice de Concentração Operacional (ICO), por pessoa
Mede **quanto do risco operacional crítico está concentrado em um colaborador**. Não
mede desempenho, mede dependência da organização em relação à pessoa.

```
Para cada atividade i que a pessoa executa de forma capaz:

  fator_exclusividade(i) = 1 / BF(i)        (1 se é a única capaz; 0,25 se há 4)

  contribuição(i) = peso_criticidade(i) × fator_exclusividade(i)

ICO_bruto(pessoa) = Σ contribuição(i)

                       ICO_bruto(pessoa)
ICO(pessoa) = ───────────────────────────────────────  × 100
              Σ peso_criticidade de TODAS as atividades
                       críticas da empresa
```

**O coração é o `fator_exclusividade`:** ser o *único* capaz numa atividade pesa
muito mais do que ser um entre quatro. É a tradução matemática de "conhecimento
exclusivo".

- Normalizado de **0 a 100** → comparável entre empresas de tamanhos diferentes.
- **Totalmente auditável:** clicar no ICO de Maria mostra a lista exata de
  atividades, pesos e fatores que somam o número.

> **Limite de alerta** `ICO_ALERTA` (padrão 25): acima disso, a pessoa é sinalizada
> como ponto de concentração. Configurável.

## 3. Índice de Redundância Operacional (IRO), global
Mede a **capacidade da organização de operar diante de férias, afastamentos e
desligamentos**. Reportado em **duas versões**, a diferença entre elas é, por si só,
um insight vendável.

### IRO simples (comunicação)
```
                nº de atividades com BF ≥ 2
IRO_simples = ───────────────────────────────── × 100
                nº total de atividades
```

### IRO ponderado por criticidade (risco real) ← métrica de decisão
```
              Σ peso(atividade) onde BF ≥ 2
IRO_pond = ──────────────────────────────────── × 100
              Σ peso de TODAS as atividades
```

**Por que duas:** uma empresa pode ter `IRO_simples = 80%` e ainda estar à beira do
colapso se os 20% descobertos forem justamente os de alta criticidade. Insight de
produto: *"Sua cobertura bruta é 80%, mas sua cobertura ponderada por risco é 54%."*

> Na UI, mostrar o **ponderado como número principal** e o simples no detalhe/tooltip
>, senão o gestor vê dois "percentuais de cobertura" e não sabe em qual acreditar.

## 4. Indicador Executivo, contagens acionáveis, não score composto
**Decisão deliberada: não existe "Índice de Dependência = 92".** Um índice composto
que ninguém sabe explicar reintroduz o problema que estamos resolvendo. O topo do
dashboard usa **contagens impossíveis de contestar e diretamente acionáveis**:

```
🔴 Atividades órfãs (BF = 0) ......................... N
🔴 Processos com Bus Factor = 1 ..................... N
🟠 Atividades críticas sem redundância (BF = 1) ..... N
🟠 Pessoas com ICO acima do limite .................. N
🟡 "Falsos backups" (papel=backup, nível insuficiente) N
📊 IRO ponderado ................................... XX%
```
Cada contagem é um link para a lista filtrada → da visão executiva ao item acionável
em um clique.

## 5. Casos de borda (decididos)

| Situação | Tratamento |
|----------|------------|
| Atividade sem nenhum executor | BF=0, categoria **Órfã** (separada de crítico). |
| Colaborador inativo vinculado | Excluído da capacidade; gera **alerta** se era único backup. |
| Backup com nível < threshold | Não conta como redundância → flag **"falso backup"**. |
| Atividade não crítica | Entra no IRO_simples; peso baixo no ponderado; ignorada no BF de processo. |
| Pessoa sem nenhum vínculo | ICO = 0 (não é risco de concentração). |
| Empresa sem atividades críticas | Métricas ponderadas = N/A (evita divisão por zero). |

## 6. Premissas e honestidade analítica (exibir na UI e no README)
- O `nível_de_domínio` é **autodeclarado/atribuído**, portanto subjetivo. A UI
  recomenda **revisão pelo gestor**; o sistema não finge precisão absoluta.
- Não se modela ordem/dependência entre atividades (v1).
- Pesos e thresholds são parâmetros da empresa, **a comparação só é válida com os
  mesmos parâmetros**.

> Um sistema que declara suas premissas é mais confiável que um que esconde incerteza
> atrás de um número "exato".

## 7. Exemplo numérico resolvido, Empresa Fictícia "Acme"
**Processo: Folha de Pagamento** (todas atividades de criticidade Alta, peso 5)

| Atividade | Executores capazes (nível) | BF |
|-----------|----------------------------|----|
| Conferir notas fiscais | Maria (Esp.) | 1 |
| Aprovar pagamentos | Maria (Esp.), Carlos (Av.) | 2 |
| Pagamento bancário | Carlos (Av.) | 1 |
| Fechar competência | Maria (Esp.) | 1 |

`BF(Folha) = mín(1,2,1,1) = 1` → **Risco crítico**.

**ICO de Maria** (suponha total de pesos críticos da Acme = 100):
```
Conferir NF:     5 × (1/1) = 5,00
Aprovar pag.:    5 × (1/2) = 2,50
Fechar comp.:    5 × (1/1) = 5,00
ICO_bruto = 12,50  →  ICO = 12,5 / 100 × 100 = 12,5
```
Somando as demais atividades de Maria em outros processos, ela facilmente ultrapassa
`ICO_ALERTA = 25` → sinalizada como ponto de concentração, **com a lista exata que
justifica o número.**

**IRO** (suponha 4 atividades, pesos todos 5; 1 com BF≥2):
```
IRO_simples = 1/4 × 100 = 25%
IRO_pond    = 5 / 20 × 100 = 25%
```
Se a única atividade redundante fosse de baixa criticidade (peso 1):
```
IRO_simples = 25%   mas   IRO_pond = 1 / 16 × 100 ≈ 6%
```
→ a diferença expõe que a redundância existente "não conta" onde importa.

## 8. Resumo da arquitetura de métricas
```
        ┌─────────────────────────────────────────────┐
        │  PARÂMETRO ÚNICO: NÍVEL_MÍNIMO_CAPAZ (≥ Int.) │
        │  + pesos de criticidade (1/3/5)               │
        └───────────────┬─────────────────────────────┘
                        │ define "Executor Capaz"
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
     Bus Factor       ICO           IRO
     (processo)     (pessoa)       (global)
          │             │             │
          └─────────────┼─────────────┘
                        ▼
          Contagens acionáveis (dashboard executivo)
             , sem score composto opaco ,
```

**Toda a inteligência do NexPerson deriva de um único parâmetro auditável.** Essa é
a frase que resume o rigor do projeto.

---

# Parte V, Stack e Identidade Visual

## Stack (decidida, ver ADR-006)
- **Frontend:** Next.js · React · TypeScript · Tailwind CSS · Shadcn/UI
- **Visualização:** React Flow
- **Backend / Dados:** Next.js (API routes / server actions) + PostgreSQL via
  Supabase (sem FastAPI)
- **Autenticação:** Supabase Auth (+ RLS)
- **IA:** API de LLM na camada de linguagem (recomendação: Anthropic / Claude)
- **Hospedagem:** Vercel (app) · Supabase (banco/auth)

## Identidade Visual
- **Nome:** NexPerson, *Nexus* (conexões) + pessoas-chave do projeto. Remete a
  conexões entre pessoas e processos, inteligência organizacional e mapeamento de
  dependências.
- **Slogan:** "Transformando conhecimento em continuidade."
- **Personalidade:** corporativa, moderna, confiável, estratégica.
- **Tipografia:** Manrope. Visual limpo (referências: Notion, Linear, Stripe).
- **Paleta:**

| Cor | Hex |
|-----|-----|
| Azul Principal | `#2563EB` |
| Azul Escuro | `#1E3A8A` |
| Azul Claro | `#DBEAFE` |
| Cinza Escuro | `#111827` |
| Cinza Claro | `#F8FAFC` |
