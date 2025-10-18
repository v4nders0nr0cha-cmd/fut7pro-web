# Matriz de variáveis de ambiente (Vercel)

Este arquivo espelha as variáveis hoje configuradas no projeto `fut7pro-web` na Vercel. Segredos são mascarados propositalmente para que o documento possa viver no repositório. Mantenha-o alinhado com o painel da Vercel sempre que houver mudanças.

| Key                               | Valor na Vercel (mascarado quando sensível)            | Usado em                                                                           | Observações                                                                                                            |
| --------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_DEFAULT_TENANT_SLUG` | `fut7pro`                                              | —                                                                                  | Não encontrada no código atual. Pode ser removida ou documentada para uso futuro.                                      |
| `NEXT_PUBLIC_API_URL`             | `https://fut7pro-backend.onrender.com/`                | Cliente HTTP (`src/lib/api/fetcher.ts`, `next.config.js`, configs)                 | Recomendo padronizar para `https://api.fut7pro.com.br` (domínio oficial). O fetcher concatena caminho sem barra dupla. |
| `BACKEND_URL`                     | `https://api.fut7pro.com.br`                           | Proxies do App Router (ex.: `src/app/api/public/jogos-do-dia/route.ts`) e Auth API | Mantém as rotas de API do App Router apontando para o backend oficial.                                                 |
| `JOGOS_DIA_PATH`                  | `/partidas/jogos-do-dia`                               | `src/app/api/public/jogos-do-dia*/route.ts`                                        | Caminho do endpoint público no backend.                                                                                |
| `AUTH_LOGIN_PATH`                 | `/api/auth/login`                                      | `src/app/api/auth/[...nextauth]/route.ts`                                          | Caminho de login no backend.                                                                                           |
| `AUTH_REFRESH_PATH`               | `/api/auth/refresh`                                    | `src/app/api/auth/[...nextauth]/route.ts`                                          | Caminho de refresh no backend.                                                                                         |
| `AUTH_ME_PATH`                    | `/api/auth/me`                                         | `src/app/api/auth/[...nextauth]/route.ts`                                          | Caminho de "me" no backend.                                                                                            |
| `AUTH_REGISTER_TENANT_PATH`       | `/api/auth/register-tenant`                            | —                                                                                  | Não usada no código atual. Se não houver fluxo de registro via web, remova para reduzir ruído.                         |
| `NEXTAUTH_URL`                    | `https://app.fut7pro.com.br`                           | NextAuth (App Router)                                                              | URL pública do app. Obrigatória em produção.                                                                           |
| `NEXTAUTH_SECRET`                 | `0Z5h...L N`                                           | NextAuth                                                                           | Segredo obrigatório. Guarde apenas na Vercel.                                                                          |
| `AUTH_SECRET`                     | `0Z5h...L N`                                           | —                                                                                  | Não utilizada pelo código atual (NextAuth usa `NEXTAUTH_SECRET`). Pode remover.                                        |
| `GOOGLE_CLIENT_ID`                | `19000060782-....apps.googleusercontent.com`           | Integração Google (NextAuth server options)                                        | Só é usada se o provider Google estiver habilitado no options.                                                         |
| `GOOGLE_CLIENT_SECRET`            | `client_secret_...`                                    | Integração Google                                                                  | Segredo Google. Somente necessário se o provider estiver ativo.                                                        |
| `DATABASE_URL`                    | `postgresql://fut7pro:***@.../fut7pro?sslmode=require` | Prisma (`src/server/prisma.ts`, rotas server)                                      | Requerido para rotas/serviços que consultam o banco via Prisma.                                                        |
| `DIRECT_URL`                      | `postgresql://fut7pro:***@.../fut7pro?sslmode=require` | Prisma CLI                                                                         | Útil para operação administrativa/CLI; opcional para runtime.                                                          |
| `NODE_ENV`                        | `production`                                           | Next.js/Node                                                                       | A Vercel já injeta automaticamente; manter é inofensivo.                                                               |

## Variáveis opcionais reconhecidas pelo código (não obrigatórias em produção)

- `NEXT_PUBLIC_APP_URL` — base do site para metadados/links. Default: `https://app.fut7pro.com.br`.
- `NEXT_PUBLIC_MP_PUBLIC_KEY` — chave pública do Mercado Pago (se for expor funcionalidades de pagamento no front). Default vazio.
- `NEXTAUTH_ACCESS_TOKEN_TTL` — TTL padrão (segundos) para tokens simulados/refresco em SSR. Default `3600`.
- `NEXTAUTH_DEBUG` — `true/false` para logs do NextAuth.
- `PRISMA_LOG_QUERIES` — `1` para logar queries lentas; `PRISMA_SLOW_MS` para limiar (ms). Default `200`.
- `TEST_EMAIL`, `TEST_PASSWORD`, `TEST_TENANT_ID`, `TEST_TENANT_SLUG` — habilitam login de teste em ambientes de dev/homolog para rotas/SSR locais. Não usar em produção.

## Alinhamento verificado com o repositório

- `NEXT_PUBLIC_API_URL`: está definido, porém aponta para `onrender.com`. O backend e os proxies usam `https://api.fut7pro.com.br`. Sugiro atualizar para o mesmo domínio para evitar diferenças de CORS/cache.
- `BACKEND_URL` e `JOGOS_DIA_PATH`: presentes e usados pelas rotas de proxy. OK.
- `AUTH_*_PATH`: usados no handler de NextAuth do App Router. OK.
- `DATABASE_URL`/`DIRECT_URL`: necessários porque o web executa Prisma em rotas/servidor (`src/server/prisma.ts`, agregadores). OK.
- `NEXTAUTH_URL`/`NEXTAUTH_SECRET`: exigidos pelo NextAuth. OK.
- `AUTH_SECRET`: não utilizado — pode remover para reduzir ruído.
- `AUTH_REGISTER_TENANT_PATH` e `NEXT_PUBLIC_DEFAULT_TENANT_SLUG`: não utilizados no código atual — podem ser removidos, a menos que planeje reativar esses fluxos.
- Google OAuth: as variáveis estão presentes, mas o provider só será utilizado se configurado no options utilizado pela rota. Se não for usar Google no login, manter os valores não causa erro, mas pode ser removido para simplificar.

## Recomendações práticas

1. Padronizar `NEXT_PUBLIC_API_URL` para `https://api.fut7pro.com.br` (mesmo domínio do backend em produção).
2. Remover variáveis não utilizadas: `AUTH_SECRET`, `AUTH_REGISTER_TENANT_PATH`, `NEXT_PUBLIC_DEFAULT_TENANT_SLUG` (salvo plano de uso futuro).
3. Definir `NEXT_PUBLIC_MP_PUBLIC_KEY` caso venha a expor recursos de pagamento no front (opcional).
4. Manter `DATABASE_URL`/`DIRECT_URL` sempre com `sslmode=require` (já está correto).

> Sempre que o código passar a depender de uma nova variável, inclua-a aqui e crie no painel da Vercel para evitar divergências.
