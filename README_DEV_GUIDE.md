# Guia Rápido - fut7pro-web

## API de Produção

- `NEXT_PUBLIC_API_URL=https://api.fut7pro.com.br`
- `BACKEND_URL=https://api.fut7pro.com.br`
- Swagger: https://api.fut7pro.com.br/api/docs

## Smoke local

1. Garanta `NEXT_PUBLIC_API_URL` carregada no terminal.
2. Execute `pwsh scripts/smoke-web.ps1`.
3. Esperado: `/health`, `/health/readiness` e `/public/demo-rachao/teams` com HTTP 200.
