# Configuração BACKEND_URL no Vercel (rotas slugadas)

## Problema

As rotas públicas `/api/public/{slug}/matches?scope=*` retornam 500 quando `BACKEND_URL` não está configurado.

## Solução

1. **Configurar Environment Variable no Vercel**
   - Dashboard → Projeto `fut7pro-web`
   - Settings → Environment Variables
   - Add:
     - Name: `BACKEND_URL`
     - Value: `https://api.fut7pro.com.br`
     - Environment: Production (e Preview se quiser)

2. **Redeploy**
   - Deployments → Current → Redeploy (ou aguarde próximo push)

3. **Testar**

   ```bash
   # HEAD request (deve retornar 200)
   curl -sI "https://app.fut7pro.com.br/api/public/fut7pro/matches?scope=today"

   # GET request (deve retornar dados)
   curl -s "https://app.fut7pro.com.br/api/public/fut7pro/matches?scope=upcoming"
   ```

4. **Verificar Cache**
   ```bash
   curl -sI "https://app.fut7pro.com.br/api/public/fut7pro/matches?scope=today" | findstr /I "Cache-Control"
   # Esperado: Cache-Control: s-maxage=60, stale-while-revalidate=300
   ```

## Troubleshooting

- Verifique `BACKEND_URL` em Production.
- Valor deve ser `https://api.fut7pro.com.br`.
- Redeploy após ajustes.
- Logs em Vercel Functions se persistir 500.
- Se backend cair, use host de contingência (`https://fut7pro-backend.onrender.com`) em BACKEND_URL/NEXT_PUBLIC_API_URL e redeploy.
- Testar direto o backend:  
  `curl https://api.fut7pro.com.br/public/fut7pro/matches?scope=today`
