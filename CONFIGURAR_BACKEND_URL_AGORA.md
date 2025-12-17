# ⚠️ CONFIGURAR BACKEND_URL AGORA (rota slugada)

## Problema

`BACKEND_URL` ausente gera 502/500 nas rotas públicas de partidas.

## Passo a passo (2 minutos)

1. **Vercel Dashboard**
   - Projeto: `fut7pro-web`
   - Settings → Environment Variables → Add New
     - Name: `BACKEND_URL`
     - Value: `https://api.fut7pro.com.br`
     - Environment: Production (e Preview, se desejar)

2. **Redeploy**
   - Deployments → Current → Redeploy

3. **Testar rota pública (slug do racha)**
   ```powershell
   curl.exe -sI https://app.fut7pro.com.br/api/public/fut7pro/matches?scope=today | findstr /I "HTTP Cache-Control"
   ```

## Se ainda falhar

- Confirme a variável em Settings (valor correto).
- Teste o backend direto:
  ```powershell
  curl.exe -sI https://api.fut7pro.com.br/public/fut7pro/matches?scope=today
  ```
- Verifique logs em Functions (Vercel).

## Resultado esperado

```
HTTP/1.1 200 OK
Cache-Control: s-maxage=60, stale-while-revalidate=300
Content-Type: application/json
```

Corpo (exemplo):

```json
[
  {
    "id": "...",
    "timeA": "...",
    "timeB": "...",
    "golsTimeA": 0,
    "golsTimeB": 0,
    "finalizada": false
  }
]
```

## Teste rápido

```powershell
curl.exe -sI https://app.fut7pro.com.br/api/public/fut7pro/matches?scope=today | findstr /I "HTTP x-fallback-source"
```

Esperado: `HTTP/1.1 200 OK` e `x-fallback-source: backend`.
