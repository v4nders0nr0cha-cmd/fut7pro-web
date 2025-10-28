# 🚨 ATIVAR MOCK AGORA - Instruções Rápidas

## ⚠️ Problema Atual

Backend com certificado SSL inválido ou indisponível:

```
ERR_TLS_CERT_ALTNAME_INVALID: Host: api.fut7pro.com.br. is not in the cert's altnames: DNS:*.onrender.com
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

## 🛠️ Soluções Permanentes

### Opção 1: Corrigir certificado SSL na Render

- Render Dashboard → Serviço backend → Settings → Custom Domains
- Validar que `api.fut7pro.com.br` esteja ativo com certificado atualizado
- Se necessário, forçar novo deploy para reemitir o certificado

### Opção 2: Revisar variáveis e CORS do backend

- Confirmar `BACKEND_URL=https://api.fut7pro.com.br` nos ambientes (Render e Vercel)
- Garantir origens liberadas: `app.fut7pro.com.br` e domínios de preview da Vercel
- Executar healthcheck: `curl -I https://api.fut7pro.com.br/health`

### Opção 3: Ajustar proxy local (uso temporário)

- Permitir ignorar SSL apenas em desenvolvimento local
- **Não** aplicar essa configuração em produção

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

## 🧪 Teste Rápido

```powershell
# Após configurar o mock
curl.exe -sI https://app.fut7pro.com.br/api/public/jogos-do-dia | findstr /I "HTTP"
# Deve mostrar: HTTP/1.1 200 OK
```
