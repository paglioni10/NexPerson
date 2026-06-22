# NexPerson

> Mapa de Dependência Humana da Empresa — *"Transformando conhecimento em continuidade."*

Plataforma que identifica, visualiza e monitora a dependência de pessoas nos
processos de uma empresa, transformando risco operacional invisível em indicadores
auditáveis (Bus Factor, ICO, IRO).

📄 Documentação completa do projeto: [`docs/NexPerson.md`](docs/NexPerson.md)
🧮 Métricas como views SQL: [`db/schema.sql`](db/schema.sql)
🤖 Prompts da camada de IA: [`docs/ia-prompts.md`](docs/ia-prompts.md)

## Stack
Next.js (App Router) · TypeScript · Tailwind CSS · PostgreSQL (Supabase em prod) ·
visualização com React Flow · IA na camada de linguagem.

## Rodando localmente

Pré-requisitos: Node 20+ e Docker.

```bash
npm install
npm run db:up      # sobe o Postgres e carrega schema + seed de demonstração
npm run dev        # http://localhost:3000
```

O banco já vem populado com a empresa fictícia "Acme", com gargalos plantados para
a demonstração (atividade órfã, falsos backups, processo com Bus Factor 1,
concentração de conhecimento e uma divergência de reconciliação).

```bash
npm run db:reset   # recria o banco do zero (schema + seed)
```

## Estrutura
```
db/        schema.sql (tabelas + views das métricas) e seed.sql
docs/      documento mestre, prompts de IA
src/app/   rotas (App Router) — dashboard, cadastros, mapa
src/lib/   acesso a dados (server-only) e consultas às métricas
src/components/  UI reutilizável
```
