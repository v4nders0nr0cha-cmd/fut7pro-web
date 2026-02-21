# Fut7Pro Web - Especificacao Funcional

Data de referencia: 2026-02-21  
Aplicacao: `fut7pro-web` (`https://app.fut7pro.com.br`)

## 1. Objetivo

Documentar o estado funcional atual do app web multi-tenant do Fut7Pro para operacao de producao e venda do produto SaaS.

## 2. Ambientes e URLs

- Web (Vercel): `https://app.fut7pro.com.br`
- Backend (Render): `https://api.fut7pro.com.br`
- Site institucional (Vercel): `https://www.fut7pro.com.br`

## 3. Arquitetura base

- Frontend: Next.js App Router + React + TypeScript.
- Backend: NestJS + Prisma + Postgres.
- Autenticacao: NextAuth integrado ao backend.
- Storage: Supabase Storage.
- Modelo de integracao: frontend usa proxies em `src/app/api/**` para falar com o backend.
- Regra de producao: sem uso de Prisma direto no web app (`DISABLE_WEB_DIRECT_DB=true`).

## 4. Dominios funcionais

### 4.1 Publico (site por racha)

- Rotas principais em `/:slug/**`.
- Conteudo e dados por tenant/slug.
- SEO tecnico com sitemap index e sitemaps por slug.
- Fluxos com smoke funcional E2E validado em producao.

### 4.2 Admin (painel do racha)

- Painel global em `/admin/*`.
- Hub oficial em `/admin/selecionar-racha`.
- Tenant ativo por cookie apenas para UX; autorizacao sempre validada no backend.
- Fluxos criticos (billing/acesso) com hardening multi-tenant aplicado.

### 4.3 SuperAdmin (painel do dono do SaaS)

- Painel em `/superadmin/*`.
- Escopo atual ajustado para MVP operacional de vendas:
  - foco em controle de tenants, contas, financeiro, planos, suporte, cancelamentos, notificacoes e configuracoes.

## 5. Modulos MVP para venda (status)

- Core:
  - sorteio inteligente
  - rankings e estatisticas
  - gestao de partidas
- Monetizacao:
  - financeiro
  - patrocinadores
  - planos e assinatura
- Engagement:
  - notificacoes
  - comunicacao essencial
- Enterprise:
  - multi-tenant
  - multi-admin
  - trilhas de auditoria operacionais

Status operacional atual:

- Publico: aprovado para go-live operacional.
- Admin: aprovado para go-live comercial.
- SuperAdmin: aprovado para MVP operacional.

## 6. Regras criticas multi-tenant e seguranca

- Nunca confiar em `tenantId`, `tenantSlug`, `slug` vindos do client para definir escopo.
- Escopo de tenant deve ser resolvido no backend/proxy seguro.
- Em rotas admin e superadmin, toda acao sensivel exige sessao valida e permissao de role.
- Logs e dados sensiveis devem ser redigidos/sanitizados quando necessario.

## 7. SEO e indexacao (web app)

- `robots.txt` e `sitemap.xml` ativos.
- `sitemap.xml` operando como `sitemapindex`.
- Sitemaps por slug servidos em `/sitemaps/{slug}.xml`.
- Validacao funcional recente concluida para slugs reais.

## 8. SuperAdmin - organizacao atual de pastas

Raiz: `src/app/(superadmin)/superadmin`

Grupos internos (route groups):

- `(core)`
  - `dashboard`
  - `rachas`
  - `admins`
  - `contas`
- `(financeiro)`
  - `financeiro`
  - `planos`
- `(operacoes)`
  - `suporte`
  - `cancelamentos`
  - `notificacoes`
- `(configuracoes)`
  - `config`
- `(legacy)` (fora da navegacao principal)
  - `automacoes`
  - `logs`
  - `marketing`
  - `monitoramento`
  - `integracoes`
  - `metricas/localizacao`
  - `comunicacao/ajuda`
  - `comunicacao/sugestoes`

Observacao:

- `/superadmin` redireciona para `/superadmin/dashboard`.

## 9. Criterio de pronto para producao

Um modulo e considerado pronto quando:

- usa dados reais de backend (sem mock/stub/hardcoded como fonte principal),
- passa em `lint` e `typecheck`,
- tem navegacao funcional sem links quebrados,
- respeita escopo multi-tenant e regras de autorizacao.

## 10. Auditorias oficiais

- Publico: `PUBLIC_AUDIT_REPORT.md`
- Admin: `ADMIN_AUDIT_REPORT.md`
- SuperAdmin: `SUPERADMIN_AUDIT_REPORT.md`

Esses tres documentos sao a referencia final de aceite operacional do app web.
