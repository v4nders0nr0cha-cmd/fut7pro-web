# Admin Go-Live Checklist (Comercial)

Data: 2026-02-19  
Escopo: `fut7pro-web` (painel `/admin`) + integrações de billing com `fut7pro-backend`.

## 1) Controles obrigatórios (CI/CD)

- [x] Workflow de smoke admin em PR: `.github/workflows/admin-smoke-ci.yml`
- [x] Branch `main` com proteção ativa exigindo check:
  - `Admin Smoke CI / Admin Smoke Navigation`
- [ ] Confirmar execução verde do smoke em PR real com dados de ambiente de produção.

## 2) Secrets obrigatórios (GitHub - fut7pro-web)

- [ ] `E2E_ADMIN_EMAIL`
- [ ] `E2E_ADMIN_PASSWORD`
- [ ] `E2E_ACTIVE_TENANT_SLUG`
- [ ] `E2E_BLOCKED_TENANT_SLUG`
- [ ] `NEXT_PUBLIC_API_URL`
- [ ] `NEXTAUTH_SECRET`

## 3) Secrets obrigatórios (GitHub/Render - billing monitor)

- [ ] GitHub (`fut7pro-backend`):
  - `BILLING_MONITOR_URL`
  - `BILLING_MONITOR_TOKEN`
  - `SLACK_WEBHOOK_URL` (opcional)
- [ ] Render (`fut7pro-backend`):
  - `BILLING_MONITOR_TOKEN` (mesmo valor do GitHub)
  - `MP_WEBHOOK_SECRET` validado com o painel Mercado Pago

## 4) Evidências mínimas de aceite comercial

- [ ] Cenário multi-racha: usuário com 2 rachas (1 ativo + 1 bloqueado), acesso isolado por tenant.
- [ ] Fluxo bloqueado: `/admin/status-assinatura` exibido corretamente para tenant inadimplente.
- [ ] PIX: geração, QR, cópia de código, link válido e descrição correta por plano/ciclo.
- [ ] Recorrente: checkout abre sem liberar painel antes da confirmação.
- [ ] Desbloqueio: só ocorre após confirmação real (webhook/processamento).
- [ ] Header/admin navegação: sem queda para layout público.

## 5) Critérios finais para “pronto para venda”

- [ ] Zero mock residual no admin.
- [ ] Zero rota quebrada e zero CTA morto no admin.
- [ ] Zero bypass de bloqueio por clique.
- [ ] Zero vazamento cross-tenant.
- [ ] Logs sem dados sensíveis em payload de retorno.
- [ ] Smoke admin obrigatório ativo no fluxo de PR.
- [ ] Runbook de cobrança validado com suporte.

## 6) Links de referência

- Auditoria principal: `ADMIN_AUDIT_REPORT.md`
- Runbook de cobrança (backend): `../fut7pro-backend/docs/BILLING_SUPPORT_RUNBOOK.md`
