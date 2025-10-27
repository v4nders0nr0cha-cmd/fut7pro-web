# 🔧 Configuração Final do Vercel - Fut7Pro

## 📋 Variáveis de Ambiente

| Nome                         | Onde          | Exemplo                                  | Observação                                    |
| ---------------------------- | ------------- | ---------------------------------------- | --------------------------------------------- |
| `BACKEND_URL`                | Vercel (Prod) | `https://api.fut7pro.com.br`             | Mantém segurança e SNI corretos               |
| `JOGOS_DIA_PATH`             | Vercel (Prod) | `/partidas/jogos-do-dia`                 | Ajuste se o backend usar outro caminho        |
| `NEXT_PUBLIC_USE_JOGOS_MOCK` | Vercel (Prod) | `0` ou `1`                               | `1` força mock na UI, independente do backend |
| `RAILWAY_BACKEND_URL`        | Vercel (Prod) | `https://fut7pro-backend.up.railway.app` | Fallback para domínio Railway                 |

## 🔄 Fluxo de Fallback (Produção)

1. **UI chama** `GET /api/public/jogos-do-dia-fallback`
2. **Server tenta backend** → se falhar por TLS/timeout, tenta ssl-fix (domínio do Railway)
3. **Se ainda falhar**, retorna mock
4. **Último recurso**: dados estáticos
5. **Header `x-fallback-source`** indica a trilha usada

### Trilhas de Fallback:

- `backend` - Dados reais do backend (SSL OK)
- `ssl-fix` - Dados via domínio Railway (SSL fix)
- `mock` - Dados mock estáticos
- `static` - Dados de emergência

## 🚀 Como Migrar do Mock para Produção

### 1. Consertar o SSL no Railway

```bash
# Verificar certificado (deve NÃO aparecer WRONG_PRINCIPAL)
curl.exe -sIv https://api.fut7pro.com.br | Select-String -Pattern "subject:|issuer:|altname|WRONG_PRINCIPAL|HTTP"
```

### 2. Configurar Vercel

- Remover `NEXT_PUBLIC_USE_JOGOS_MOCK` (ou setar `0`)
- Redeploy

### 3. Validar

```bash
# Deve mostrar x-fallback-source: backend
curl.exe -sI https://app.fut7pro.com.br/api/public/jogos-do-dia-fallback | findstr /I "x-fallback-source HTTP"
```

## ✅ Checklist de Aceite

- [ ] `curl -sIv https://api.fut7pro.com.br` sem `WRONG_PRINCIPAL`
- [ ] `GET /health` do backend retorna `200`
- [ ] `GET /api/public/jogos-do-dia` (app) retorna `200` + JSON
- [ ] `x-fallback-source = backend` em produção
- [ ] Home sem `X-Robots-Tag`; admin/_ e superadmin/_ com `noindex, nofollow`

## 🧪 Testes

Execute o script de testes:

```powershell
.\scripts\test-jogos.ps1
```

### Testes Manuais:

```bash
# 1. Certificado SSL
curl.exe -sIv https://api.fut7pro.com.br

# 2. Backend health
curl.exe -sI https://api.fut7pro.com.br/health

# 3. App fallback (com diagnóstico)
curl.exe -sI https://app.fut7pro.com.br/api/public/jogos-do-dia-fallback

# 4. Mock direto
curl.exe -s https://app.fut7pro.com.br/api/public/jogos-do-dia-mock

# 5. Proxy principal
curl.exe -sI https://app.fut7pro.com.br/api/public/jogos-do-dia
```

## 🔭 Observabilidade

### Logs de Fallback

- **SSL Fix**: `x-fallback-source: ssl-fix`
- **Mock**: `x-fallback-source: mock`
- **Static**: `x-fallback-source: static`
- **Backend**: `x-fallback-source: backend`

### Métricas Recomendadas

- Taxa de fallback (quantos % usam mock vs backend)
- Tempo de resposta por trilha
- Alertas para falhas consecutivas do backend

### Monitoramento

- Vercel Function logs mostram qual trilha foi usada
- Headers de resposta indicam fonte dos dados
- Healthcheck endpoint para diagnóstico

## 🚨 Troubleshooting

### Problema: 502 Bad Gateway

**Causa**: Certificado SSL inválido
**Solução**: Usar fallback automático (já implementado)

### Problema: Mock não funciona

**Causa**: `NEXT_PUBLIC_USE_JOGOS_MOCK` não configurado
**Solução**: Setar para `1` no Vercel

### Problema: Backend não responde

**Causa**: Backend offline ou CORS
**Solução**: Verificar Railway e configurar CORS

## 📊 Status Atual

- ✅ **Sistema**: Funcionando com fallback
- ✅ **Mock**: Disponível e testado
- ✅ **SSL Fix**: Implementado
- ✅ **Diagnóstico**: Headers de fallback
- ⚠️ **Backend SSL**: Precisa ser corrigido no Railway
- ✅ **Testes**: Scripts prontos

## Segurança (Produção)

- Defina DISABLE_WEB_DIRECT_DB = true
  - Bloqueia o uso de Prisma diretamente no web em produção e obriga o consumo de dados via API do backend, conforme a especificação.
- Padronize NEXT_PUBLIC_API_URL = https://api.fut7pro.com.br
  - Evita divergências de CORS/cache usando o domínio oficial do backend.
