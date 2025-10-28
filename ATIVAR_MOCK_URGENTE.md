# 🚨 ATIVAÇÃO URGENTE DO MOCK

## ⚠️ Problema Confirmado

Backend indisponível ou certificado inválido enquanto o app está em produção.

## ✅ Solução Imediata (2 minutos)

### 1. Configurar mock no Vercel

1. Acesse https://vercel.com/dashboard
2. Projeto: `fut7pro-web`
3. **Settings** → **Environment Variables**
4. **Add New**
   - **Name**: `NEXT_PUBLIC_USE_JOGOS_MOCK`
   - **Value**: `1`
   - **Environment**: Production e Preview
5. Salve a variável

### 2. Redeploy imediato

1. Abra **Deployments** → **Current**
2. Clique em **Redeploy**

### 3. Testar na hora

```powershell
curl.exe -s https://app.fut7pro.com.br/api/public/jogos-do-dia-mock
```

## 🛠️ Soluções permanentes

### Opção 1: Corrigir certificado SSL na Render

- Render Dashboard → Serviço backend → Settings → Custom Domains
- Validar que `api.fut7pro.com.br` responde com certificado válido
- Forçar novo deploy, se necessário, para renovar o certificado

### Opção 2: Revisar configuração do backend

- Confirmar `BACKEND_URL=https://api.fut7pro.com.br` em todos os ambientes
- Garantir CORS liberando `app.fut7pro.com.br` e domínios de preview
- Executar healthcheck: `curl -I https://api.fut7pro.com.br/health`

### Opção 3: Manter mock temporário (somente dev)

- Utilize `NEXT_PUBLIC_USE_JOGOS_MOCK=1` apenas até o backend estabilizar
- Remova a variável assim que o SSL estiver resolvido

## 📊 Status esperado

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

## 🧪 Teste rápido

```powershell
curl.exe -sI https://app.fut7pro.com.br/api/public/jogos-do-dia-mock | findstr /I "HTTP"
```
