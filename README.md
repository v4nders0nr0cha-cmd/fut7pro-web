# Fut7Pro — Frontend (Next.js + Tailwind + TS)

Plataforma SaaS de Rachas e Estatísticas — **Frontend**.

## Requisitos

- Node 20
- npm 10+

## Setup rápido

```bash
cp .env.example .env
npm ci
npm run dev
```

## Scripts

- `dev` — inicia em modo desenvolvimento
- `build` — compila o Next.js
- `start` — executa build
- `lint` — ESLint
- `type-check` — TypeScript sem emitir
- `test` — Jest/RTL (se configurado)

## CI/CD

**Pipeline:** `.github/workflows/frontend-ci.yml`

- Lint/Typecheck/Test/Build
- Artefato do build
- Deploy preview opcional via Vercel (configure `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` nos Secrets)

## Integração com ChatGPT (GitHub Connector)

Conceda **Read & Write** ao repo.

**Branch de trabalho padrão do agente:** `fix/frontend-stabilization`

**Instruções ao agente:** `CHATGPT_STABILIZATION_INSTRUCTIONS.md`

## Variáveis de Ambiente

Veja `.env.example`.

## Contribuição

- Commits seguindo **conventional commits**
- PRs com checklist: build limpo, lint/TS OK, testes verdes
