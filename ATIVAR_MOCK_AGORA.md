# ⚠️ ATIVAR MOCK AGORA - Instruções Rápidas (Atualizado 2025-11)

## 🚩 Problema Atual

Backend com certificado SSL inválido ou indisponível:

```
ERR_TLS_CERT_ALTNAME_INVALID: Host: api.fut7pro.com.br. is not in the cert's altnames: DNS:*.onrender.com
```

## ✅ Novo Comportamento

- O toggle `NEXT_PUBLIC_USE_JOGOS_MOCK` foi **removido**. A interface pública consome apenas  
  `GET /api/public/jogos-do-dia`.
- O proxy server-side tenta o backend oficial. Se falhar, devolve o fallback estático e adiciona o header  
  `x-fallback-source: static`.
- O endpoint `/api/public/jogos-do-dia-fallback` permanece disponível apenas para diagnóstico manual.

## ⏱ Resposta Imediata (2 minutos)

1. **Checar fallback**

   ```powershell
   curl.exe -sI https://app.fut7pro.com.br/api/public/jogos-do-dia | findstr /I "x-fallback-source HTTP"
   ```

   - `HTTP/1.1 200 OK` + `x-fallback-source: static` → UI já está servindo dados de contingência.
   - `x-fallback-source: backend` → backend voltou à normalidade.

2. **Validar página pública**
   - Acessar `https://app.fut7pro.com.br/partidas/times-do-dia`.
   - Confirmar carregamento sem erros (dados estáticos são exibidos se o backend estiver indisponível).

## 🧰 Soluções Permanentes

### Opção 1: Corrigir certificado SSL na Render

- Render Dashboard → Serviço backend → Settings → Custom Domains.
- Garantir `api.fut7pro.com.br` com certificado válido.
- Se necessário, forçar novo deploy para reemitir o certificado.

### Opção 2: Revisar variáveis e CORS do backend

- Confirmar `BACKEND_URL=https://api.fut7pro.com.br` nos ambientes (Render e Vercel).
- Garantir origens liberadas: `app.fut7pro.com.br` e domínios de preview da Vercel.
- Executar healthcheck: `curl -I https://api.fut7pro.com.br/health`.

### Opção 3: Ajustar proxy local (uso temporário)

- Permitir ignorar SSL apenas em desenvolvimento local.
- **Nunca** aplicar essa configuração em produção.

## 📈 O Que Esperar Durante o Fallback

```json
// GET /api/public/jogos-do-dia (backend indisponível)
[
  {
    "id": "fallback-1",
    "timeA": "Time A",
    "timeB": "Time B",
    "golsTimeA": 0,
    "golsTimeB": 0,
    "finalizada": false,
    "_fallback": true
  }
]
```

## ✅ Teste Rápido

```powershell
# Header indica a trilha usada
curl.exe -sI https://app.fut7pro.com.br/api/public/jogos-do-dia | findstr /I "x-fallback-source HTTP"
```
