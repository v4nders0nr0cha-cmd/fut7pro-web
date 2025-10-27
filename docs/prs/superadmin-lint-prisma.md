# PR Tecnico — SuperAdmin (Lint + Prisma)

## Objetivo

Encerrar os mocks remanescentes, padronizar o uso do Prisma e garantir lint limpo nas areas administrativas.

## Escopo

- Rotas App Router em /api/superadmin/\*.
- Hooks src/hooks/useSuperadmin\*.ts.
- Agregadores em src/server/superadmin/\*.ts.
- Lint focado nas pastas (admin) e (superadmin).

## Checklist

1. **Auditar Prisma**
   `npm run audit:prisma`
   - Se algum arquivo aparecer, substituir as importacoes diretas por import { prisma } from '@/server/prisma';.

2. **Autofix administrativo**
   `    npm run lint:admin
   `
   - Corrige regras basicas e antecipa ajustes para o
     ext lint global (ex.: <img> ->
     ext/image, prefer-const).

3. **Lint geral**
   `npm run lint`
   - Confirma que nao restaram warnings/erros fora das pastas administrativas.

4. **Rotas criticas**
   - Validar respostas vazias em /api/superadmin/metrics, /rachas, /financeiro, /usuarios, /tickets, /notificacoes.

5. **CI/E2E**
   - pm run type-check
   - pm run test:e2e (quando aplicavel)

## Saida esperada

- Nenhuma importacao direta de @prisma/client fora dos pontos permitidos.
- ext lint limpo nas areas (admin) e (superadmin).
- Documentacao de envs e scripts atualizada (ver docs/ENV_SETUP.md).
