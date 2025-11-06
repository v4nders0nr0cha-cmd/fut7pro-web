# ⚠️ ATIVAÇÃO URGENTE DO MOCK (Atualizado 2025-11)

## 🚨 Problema Confirmado

Backend indisponível ou certificado inválido enquanto o app está em produção.

## ✅ Novo Fluxo

- A flag `NEXT_PUBLIC_USE_JOGOS_MOCK` foi **descontinuada**. A UI sempre chama  
  `GET /api/public/jogos-do-dia`.
- O proxy tenta o backend oficial e, em caso de falha, devolve fallback estático marcado com  
  `x-fallback-source: static`.
- O endpoint `/api/public/jogos-do-dia-fallback` permanece para diagnóstico manual, mas não é utilizado pela UI.

## ⏱ Ação Imediata

1. **Verificar fallback:**

   ```powershell
   curl.exe -sI https://app.fut7pro.com.br/api/public/jogos-do-dia | findstr /I "x-fallback-source HTTP"
   ```

   - `HTTP/1.1 200 OK` + `x-fallback-source: static` → contingência ativa.
   - `x-fallback-source: backend` → backend voltou.

2. **Validar páginas críticas:**
   - `https://app.fut7pro.com.br/partidas/times-do-dia`
   - `https://app.fut7pro.com.br/partidas/historico`

   Ambas devem carregar com dados estáticos se o backend estiver offline.

## 🧰 Soluções Permanentes

### Opção 1: Corrigir certificado SSL na Render

- Render Dashboard → Serviço backend → Settings → Custom Domains.
- Certificar-se de que `api.fut7pro.com.br` possui certificado válido.
- Se necessário, forçar novo deploy para reemitir o certificado.

### Opção 2: Revisar configuração do backend

- Confirmar `BACKEND_URL=https://api.fut7pro.com.br` em todos os ambientes.
- Garantir CORS liberando `app.fut7pro.com.br` e domínios de preview da Vercel.
- Executar healthcheck: `curl -I https://api.fut7pro.com.br/health`.

### Opção 3: Ajustar proxy local (somente desenvolvimento)

- Ignorar SSL apenas no ambiente local de desenvolvimento.
- **Nunca** aplicar esse bypass em produção.

## 📈 Exemplo de Resposta em Fallback

```json
// GET /api/public/jogos-do-dia com fallback ativo
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
curl.exe -sI https://app.fut7pro.com.br/api/public/jogos-do-dia | findstr /I "x-fallback-source HTTP"
```
