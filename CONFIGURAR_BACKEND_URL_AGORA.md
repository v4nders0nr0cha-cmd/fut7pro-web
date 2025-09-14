# 🚨 CONFIGURAR BACKEND_URL AGORA

## ❌ Problema Atual

```
HTTP/1.1 502 Bad Gateway
{"error":"Fetch failed"}
```

## ✅ Solução Rápida (2 minutos)

### 1. Acesse Vercel Dashboard

- URL: https://vercel.com/dashboard
- Projeto: `fut7pro-web`

### 2. Adicionar Environment Variable

- **Settings** → **Environment Variables**
- **Add New**:
  - **Name**: `BACKEND_URL`
  - **Value**: `https://api.fut7pro.com.br`
  - **Environment**: ✅ Production ✅ Preview

### 3. Redeploy

- **Deployments** → **Current**
- Clique em **Redeploy** (ou aguarde próximo push)

### 4. Testar

```powershell
# Deve retornar 200 + Cache-Control
curl.exe -sI https://app.fut7pro.com.br/api/public/jogos-do-dia | findstr /I "HTTP Cache-Control"
```

## 🔧 Se Ainda Der Erro

### Verificar se BACKEND_URL está definida:

1. **Settings** → **Environment Variables**
2. Deve aparecer: `BACKEND_URL = https://api.fut7pro.com.br`

### Verificar se backend está respondendo:

```powershell
# Testar backend diretamente
curl.exe -sI https://api.fut7pro.com.br/partidas/jogos-do-dia
```

### Verificar logs:

1. **Functions** → **View Function Logs**
2. Procurar por erros de `BACKEND_URL`

## 📊 Resultado Esperado

### HEAD Request:

```
HTTP/1.1 200 OK
Cache-Control: s-maxage=60, stale-while-revalidate=300
Content-Type: application/json
```

### GET Request:

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

## ⚡ Teste Rápido

```powershell
# Execute este comando após configurar
curl.exe -sI https://app.fut7pro.com.br/api/public/jogos-do-dia | findstr /I "HTTP"
# Deve mostrar: HTTP/1.1 200 OK
```
