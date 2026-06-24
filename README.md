<div align="center">

# NexPerson

### Mapa de Dependência Humana da Empresa

**"Transformando conhecimento em continuidade."**

Plataforma de gestão de risco operacional que identifica, visualiza e monitora a
dependência de pessoas nos processos de uma empresa, transformando risco invisível
em indicadores auditáveis e acionáveis.

![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-22C55E)

</div>

---

## Sumário

- [O problema](#o-problema)
- [A solução](#a-solução)
- [Funcionalidades](#funcionalidades)
- [Os indicadores](#os-indicadores)
- [Arquitetura](#arquitetura)
- [Stack](#stack)
- [Como executar](#como-executar)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Acessibilidade](#acessibilidade)
- [Inteligência Artificial](#inteligência-artificial)
- [Privacidade e governança (LGPD)](#privacidade-e-governança-lgpd)
- [Roadmap](#roadmap)
- [Documentação](#documentação)
- [Licença e autor](#licença-e-autor)

---

## O problema

Em quase toda empresa existem pessoas que concentram conhecimento crítico sobre
processos. Quando uma delas tira férias, é desligada ou fica indisponível, processos
importantes simplesmente param. Esse risco costuma ser **invisível** para a gestão:
não há dado, não há visão, não há plano.

- Apenas uma pessoa sabe executar determinada atividade.
- Não existem substitutos realmente capacitados para funções críticas.
- Gestores não enxergam onde estão os maiores pontos de falha.

## A solução

O NexPerson mapeia a relação entre **processos, atividades e pessoas** e calcula
indicadores de continuidade **explicáveis e auditáveis** (nada de score mágico).
Cada número exibido pode ser rastreado até a sua origem.

O princípio central é separar **capacidade** (o que a pessoa sabe fazer, e em que
nível) de **designação** (o papel que a empresa atribuiu). É isso que permite
detectar, por exemplo, um "falso backup": alguém formalmente designado como
substituto, mas sem capacidade real.

> A aplicação já vem com uma empresa fictícia ("Acme") populada, com gargalos
> plantados de propósito para a demonstração: uma atividade órfã, falsos backups,
> processos com Bus Factor 1, concentração de conhecimento e uma divergência de
> reconciliação.

## Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| **Dashboard executivo** | Contagens acionáveis de risco (atividades órfãs, processos com Bus Factor 1, falsos backups, cobertura), cada uma rastreável até a origem. |
| **Cadastro organizacional** | CRUD de colaboradores, processos e atividades, com vínculos que separam capacidade (nível) de designação (papel). |
| **Mapa de dependência** | Grafo interativo Processo → Atividade → Colaborador (React Flow), com filtros por pessoa/processo/atividade, destaque de gargalos e nós arrastáveis. |
| **Simulação de impacto** | Recálculo determinístico de "o que acontece se a pessoa X sair": atividades órfãs, processos comprometidos e queda de cobertura. |
| **Import de execuções (CSV)** | Importa logs de execução de ERP/ferramentas de projeto para reconciliar o que foi declarado com o que de fato acontece. |
| **Reconciliação** | Encontra quem executa sem estar cadastrado (possível backup real) e backups que nunca executaram (backup só no papel). |
| **Análise por IA** | Diagnóstico, recomendações e resumo executivo em linguagem natural, gerados a partir dos números já calculados. |
| **Temas acessíveis** | Modo claro, escuro e alto contraste, com foco visível e navegação por teclado. |

## Os indicadores

Todas as métricas derivam de **um único parâmetro auditável**: o nível mínimo para
ser considerado "Executor Capaz" (padrão: Intermediário).

- **Bus Factor (BF):** número mínimo de pessoas cuja ausência interrompe uma
  atividade ou processo. BF 0 = órfã, BF 1 = risco crítico.
- **Índice de Concentração Operacional (ICO):** quanto do risco crítico está
  concentrado em uma pessoa (0 a 100), ponderado por criticidade e exclusividade.
- **Índice de Redundância Operacional (IRO):** percentual de cobertura com backup
  capaz, em versão simples e ponderada por criticidade.

As três são implementadas como **views SQL**, o que torna cada número conferível
lendo a própria consulta. Especificação completa em
[`docs/NexPerson.md`](docs/NexPerson.md).

```mermaid
flowchart LR
    P["Parâmetro único<br/>Nível mínimo capaz + pesos"] --> C["Executor Capaz"]
    C --> BF["Bus Factor<br/>(processo)"]
    C --> ICO["ICO<br/>(pessoa)"]
    C --> IRO["IRO<br/>(global)"]
    BF --> D["Contagens acionáveis<br/>(Dashboard)"]
    ICO --> D
    IRO --> D
```

## Arquitetura

Aplicação full stack em Next.js (App Router), sem backend separado. A inteligência
das métricas vive no banco (views SQL), e a interface lê esses dados via Server
Components e Server Actions. A camada de IA apenas traduz números em texto.

```mermaid
flowchart TD
    UI["Next.js App Router<br/>(Server Components + Server Actions)"]
    DB[("PostgreSQL<br/>tabelas + views das métricas")]
    IA["Google Gemini<br/>(camada de linguagem)"]
    CSV["Import CSV<br/>(logs de execução)"]

    UI <--> DB
    UI --> IA
    CSV --> DB
    IA -.->|lê os números calculados| UI
```

Decisões de arquitetura registradas como ADRs em [`docs/NexPerson.md`](docs/NexPerson.md):
métricas auditáveis, integração como reconciliação, governança/LGPD, modelo de dados
(capacidade x designação) e escolha de stack.

## Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Shadcn-style UI própria
- **Visualização:** React Flow
- **Backend e dados:** Next.js (Server Actions e Route Handlers) + PostgreSQL
- **IA:** Google Gemini (camada de linguagem, com fallback determinístico)
- **Infra de desenvolvimento:** Docker Compose (PostgreSQL)
- **Produção sugerida:** Vercel (app) + Supabase (banco e autenticação)

## Como executar

**Pré-requisitos:** Node 20+ e Docker.

```bash
# 1. Instalar dependências
npm install

# 2. Subir o banco (PostgreSQL via Docker) com schema e seed de demonstração
npm run db:up

# 3. Rodar a aplicação
npm run dev
```

Acesse **http://localhost:3000**.

Para recriar o banco do zero a qualquer momento:

```bash
npm run db:reset
```

### Variáveis de ambiente

Crie um arquivo `.env.local` na raiz:

```bash
# Banco de desenvolvimento (docker-compose)
DATABASE_URL=postgres://postgres:nex@localhost:55432/nexperson

# Opcional: habilita a Análise por IA (sem a chave, usa o fallback determinístico)
GEMINI_API_KEY=sua_chave_do_google_ai_studio
```

> A chave gratuita pode ser gerada em https://aistudio.google.com/apikey.
> Após alterar o `.env.local`, reinicie o `npm run dev`.

## Estrutura do projeto

```
nexperson/
├── db/
│   ├── schema.sql        # tabelas + views das métricas (Bus Factor, ICO, IRO)
│   └── seed.sql          # empresa fictícia "Acme" com gargalos plantados
├── docs/
│   ├── NexPerson.md      # documento mestre: visão, ADRs e métricas
│   └── ia-prompts.md     # prompts da camada de IA
├── src/
│   ├── app/              # rotas (App Router): dashboard, cadastros, mapa, etc.
│   ├── components/       # UI reutilizável (cards, tabelas, logo, temas)
│   └── lib/              # acesso a dados, métricas, IA, simulação (server-only)
├── docker-compose.yml    # PostgreSQL de desenvolvimento
└── README.md
```

## Acessibilidade

- Três temas: **claro**, **escuro** e **alto contraste**, com persistência e sem
  flash na carga.
- Foco visível por teclado em todos os controles (WCAG 2.4.7).
- Link "pular para o conteúdo", navegação rotulada e respeito a
  `prefers-reduced-motion`.
- Cores construídas sobre tokens semânticos, o que mantém o contraste correto em
  qualquer tema.

## Inteligência Artificial

A IA atua **apenas na camada de linguagem**. Ela não calcula, não estima e não
decide: recebe os números já apurados pelas views e os transforma em diagnóstico,
recomendações e resumo executivo. Toda saída é rotulada como sugestão para revisão
humana.

Se a chave não estiver configurada ou o serviço estiver indisponível, um
**fallback determinístico** gera o texto localmente a partir dos mesmos números,
garantindo que o recurso nunca quebra.

## Privacidade e governança (LGPD)

O NexPerson é posicionado como ferramenta de **gestão de risco e continuidade**, não
de avaliação de pessoas. O projeto assume que processa dado pessoal e adota, por
design:

- **Minimização:** coleta apenas o necessário (sem salário, sem avaliação de
  desempenho, sem dado sensível).
- **Decisão humana:** a IA e as métricas geram sugestões; nada é decidido
  automaticamente.
- **Transparência:** premissas declaradas na interface (o nível de domínio é
  atribuído e deve ser revisado pelo gestor).

## Roadmap

O projeto separa o que é **MVP (portfólio)** do que seria um **produto (SaaS)**:

- [x] Métricas auditáveis, cadastro, mapa, simulação, reconciliação, IA e temas
- [ ] Autenticação (Supabase Auth) e multi-tenant
- [ ] Conectores nativos (ERP, ferramentas de projeto) além do import CSV
- [ ] Versionamento histórico de competências (evolução de treinamento)
- [ ] Deploy público (Vercel + Supabase)

## Documentação

- [`docs/NexPerson.md`](docs/NexPerson.md): documento mestre com visão de produto,
  decisões de arquitetura (ADRs) e a especificação completa das métricas.
- [`docs/ia-prompts.md`](docs/ia-prompts.md): contrato de entrada e prompts da
  camada de IA.

## Licença e autor

Distribuído sob a licença MIT. Veja [`LICENSE`](LICENSE).

Desenvolvido por **paglioni10** como projeto de portfólio com foco em transformação
digital, governança e continuidade operacional.
