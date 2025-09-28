# Guia de Variaveis de Ambiente — fut7pro-web

Este guia consolida todas as variaveis utilizadas pelo fut7pro-web em desenvolvimento, CI e producao. Utilize-o junto aos arquivos nv.example e nv.local.example para configurar novos ambientes rapidamente.

## 1. Producao (Vercel)

| Variavel             | Obrigatoria?   | Observacao                                                              |
| -------------------- | -------------- | ----------------------------------------------------------------------- |
| NEXTAUTH_URL         | Sim            | https://app.fut7pro.com.br                                              |
| NEXTAUTH_SECRET      | Sim            | Gere e armazene apenas na Vercel.                                       |
| GOOGLE_CLIENT_ID     | Se usar Google | 19000060782-dfvl88f3fngh75vakhakejn6ranoo8i1.apps.googleusercontent.com |
| GOOGLE_CLIENT_SECRET | Se usar Google | Definido na Vercel.                                                     |
| NEXT_PUBLIC_API_URL  | Recomendado    | Padronize para https://api.fut7pro.com.br.                              |
| BACKEND_URL          | Sim            | https://api.fut7pro.com.br para os proxies do App Router.               |
| JOGOS_DIA_PATH       | Sim            | /partidas/jogos-do-dia.                                                 |
| DATABASE_URL         | Se usar Prisma | URL do PostgreSQL (Railway) com sslmode=require.                        |

> **Boas praticas**: se hospedar Prisma em serverless, utilize pooling (pgBouncer/Accelerate) para evitar limite de conexoes.

### OAuth Google

Configure no Google Cloud Console:

- **Authorized JavaScript origins**: http://localhost:3000, https://app.fut7pro.com.br, https://fut7pro-web.vercel.app
- **Authorized redirect URIs**: http://localhost:3000/api/auth/callback/google, https://app.fut7pro.com.br/api/auth/callback/google, https://fut7pro-web.vercel.app/api/auth/callback/google

### NextAuth com fallback seguro

` s
import GoogleProvider from "next-auth/providers/google";

const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
providers.push(
GoogleProvider({
clientId: process.env.GOOGLE_CLIENT_ID!,
clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
})
);
}
`

## 2. Desenvolvimento (local)

Crie .env.local na raiz:

`
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<gera-com-node>

# Opcional: testar Google local

GOOGLE_CLIENT_ID=19000060782-dfvl88f3fngh75vakhakejn6ranoo8i1.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<client_secret>

NEXT_PUBLIC_API_URL=http://localhost:3000
BACKEND_URL=https://api.fut7pro.com.br
JOGOS_DIA_PATH=/partidas/jogos-do-dia

DATABASE_URL=postgresql://postgres:FIreXteKUyZhNaARfDTyIGcopKkPkRSZ@switchback.proxy.rlwy.net:29082/railway?sslmode=require
`

Para banco local via Docker:

`npm run db:up
=<url-local>`

Depois execute as migracoes com seed padrao:

`npm run dev:migrate-seed -Slug demo-rachao`

## 3. CI (GitHub Actions)

Utilize o mesmo conjunto de variaveis. Para bancos efemeros, a pipeline pode apontar para Postgres local do workflow. Certifique-se de definir:

- NEXTAUTH_URL=https://app.fut7pro.com.br
- NEXTAUTH_SECRET
- BACKEND_URL
- JOGOS_DIA_PATH
- DATABASE_URL (service do workflow ou Railway)

Scripts existentes (dev:migrate-seed, seed-campeoes, seed-times-do-dia) leem DATABASE_URL, garantindo comportamento consistente entre CI e desenvolvimento.

## 4. Mapa rapido

| Variavel               | Ambientes     | Obrigatoria     | Observacao                       |
| ---------------------- | ------------- | --------------- | -------------------------------- |
| NEXTAUTH_URL           | dev, prod, CI | Sim             | URL publica do App Router        |
| NEXTAUTH_SECRET        | dev, prod, CI | Sim             | Segredo compartilhado            |
| GOOGLE_CLIENT_ID       | dev, prod     | Se usar         | Provider Google                  |
| GOOGLE_CLIENT_SECRET   | dev, prod     | Se usar         | Provider Google                  |
| NEXT_PUBLIC_API_URL    | dev, prod     | Recomendado     | Fallback cliente sem proxy       |
| BACKEND_URL            | dev, prod, CI | Sim             | Usado pelos proxies              |
| JOGOS_DIA_PATH         | dev, prod, CI | Sim             | Caminho backend                  |
| DATABASE_URL           | dev, prod, CI | Se Prisma ativo | Necessario para App Router/Seeds |
| SEED_SLUG / RACHA_PATH | CI/E2E        | Opcional        | Helpers de testes                |

## 5. Checklist rapida

1. Copie nv.example para .env.local.
2. Ajuste NEXT_PUBLIC_API_URL para o destino desejado (local ou producao).
3. Defina NEXTAUTH_SECRET e credenciais do Google apenas quando necessario.
4. Confirme que BACKEND_URL e JOGOS_DIA_PATH refletem o backend oficial.
5. Rode
   pm run type-check e
   pm run lint para validar configuracao apos ajustes.

Mantendo este guia atualizado, facilitamos o onboarding de novos ambientes e garantimos paridade entre desenvolvimento, CI e producao.
