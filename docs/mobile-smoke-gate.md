# Mobile Smoke Gate (CI/CD)

Este gate bloqueia regressao mobile em PRs com tres validacoes obrigatorias:

1. `tests/mobile/mobile-device-projects.spec.ts`
2. `tests/mobile/mobile-smoke-gate.spec.ts`
3. Upload de artefatos (`tmp-artifacts/mobile-smoke`, `playwright-report`, `test-results`)

## Escopo do gate

- Projetos Playwright obrigatorios:
  - `mobile-iphone` (`iPhone 13`)
  - `mobile-pixel` (`Pixel 7`)
- Matriz obrigatoria de viewport (14):
  - Portrait: `320x640`, `360x740`, `375x812`, `390x844`, `412x915`, `480x800`, `768x1024`
  - Landscape: `640x320`, `740x360`, `812x375`, `844x390`, `915x412`, `800x480`, `1024x768`
- Rotas monitoradas por padrao:
  - `/`
  - `/partidas`
  - `/estatisticas/ranking-geral`
  - `/admin/login`
  - `/superadmin/login`

## Regras de bloqueio

- `HTTP >= 400` em qualquer rota -> falha.
- Overflow horizontal acidental em qualquer viewport -> falha.
- Elementos de toque interativos com largura e altura menores que `44px` -> falha.

## Execucao local

```bash
PLAYWRIGHT_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 pnpm run test:e2e:mobile-gate
```

Opcional: customizar rotas no gate.

```bash
MOBILE_SMOKE_ROUTES='/,/partidas,/admin/login' PLAYWRIGHT_WEB_SERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 pnpm run test:e2e:mobile-gate
```

## CI

- Workflow: `.github/workflows/mobile-smoke-ci.yml`
- Job: `Mobile Smoke Gate`

Branch protection deve exigir o check `Mobile Smoke Gate` em PR para `main`.
