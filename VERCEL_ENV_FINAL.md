# Configuração Final Vercel (sem mock de jogos)

## Variáveis obrigatórias (prod)

| Nome                         | Valor exemplo                          | Observação                            |
| ---------------------------- | -------------------------------------- | ------------------------------------- |
| `BACKEND_URL`                | `https://api.fut7pro.com.br`           | Host oficial (SNI/SSL correto)        |
| `NEXT_PUBLIC_API_URL`        | `https://api.fut7pro.com.br`           | Mesma origem do backend               |
| `NEXT_PUBLIC_APP_URL`        | `https://app.fut7pro.com.br`           | Canonical usado nas rotas server-side |
| `APP_URL`                    | `https://app.fut7pro.com.br`           | Base para helper de revalidate        |
| `PUBLIC_REVALIDATE_TOKEN`    | `defina-um-token-forte`                | Protege `/api/revalidate/public`      |
| `RAILWAY_BACKEND_URL`        | `https://fut7pro-backend.onrender.com` | Fallback de infraestrutura (Render)   |
| `NEXT_PUBLIC_USE_JOGOS_MOCK` | `removido`                             | Flag descontinuada; não usar          |

> Fallback de mock foi removido. Todas as páginas usam os endpoints reais multi-tenant.

## Verificações rápidas (produção)

1. **SSL/backend**
   ```powershell
   curl.exe -sIv https://api.fut7pro.com.br | findstr /I "HTTP"
   ```
2. **Health backend**
   ```powershell
   curl.exe -sI https://api.fut7pro.com.br/health | findstr /I "HTTP"
   ```
3. **Partidas públicas (slug do racha)**

   ```powershell
   $slug = "fut7pro" # ajuste para o racha
   curl.exe -s "https://app.fut7pro.com.br/api/public/$slug/matches?scope=today"
   ```

   - Scopes: `today`, `upcoming`, `recent`
   - Header `x-fallback-source` deve apontar para `backend` (não há trilha de mock).

## Fallback de infraestrutura

- Se `api.fut7pro.com.br` falhar (502/SSL), aponte `BACKEND_URL`/`NEXT_PUBLIC_API_URL` para `https://fut7pro-backend.onrender.com` e redeploy.
- Após o ajuste, dispare revalidate:
  ```powershell
  curl.exe -X POST https://app.fut7pro.com.br/api/revalidate/public `
    -H "Content-Type: application/json" `
    -d "{""slug"":""$slug"",""token"":""$env:PUBLIC_REVALIDATE_TOKEN""}"
  ```

## Checklist de aceite

- [ ] SSL do backend válido (sem `WRONG_PRINCIPAL`)
- [ ] `GET /health` retorna 200
- [ ] `GET /api/public/{slug}/matches?scope=today` retorna 200 + JSON
- [ ] `x-fallback-source = backend` nas respostas públicas
- [ ] `NEXT_PUBLIC_USE_JOGOS_MOCK` ausente/desativado

## Testes recomendados

```powershell
.\scripts\test-jogos.ps1
```

Ou manualmente via `curl` conforme seções acima.
