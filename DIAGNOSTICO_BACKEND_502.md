# Diagnóstico de 502 no proxy (sem mock)

O fluxo de jogos usa apenas o backend real. Use estes passos para identificar 502/SSL e corrigir rapidamente.

## Passo a passo

1. **Health do backend**
   ```powershell
   curl.exe -sI https://api.fut7pro.com.br/health | findstr /I "HTTP"
   ```
2. **Partidas públicas (rota oficial)**

   ```powershell
   $slug = "fut7pro" # ajuste para o racha em validação
   curl.exe -s "https://app.fut7pro.com.br/api/public/$slug/matches?scope=today"
   ```

   - Esperado: 200 + JSON de partidas.
   - Scopes: `today`, `upcoming`, `recent`.

3. **Se o domínio custom retornar 502/SSL**
   - Temporariamente use `https://fut7pro-backend.onrender.com` em `BACKEND_URL`/`NEXT_PUBLIC_API_URL`.
   - Redeploy no Vercel, depois revalide:
     ```powershell
     curl.exe -X POST https://app.fut7pro.com.br/api/revalidate/public `
       -H "Content-Type: application/json" `
       -d "{""slug"":""$slug"",""token"":""$env:PUBLIC_REVALIDATE_TOKEN""}"
     ```

## O que verificar no backend

- Rota `GET /public/{slug}/matches` operando (200/JSON).
- SSL válido para `api.fut7pro.com.br` ou uso do host de fallback Render.
- CORS liberado para `app.fut7pro.com.br`.

## Observações

- Rota `/api/public/jogos-do-dia-mock` foi removida.
- Não habilitar `NEXT_PUBLIC_USE_JOGOS_MOCK` (flag descontinuada).
- Use o header `x-fallback-source` nas respostas públicas para validar a origem (backend real vs fallback).
