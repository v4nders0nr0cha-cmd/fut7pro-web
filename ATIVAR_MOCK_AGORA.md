# ⚠️ MOCK DESATIVADO — use a API real de partidas

> O endpoint `GET /api/public/jogos-do-dia-mock` e a flag `NEXT_PUBLIC_USE_JOGOS_MOCK` foram removidos. Todo o fluxo deve usar a API real multi-tenant.

## Como testar rapidamente (2 minutos)

1. **Health do backend**
   ```powershell
   curl.exe -sI https://api.fut7pro.com.br/health | findstr /I "HTTP"
   ```
2. **Partidas públicas do racha (dados reais)**  
   Substitua `{slug}` pelo racha que está validando.
   ```powershell
   curl.exe -s "https://app.fut7pro.com.br/api/public/{slug}/matches?scope=today"
   ```

   - `scope=today` | `upcoming` | `recent`
   - Esperado: HTTP 200 com lista de partidas (sem cache agressivo).
3. **Se o backend principal estiver fora do ar**
   - Use o host de contingência já configurado no Render: `https://fut7pro-backend.onrender.com`
   - Garanta que `NEXT_PUBLIC_API_URL` e `BACKEND_URL` apontem para o host válido antes de redeploy.

## O que NÃO fazer

- Não adicionar `NEXT_PUBLIC_USE_JOGOS_MOCK`.
- Não tentar acessar `/api/public/jogos-do-dia-mock` (rota removida).

## Diagnóstico rápido

- Verifique o header `x-fallback-source` nas rotas públicas para confirmar se está vindo do backend real.
- Se receber 502/SSL, ajuste o host para o fallback do Render e redeploy.
- Mantenha `PUBLIC_REVALIDATE_TOKEN` configurado para invalidar as páginas públicas do racha após publicar partidas/times.
