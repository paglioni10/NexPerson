# Deploy do NexPerson (Vercel + Supabase)

Guia para publicar o projeto com banco no Supabase e app na Vercel.

## 1. Banco de dados (Supabase)

1. Crie uma conta e um projeto em https://supabase.com (defina e guarde a senha do
   banco).
2. No projeto, abra **SQL Editor** e:
   - Cole todo o conteúdo de [`db/schema.sql`](../db/schema.sql) e clique em **Run**.
   - Cole todo o conteúdo de [`db/seed.sql`](../db/seed.sql) e clique em **Run**.
   - (Opcional) rode `select * from vw_dashboard;` para conferir os números.
3. Pegue a string de conexão para o app: botão **Connect** (topo) →
   **Transaction pooler** (porta `6543`). Substitua `[YOUR-PASSWORD]` pela senha.
   Use essa string como `DATABASE_URL` na Vercel.

> Use o **Transaction pooler (6543)**, não a conexão direta: ele é compatível com
> IPv4 e com ambientes serverless (Vercel). O `db.ts` já desativa prepared
> statements automaticamente quando detecta o pooler.

### Alternativa por linha de comando

Se preferir, em vez do SQL Editor, coloque a string de conexão **(Session pooler,
porta 5432)** no `.env.local` e rode:

```bash
npm run db:migrate
```

## 2. App (Vercel)

1. Em https://vercel.com → **Add New… → Project → Import Git Repository** e escolha
   o repositório **NexPerson** (autorize o GitHub se necessário).
2. A Vercel detecta Next.js automaticamente (não mude as configurações de build).
3. Em **Environment Variables**, adicione:
   - `DATABASE_URL` = string do Transaction pooler do Supabase (porta 6543)
   - `GEMINI_API_KEY` = sua chave do Google AI Studio (opcional; sem ela, a Análise
     por IA usa o fallback determinístico)
4. Clique em **Deploy**.

Ao final, a Vercel fornece a URL pública. Cada `git push` na branch `main` passa a
gerar um novo deploy automaticamente.

## 3. Pós-deploy

- Acesse a URL e confirme o Dashboard com os dados da empresa "Acme".
- Em **Análise por IA**, clique em "Gerar análise" para validar a chave do Gemini.
- Adicione a URL pública no campo **Website** do repositório no GitHub.

## Variáveis de ambiente (resumo)

| Variável | Onde usar | Observação |
|----------|-----------|------------|
| `DATABASE_URL` | Vercel + local | Pooler de transação (6543) em produção |
| `GEMINI_API_KEY` | Vercel + local | Opcional; ativa a IA real |
