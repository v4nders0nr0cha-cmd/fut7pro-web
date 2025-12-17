# Configuração SSL do Railway (api.fut7pro.com.br)

## Objetivo

Certificado válido para `api.fut7pro.com.br` servindo o backend real (sem mock).

## Passos

1. **DNS (GoDaddy)**
   - CNAME: `api.fut7pro.com.br -> jfpj0dda.up.railway.app`
   - Não criar A/AAAA/mais CNAMEs.

2. **Railway**
   - Projeto → Backend Service → Settings → Custom Domain
   - Adicionar `api.fut7pro.com.br` → Status “Setup complete”.

3. **Deploy**
   - Railway → Deployments → Trigger Deploy (gera/renova certificado).

4. **Verificar certificado**
   ```bash
   curl.exe -sIv https://api.fut7pro.com.br | findstr /I "subject:|altname|WRONG_PRINCIPAL|HTTP"
   ```
   Esperado: CN/SAN com `api.fut7pro.com.br` e sem `*.up.railway.app`.

## Troubleshooting

- Se “Setup complete” mas SSL inválido: remover domínio, esperar 5 min, readicionar e redeploy.
- DNS não resolve: revisar CNAME e aguardar propagação (até 24h).
- Certificado mostra `*.up.railway.app`: forçar novo deploy e aguardar 10-15 min.

## Testes de validação

```bash
# Certificado
curl.exe -sIv https://api.fut7pro.com.br | findstr /I "subject:|altname|WRONG_PRINCIPAL|HTTP"

# Health backend
curl.exe -sI https://api.fut7pro.com.br/health

# App público (slug + scope)
curl.exe -sI "https://app.fut7pro.com.br/api/public/fut7pro/matches?scope=today" | findstr /I "HTTP x-fallback-source"
```

## Status esperado

```
subject: CN=api.fut7pro.com.br
altname: DNS:api.fut7pro.com.br
HTTP/1.1 200 OK
```

## Comandos rápidos

```bash
curl.exe -sIv https://api.fut7pro.com.br | findstr /I "subject:|altname|WRONG_PRINCIPAL|HTTP"
curl.exe -sI https://api.fut7pro.com.br/health
curl.exe -sI "https://app.fut7pro.com.br/api/public/fut7pro/matches?scope=today" | findstr /I "HTTP x-fallback-source"
```
