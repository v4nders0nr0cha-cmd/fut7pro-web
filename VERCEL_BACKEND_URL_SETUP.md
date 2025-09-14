# Configuração BACKEND_URL no Vercel

## ❌ Problema Atual

O endpoint `/api/public/jogos-do-dia` está retornando 500 porque `BACKEND_URL` não está configurado.

## ✅ Solução

### 1. Configurar Environment Variable no Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione o projeto `fut7pro-web`
3. Vá em **Settings** → **Environment Variables**
4. Adicione nova variável:
   - **Name**: `BACKEND_URL`
   - **Value**: `https://api.fut7pro.com.br`
   - **Environment**: Production (e Preview se quiser)

### 2. Redeploy

Após adicionar a variável:

1. Vá em **Deployments**
2. Clique no deployment atual
3. Clique em **Redeploy** (ou aguarde o próximo push)

### 3. Testar

```bash
# HEAD request (deve retornar 200)
curl -sI https://app.fut7pro.com.br/api/public/jogos-do-dia

# GET request (deve retornar dados)
curl -s https://app.fut7pro.com.br/api/public/jogos-do-dia
```

### 4. Verificar Cache

```bash
# Verificar headers de cache
curl -sI https://app.fut7pro.com.br/api/public/jogos-do-dia | findstr /I "Cache-Control"
# Deve mostrar: Cache-Control: s-maxage=60, stale-while-revalidate=300
```

## 🔧 Troubleshooting

### Se ainda der 500:

1. Verifique se `BACKEND_URL` está definida em Production
2. Confirme que o valor está correto: `https://api.fut7pro.com.br`
3. Faça redeploy após adicionar a variável
4. Verifique logs em Vercel Functions

### Se der erro de CORS:

- O proxy server-side resolve isso automaticamente
- Backend não precisa de CORS para este endpoint

### Se der timeout:

- Verifique se o backend está respondendo
- Teste diretamente: `curl https://api.fut7pro.com.br/partidas/jogos-do-dia`

## 📊 Monitoramento

### Headers esperados:

```
HTTP/1.1 200 OK
Cache-Control: s-maxage=60, stale-while-revalidate=300
Content-Type: application/json
```

### Resposta esperada:

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
