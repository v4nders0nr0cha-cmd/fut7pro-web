# Fut7Pro — Secrets Matrix
Data: 2025-08-23

## Objetivo
Catalogar todas as variáveis de ambiente, nomes-padrão de secrets e mapeamento por provedor para fut7pro-web, fut7pro-backend e fut7pro-site, em DEV, STG e PROD. O agente deve usar estes nomes exatamente.

## Convenções
- **Prefixos por ambiente no GitHub**: DEV_, STG_, PROD_.
- **Em Vercel usar grupos por ambiente nativos**. Em Render ou Railway usar ambientes separados.
- **Nunca expor valores em logs**. Seguir MANUAL_PADRONIZACAO.md e CHECKLIST_FUT7PRO.md.

## Domínios recomendados
- **Web público**: https://www.fut7pro.com.br
- **API**: https://api.fut7pro.com.br
- **Site institucional**: https://site.fut7pro.com.br
- **Painéis whitelabel ficam sob o web**. Slugs sempre vindos do racha.config.ts.

---

## 1) Matriz por repositório

### 1.1 fut7pro-web - Next.js público

#### Obrigatórias
- `NEXT_PUBLIC_API_URL` - URL da API
- `NEXTAUTH_URL` - URL do site público
- `NEXTAUTH_SECRET` - secret forte

#### Opcionais
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SENTRY_DSN`
- `GA_MEASUREMENT_ID` - GA4
- `GTM_ID` - se usar GTM

### 1.2 fut7pro-backend - NestJS + Prisma

#### Obrigatórias
- `DATABASE_URL` - Postgres Neon com sslmode=require e channel_binding=require
- `JWT_SECRET`
- `CORS_ORIGIN` - lista de origens separadas por vírgula
- `NODE_ENV` - production em PROD

#### Opcionais
- `LOG_LEVEL` - info
- `SENTRY_DSN`
- `STORAGE_PROVIDER` - s3 opcional
- `S3_ACCESS_KEY`, `S3_SECRET`, `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT` - se STORAGE_PROVIDER=s3

#### Pagamentos
- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_PUBLIC_KEY`
ou
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

#### E-mails
- `SENDGRID_API_KEY`
ou
- `SES_ACCESS_KEY`
- `SES_SECRET_KEY`
- `SES_REGION`

#### OAuth Google para endpoints server-to-server quando aplicável
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` - https://www.fut7pro.com.br/api/auth/callback/google

### 1.3 fut7pro-site - Next.js institucional

#### Obrigatórias
- `SITE_URL` - URL do site institucional

#### Opcionais
- `NEXT_PUBLIC_API_URL`
- `SENTRY_DSN`
- `GA_MEASUREMENT_ID` ou `GTM_ID`

---

## 2) Nomes padronizados no GitHub Secrets

### Ambiente DEV
```
WEB_DEV_NEXT_PUBLIC_API_URL
WEB_DEV_NEXTAUTH_URL
WEB_DEV_NEXTAUTH_SECRET
WEB_DEV_GOOGLE_CLIENT_ID
WEB_DEV_GOOGLE_CLIENT_SECRET

BACKEND_DEV_DATABASE_URL
BACKEND_DEV_JWT_SECRET
BACKEND_DEV_CORS_ORIGIN
BACKEND_DEV_LOG_LEVEL
BACKEND_DEV_MERCADOPAGO_ACCESS_TOKEN
BACKEND_DEV_MERCADOPAGO_PUBLIC_KEY
BACKEND_DEV_STRIPE_SECRET_KEY
BACKEND_DEV_STRIPE_PUBLISHABLE_KEY
BACKEND_DEV_STRIPE_WEBHOOK_SECRET
BACKEND_DEV_SENDGRID_API_KEY
BACKEND_DEV_SES_ACCESS_KEY
BACKEND_DEV_SES_SECRET_KEY
BACKEND_DEV_SES_REGION

SITE_DEV_SITE_URL
SITE_DEV_NEXT_PUBLIC_API_URL
```

**Replicar com prefixos STG_ e PROD_ trocando DEV_ por STG_ e PROD_.**

---

## 3) Vercel - variáveis por projeto

### Projeto fut7pro-web
```
NEXT_PUBLIC_API_URL
NEXTAUTH_URL
NEXTAUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
SENTRY_DSN
GA_MEASUREMENT_ID ou GTM_ID
```

### Projeto fut7pro-site
```
SITE_URL
NEXT_PUBLIC_API_URL
SENTRY_DSN
GA_MEASUREMENT_ID ou GTM_ID
```

---

## 4) Render ou Railway - backend

### Render
- **SERVICE env**: DATABASE_URL, JWT_SECRET, CORS_ORIGIN, LOG_LEVEL, MERCADOPAGO_* ou STRIPE_*, SENDGRID_API_KEY ou SES_*, SENTRY_DSN, STORAGE_PROVIDER e S3_* se usado.
- **Healthcheck**: /health

### Railway
- **Variables iguais**. Definir service healthcheck e deploy via GitHub.

---

## 5) Neon Postgres

### Criar projeto Neon
- **Database**: neondb
- **Role**: neondb_owner
- **Connection string com pooler habilitado**
- **Exigir sslmode=require e channel_binding=require**

### DATABASE_URL exemplo:
```
postgresql://neondb_owner:SEU_TOKEN@ep-xxxxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

---

## 6) Cloudflare DNS e TLS

- **Apontar A ou CNAME para Vercel** em web e site.
- **Apontar api subdomínio para Render ou Railway**.
- **Habilitar Always Use HTTPS e TLS mínimo 1.2**.
- **Se usar proxied, ajustar CORS e cabeçalhos no backend**.

---

## 7) Mercado Pago e Stripe

### Mercado Pago
- `MERCADOPAGO_ACCESS_TOKEN` - produção
- `MERCADOPAGO_PUBLIC_KEY`
- **Webhook backend**: https://api.fut7pro.com.br/webhooks/payment

### Stripe
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- **Webhook backend**: https://api.fut7pro.com.br/webhooks/stripe

---

## 8) E-mail

### SendGrid
- `SENDGRID_API_KEY`
- **Remetente autenticado**

### AWS SES
- `SES_ACCESS_KEY`
- `SES_SECRET_KEY`
- `SES_REGION`
- **Domínio verificado no SES**

---

## 9) Monitoramento e rastreio

### Sentry
- `SENTRY_DSN` por app

### LogRocket
- `LOGROCKET_APP_ID` no web e site se optar

### Analytics
- `GA_MEASUREMENT_ID` ou `GTM_ID` por app

---

## 10) Exemplos .env.example por repo

### fut7pro-web/.env.example
```
NEXT_PUBLIC_API_URL=https://api.fut7pro.com.br
NEXTAUTH_URL=https://www.fut7pro.com.br
NEXTAUTH_SECRET=change-me
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SENTRY_DSN=
GA_MEASUREMENT_ID=
```

### fut7pro-backend/.env.example
```
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:token@host/neondb?sslmode=require&channel_binding=require
JWT_SECRET=change-me
CORS_ORIGIN=https://www.fut7pro.com.br,https://site.fut7pro.com.br
LOG_LEVEL=info
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
SENDGRID_API_KEY=
SES_ACCESS_KEY=
SES_SECRET_KEY=
SES_REGION=
SENTRY_DSN=
STORAGE_PROVIDER=
S3_ACCESS_KEY=
S3_SECRET=
S3_BUCKET=
S3_REGION=
S3_ENDPOINT=
```

### fut7pro-site/.env.example
```
SITE_URL=https://site.fut7pro.com.br
NEXT_PUBLIC_API_URL=https://api.fut7pro.com.br
SENTRY_DSN=
GA_MEASUREMENT_ID=
```

---

## 11) JSON de validação para CI

### scripts/ci/env-matrix.json
```
{
  "web": {
    "required": ["NEXT_PUBLIC_API_URL", "NEXTAUTH_URL", "NEXTAUTH_SECRET"],
    "optional": ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "SENTRY_DSN", "GA_MEASUREMENT_ID", "GTM_ID"]
  },
  "backend": {
    "required": ["DATABASE_URL", "JWT_SECRET", "CORS_ORIGIN"],
    "optional": ["LOG_LEVEL", "SENTRY_DSN", "MERCADOPAGO_ACCESS_TOKEN", "MERCADOPAGO_PUBLIC_KEY", "STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY", "STRIPE_WEBHOOK_SECRET", "SENDGRID_API_KEY", "SES_ACCESS_KEY", "SES_SECRET_KEY", "SES_REGION", "STORAGE_PROVIDER", "S3_ACCESS_KEY", "S3_SECRET", "S3_BUCKET", "S3_REGION", "S3_ENDPOINT"]
  },
  "site": {
    "required": ["SITE_URL"],
    "optional": ["NEXT_PUBLIC_API_URL", "SENTRY_DSN", "GA_MEASUREMENT_ID", "GTM_ID"]
  }
}
```

---

## 12) Script de validação em CI

### scripts/ci/validate-env.mjs
```
import fs from "node:fs";

const matrix = JSON.parse(fs.readFileSync("scripts/ci/env-matrix.json", "utf8"));

function check(group, required) {
  const missing = [];
  for (const v of required) {
    if (!process.env[v] || String(process.env[v]).trim() === "") missing.push(v);
  }
  if (missing.length) {
    console.error(`[ENV][${group}] faltando: ${missing.join(", ")}`);
    process.exitCode = 1;
  } else {
    console.log(`[ENV][${group}] OK`);
  }
}

const repo = process.env.ENV_GROUP; // "web", "backend" ou "site"
if (!repo || !matrix[repo]) {
  console.error("Defina ENV_GROUP como web, backend ou site");
  process.exit(1);
}
check(repo, matrix[repo].required);
```

**No YAML do CI, definir ENV_GROUP conforme o repositório antes de rodar o script.**

---

## Mapeamento rápido por provedor

### GitHub Secrets
- **Usar prefixos DEV_, STG_, PROD_** e consumir nos workflows via environments.

### Vercel
- **Criar Project para web e site**, colar variáveis por ambiente. **Produção publica em main**.

### Render ou Railway
- **Criar Service para backend**, setar variables e healthcheck. **Deploy por tag ou main conforme política**.

### Neon
- **Criar database, aplicar migrações via pipeline**. **Não rodar reset em PROD**.

### Cloudflare
- **Ativar proxy para web e site**. **API pode ser proxied ou direto**. **Ajustar CORS no backend**.

---

## 🎯 **RESUMO EXECUTIVO**

Esta matriz fornece **todos os secrets necessários** para colocar o Fut7Pro em produção:

1. **Variáveis obrigatórias** por repositório
2. **Nomes padronizados** no GitHub Secrets
3. **Configurações por provedor** (Vercel, Render, Railway, Neon)
4. **Scripts de validação** para CI
5. **Exemplos de .env.example** atualizados

**O agente deve usar estes nomes exatamente** para garantir consistência entre ambientes e repositórios.

---

## 🚀 **PRÓXIMOS PASSOS**

1. **Configurar GitHub Secrets** com prefixos DEV_, STG_, PROD_
2. **Criar projetos Vercel** para web e site
3. **Configurar Render/Railway** para backend
4. **Criar banco Neon** com SSL obrigatório
5. **Configurar Cloudflare DNS** e TLS
6. **Validar variáveis** via CI scripts

**O Fut7Pro está pronto para produção!** 🎉⚽
