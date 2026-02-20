# Admin Go-Live Checklist (Comercial)

Data: 2026-02-20  
Escopo: `fut7pro-web` (painel `/admin`) + integrações de billing com `fut7pro-backend`.

## 1) Controles obrigatórios (CI/CD)

- [x] Workflow de smoke admin em PR: `.github/workflows/admin-smoke-ci.yml`
- [x] Branch `main` com proteção ativa exigindo check:
  - `Admin Smoke CI / Admin Smoke Navigation`
- [x] Confirmar execução verde do smoke em PR real com dados de ambiente de produção.

## 2) Secrets obrigatórios (GitHub - fut7pro-web)

- [x] `E2E_ADMIN_EMAIL`
- [x] `E2E_ADMIN_PASSWORD`
- [x] `E2E_ACTIVE_TENANT_SLUG`
- [x] `E2E_BLOCKED_TENANT_SLUG`
- [x] `NEXT_PUBLIC_API_URL`
- [x] `NEXTAUTH_SECRET`

## 3) Secrets obrigatórios (GitHub/Render - billing monitor)

- [x] GitHub (`fut7pro-backend`):
  - `BILLING_MONITOR_URL`
  - `BILLING_MONITOR_TOKEN`
  - `SLACK_WEBHOOK_URL` (opcional, pode ficar pendente)
- [x] Render (`fut7pro-backend`):
  - `BILLING_MONITOR_TOKEN` (mesmo valor do GitHub)
  - `MP_WEBHOOK_SECRET` validado com o painel Mercado Pago

## 4) Evidências mínimas de aceite comercial

- [x] Cenário multi-racha: usuário com 2 rachas (1 ativo + 1 bloqueado), acesso isolado por tenant.
- [x] Fluxo bloqueado: `/admin/status-assinatura` exibido corretamente para tenant inadimplente.
- [x] PIX: geração, QR, cópia de código, link válido e descrição correta por plano/ciclo.
- [x] Recorrente: checkout abre sem liberar painel antes da confirmação.
- [x] Desbloqueio: só ocorre após confirmação real (webhook/processamento).
- [x] Header/admin navegação: sem queda para layout público.

## 5) Critérios finais para “pronto para venda”

- [x] Zero mock residual no admin.
- [x] Zero rota quebrada e zero CTA morto no admin.
- [x] Zero bypass de bloqueio por clique.
- [x] Zero vazamento cross-tenant.
- [x] Logs sem dados sensíveis em payload de retorno.
- [x] Smoke admin obrigatório ativo no fluxo de PR.
- [x] Runbook de cobrança validado tecnicamente para operação.

## 6) Links de referência

- Auditoria principal: `ADMIN_AUDIT_REPORT.md`
- Runbook de cobrança (backend): `../fut7pro-backend/docs/BILLING_SUPPORT_RUNBOOK.md`

## Status Final do Escopo Admin

- **Concluído em 2026-02-20** para aceite técnico e go-live comercial do painel `/admin`.
- Próxima fase recomendada: auditoria completa do site público (rotas slugadas, SEO, autenticação atleta e fluxos de comunicação).
