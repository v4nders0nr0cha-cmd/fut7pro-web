# 🔐 Configuração SSL do Railway - Passo a Passo

## 🎯 Objetivo

Configurar certificado SSL válido para `api.fut7pro.com.br` no Railway.

## 📋 Pré-requisitos

- Domínio `api.fut7pro.com.br` configurado no GoDaddy
- Acesso ao Railway Dashboard
- Serviço backend rodando no Railway

## 🔧 Passos de Configuração

### 1. Configurar DNS (GoDaddy)

```bash
# Manter apenas CNAME (sem A/AAAA)
api.fut7pro.com.br → CNAME → jfpj0dda.up.railway.app
```

**❌ NÃO criar:**

- Registros A
- Registros AAAA
- Outros CNAMEs

### 2. Configurar Railway

1. **Railway Dashboard** → **Seu Projeto** → **Backend Service**
2. **Settings** → **Custom Domain**
3. **Adicionar domínio**: `api.fut7pro.com.br`
4. **Status deve ser**: "Setup complete"

### 3. Fazer Deploy (Importante!)

1. **Railway Dashboard** → **Deployments**
2. **Trigger Deploy** (ou aguardar deploy automático)
3. **Aguardar**: Certificado SSL é gerado após deploy ativo

### 4. Verificar Configuração

```bash
# Deve mostrar CN/SAN com api.fut7pro.com.br
curl.exe -sIv https://api.fut7pro.com.br | findstr /I "subject:|altname|WRONG_PRINCIPAL|HTTP"
```

**✅ Sucesso quando:**

- `subject: CN=api.fut7pro.com.br`
- `altname: DNS:api.fut7pro.com.br`
- **NÃO** aparece `WRONG_PRINCIPAL`
- **NÃO** aparece `*.up.railway.app`

## 🔄 Troubleshooting

### Problema: "Setup complete" mas SSL não funciona

**Solução:**

1. Remover domínio do Railway
2. Aguardar 5 minutos
3. Re-adicionar `api.fut7pro.com.br`
4. Fazer novo deploy

### Problema: DNS não resolve

**Solução:**

1. Verificar CNAME no GoDaddy
2. Aguardar propagação DNS (até 24h)
3. Testar: `nslookup api.fut7pro.com.br`

### Problema: Certificado ainda mostra \*.up.railway.app

**Solução:**

1. Fazer deploy forçado no Railway
2. Aguardar 10-15 minutos
3. Verificar novamente

## 🧪 Testes de Validação

### 1. Teste de Certificado

```bash
curl.exe -sIv https://api.fut7pro.com.br | findstr /I "subject:|altname|WRONG_PRINCIPAL|HTTP"
```

### 2. Teste de Conectividade

```bash
curl.exe -sI https://api.fut7pro.com.br/health
```

### 3. Teste do App

```bash
curl.exe -sI https://app.fut7pro.com.br/api/public/jogos-do-dia | findstr /I "HTTP"
```

## 📊 Status Esperado

### Antes (Atual)

```
subject: CN=*.up.railway.app
altname: DNS:*.up.railway.app
WRONG_PRINCIPAL: api.fut7pro.com.br
```

### Depois (Objetivo)

```
subject: CN=api.fut7pro.com.br
altname: DNS:api.fut7pro.com.br
HTTP/1.1 200 OK
```

## ⚡ Comandos Rápidos

```bash
# Verificar status atual
curl.exe -sIv https://api.fut7pro.com.br | findstr /I "subject:|altname|WRONG_PRINCIPAL|HTTP"

# Testar app (deve funcionar após SSL)
curl.exe -sI https://app.fut7pro.com.br/api/public/jogos-do-dia | findstr /I "HTTP"

# Testar fallback (sempre funciona)
curl.exe -sI https://app.fut7pro.com.br/api/public/jogos-do-dia-fallback | findstr /I "x-fallback-source HTTP"
```

## 🎯 Próximos Passos

1. **Configurar DNS** (GoDaddy)
2. **Configurar Railway** (Custom Domain)
3. **Fazer Deploy** (Railway)
4. **Aguardar Propagação** (5-15 min)
5. **Testar Certificado** (curl)
6. **Validar App** (fallback → backend)

## 📝 Notas Importantes

- **Propagação DNS**: Pode levar até 24h (normalmente 5-15 min)
- **Certificado SSL**: Gerado automaticamente após deploy
- **Fallback**: Continua funcionando durante configuração
- **Monitoramento**: Usar `x-fallback-source` para verificar trilha ativa
