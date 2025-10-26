# Política de Acesso a Banco no Web

Para cumprir a especificação do `fut7pro-web` (sem acesso direto ao banco de dados em produção):

- Em produção, defina no ambiente da Vercel:
  - `DISABLE_WEB_DIRECT_DB=true`
- Com isso, qualquer tentativa de uso do Prisma no web resultará em erro claro (`WEB_DB_DISABLED`).
- Rotas que ainda não foram migradas para o backend devem responder `501` em produção enquanto a migração não acontece.
- Todo acesso a dados em produção deve ser via API do backend (BACKEND_URL/NEXT_PUBLIC_API_URL).

Status de implementação:
- Guard global ativado em `src/server/prisma.ts`.
- Rotas App Router sensíveis verificam o flag e retornam `501`.
- Principais rotas Pages API com Prisma retornam `501` em produção.

Atualize este documento conforme as rotas forem migradas para o backend.

