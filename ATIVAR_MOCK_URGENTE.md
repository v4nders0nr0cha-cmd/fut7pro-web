# 🚨 ATIVAÇÃO URGENTE DO MOCK

## ❌ Problema Confirmado

```
ERR_TLS_CERT_ALTNAME_INVALID: Host: api.fut7pro.com.br. is not in the cert's altnames: DNS:*.up.railway.app
```

## ✅ SOLUÇÃO IMEDIATA (2 minutos)

### 1. Configurar Mock no Vercel

1. Acesse: https://vercel.com/dashboard
2. Projeto: `fut7pro-web`
3. **Settings** → **Environment Variables**
4. **Add New**:
   - **Name**: `NEXT_PUBLIC_USE_JOGOS_MOCK`
   - **Value**: `1`
   - **Environment**: ✅ Production ✅ Preview
5. **Save**

### 2. Redeploy

1. **Deployments** → **Current**
2. Clique em **Redeploy**

### 3. Testar Imediatamente

```powershell
# Deve retornar dados mock
curl.exe -s https://app.fut7pro.com.br/api/public/jogos-do-dia-mock
```

## 🔧 Soluções Permanentes

### Opção 1: Usar Domínio Railway

- Alterar `BACKEND_URL` para: `https://fut7pro-backend.up.railway.app`
- Configurar CORS no backend

### Opção 2: Corrigir Certificado SSL

- Railway Dashboard → Projeto → Settings → Domains
- Adicionar `api.fut7pro.com.br` ao certificado

### Opção 3: Usar Endpoint SSL Fix

- Usar `/api/public/jogos-do-dia-ssl-fix` (já implementado)

## 📊 Status Esperado

```json
// GET /api/public/jogos-do-dia-mock
[
  {
    "id": "1",
    "timeA": "Time A",
    "timeB": "Time B",
    "golsTimeA": 2,
    "golsTimeB": 1,
    "finalizada": true
  }
]
```

## ⚡ Teste Rápido

```powershell
# Após configurar mock
curl.exe -sI https://app.fut7pro.com.br/api/public/jogos-do-dia-mock | findstr /I "HTTP"
# Deve mostrar: HTTP/1.1 200 OK
```
