# 🔧 Configuração Final - Vercel Environment Variables

## ✅ Variáveis Obrigatórias (já configuradas)

```bash
BACKEND_URL=https://api.fut7pro.com.br
NEXT_PUBLIC_API_URL=https://api.fut7pro.com.br
NEXTAUTH_URL=https://app.fut7pro.com.br
NEXTAUTH_SECRET=your-secret-here
AUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
NODE_ENV=production
```

## 🆕 Variáveis Novas (adicionar)

### JOGOS_DIA_PATH (opcional)

```bash
# Caminho do endpoint no backend (ajuste quando souber o correto)
JOGOS_DIA_PATH=/partidas/jogos-do-dia
# ou
JOGOS_DIA_PATH=/api/partidas/jogos-do-dia
# ou
JOGOS_DIA_PATH=/v1/public/jogos-do-dia
```

### NEXT_PUBLIC_USE_JOGOS_MOCK (opcional)

```bash
# Usar mock temporário até backend estar pronto
NEXT_PUBLIC_USE_JOGOS_MOCK=1
```

## 🧪 Testes de Validação

### 1. Healthcheck do Backend

```bash
# Verificar se backend está respondendo
curl.exe -s https://app.fut7pro.com.br/api/health/backend
```

### 2. Mock (sempre funciona)

```bash
# Testar mock
curl.exe -sI https://app.fut7pro.com.br/api/public/jogos-do-dia-mock | findstr /I "HTTP Cache-Control"
```

### 3. Proxy (funciona quando backend estiver correto)

```bash
# Testar proxy
curl.exe -sI https://app.fut7pro.com.br/api/public/jogos-do-dia | findstr /I "HTTP"
```

### 4. Headers SEO

```bash
# Home sem X-Robots-Tag
curl.exe -sI https://app.fut7pro.com.br | findstr /I "X-Robots-Tag"

# Admin com X-Robots-Tag
curl.exe -sI https://app.fut7pro.com.br/admin/login | findstr /I "X-Robots-Tag"
```

## 🔍 Descobrir Caminho Correto do Backend

### Opção 1: Testar Endpoints Comuns

```bash
curl.exe -k -I https://api.fut7pro.com.br/health
curl.exe -k -I https://api.fut7pro.com.br/status
curl.exe -k -I https://api.fut7pro.com.br/api/health
curl.exe -k -I https://api.fut7pro.com.br/
```

### Opção 2: Verificar Documentação

- Swagger/OpenAPI do backend
- README do projeto backend
- Logs do Railway

### Opção 3: Usar Healthcheck

```bash
# O healthcheck testa automaticamente vários endpoints
curl.exe -s https://app.fut7pro.com.br/api/health/backend
```

## 🚀 Fluxo de Deploy

### 1. Configurar Variáveis

- Adicionar `JOGOS_DIA_PATH` no Vercel
- (Opcional) Adicionar `NEXT_PUBLIC_USE_JOGOS_MOCK=1`

### 2. Redeploy

- Deploy automático após push
- Ou redeploy manual no Vercel

### 3. Validar

- Executar testes de validação
- Verificar logs do Vercel Functions

### 4. Remover Mock (quando backend estiver pronto)

- Remover `NEXT_PUBLIC_USE_JOGOS_MOCK`
- Redeploy

## 📊 Status Esperado

### Com Mock Ativo:

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

### Com Backend Funcionando:

```json
// GET /api/public/jogos-do-dia
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
