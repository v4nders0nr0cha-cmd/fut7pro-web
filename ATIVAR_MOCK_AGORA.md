# 🚨 ATIVAR MOCK AGORA - Instruções Rápidas

## ❌ Problema Atual

Backend com certificado SSL inválido:

```
ERR_TLS_CERT_ALTNAME_INVALID: Host: api.fut7pro.com.br. is not in the cert's altnames: DNS:*.up.railway.app
```

## ✅ Solução Imediata (2 minutos)

### 1. Configurar Mock no Vercel

- Acesse: https://vercel.com/dashboard
- Projeto: `fut7pro-web`
- **Settings** → **Environment Variables**
- **Add New**:
  - **Name**: `NEXT_PUBLIC_USE_JOGOS_MOCK`
  - **Value**: `1`
  - **Environment**: ✅ Production ✅ Preview

### 2. Redeploy

- **Deployments** → **Current**
- Clique em **Redeploy**

### 3. Testar

```powershell
# Deve retornar dados mock
curl.exe -s https://app.fut7pro.com.br/api/public/jogos-do-dia-mock
```

## 🔧 Soluções Permanentes

### Opção 1: Corrigir Certificado SSL

- Railway Dashboard → Projeto → Settings → Domains
- Adicionar `api.fut7pro.com.br` ao certificado
- Ou usar domínio Railway: `fut7pro-backend.up.railway.app`

### Opção 2: Usar Domínio Railway

- Alterar `BACKEND_URL` para: `https://fut7pro-backend.up.railway.app`
- Configurar CORS no backend para aceitar `app.fut7pro.com.br`

### Opção 3: Configurar Proxy com SSL Ignorado

- Modificar proxy para ignorar certificado SSL (não recomendado para produção)

## 📊 Status Esperado com Mock

```json
// GET /api/public/jogos-do-dia (com mock ativo)
[
  {
    "id": "1",
    "timeA": "Time A",
    "timeB": "Time B",
    "golsTimeA": 2,
    "golsTimeB": 1,
    "finalizada": true
  },
  {
    "id": "2",
    "timeA": "Time C",
    "timeB": "Time D",
    "golsTimeA": 0,
    "golsTimeB": 0,
    "finalizada": false
  }
]
```

## ⚡ Teste Rápido

```powershell
# Após configurar mock
curl.exe -sI https://app.fut7pro.com.br/api/public/jogos-do-dia | findstr /I "HTTP"
# Deve mostrar: HTTP/1.1 200 OK
```
