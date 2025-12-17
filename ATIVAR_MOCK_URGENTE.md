# Plano emergencial sem mock (API real)

O mock de jogos foi removido. Em incidentes, siga os passos abaixo para manter o app operacional usando apenas o backend real.

## Checklist rápido

1. **Health do backend**
   ```powershell
   curl.exe -sI https://api.fut7pro.com.br/health | findstr /I "HTTP"
   ```
2. **Partidas públicas (escopo do dia)**
   ```powershell
   $slug = "fut7pro" # ajuste para o racha em validação
   curl.exe -s "https://app.fut7pro.com.br/api/public/$slug/matches?scope=today"
   ```
3. **Se o domínio custom retornar 502/SSL**
   - Troque temporariamente `BACKEND_URL`/`NEXT_PUBLIC_API_URL` para `https://fut7pro-backend.onrender.com`.
   - Redeploy no Vercel após ajustar as variáveis.
   - Revalide páginas públicas: `POST /api/revalidate/public` com `slug` e `PUBLIC_REVALIDATE_TOKEN`.

## Importante

- Não use `NEXT_PUBLIC_USE_JOGOS_MOCK` (descontinuado).
- Não há rota `/api/public/jogos-do-dia-mock`. Use sempre `/api/public/{slug}/matches` com `scope`.

## Comandos úteis

- Ver fallback ativo (headers de diagnóstico):
  ```powershell
  curl.exe -sI https://app.fut7pro.com.br/api/public/$slug/matches?scope=today | findstr /I "x-fallback-source HTTP"
  ```
- Health do app:
  ```powershell
  curl.exe -sI https://app.fut7pro.com.br/api/health/backend | findstr /I "HTTP"
  ```
