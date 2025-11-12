# ✅ Configuração Final do Vercel - Fut7Pro

## 🔐 Variáveis de Ambiente

| Nome                    | Onde          | Exemplo                      | Observação                                   |
| ----------------------- | ------------- | ---------------------------- | -------------------------------------------- |
| `BACKEND_URL`           | Vercel (Prod) | `https://api.fut7pro.com.br` | Mantém SNI correto para o proxy              |
| `DISABLE_WEB_DIRECT_DB` | Vercel (Prod) | `true`                       | Bloqueia Prisma diretamente no Next.js       |
| `JOGOS_DIA_PATH`        | Vercel (Prod) | `/partidas/jogos-do-dia`     | Ajuste caso o backend exponha outro endpoint |

## 🔄 Fluxo de Fallback (Produção)

1. A UI chama `GET /api/public/jogos-do-dia`.
2. O proxy server-side tenta o backend (`BACKEND_URL`).
3. Se falhar, devolve dados estáticos de contingência.
4. O header `x-fallback-source` indica a trilha usada.

**Trilhas disponíveis**

- `backend` → resposta real do backend (OK em produção).
- `static` → fallback estático mantido pelo app.

## 🚀 Validação rápida pós-deploy

1. **Verificar SSL da Render**
   ```powershell
   curl.exe -sIv https://api.fut7pro.com.br | Select-String -Pattern "subject:|issuer:|altname|WRONG_PRINCIPAL|HTTP"
   ```
2. **Checar variáveis no Vercel**
   - `BACKEND_URL=https://api.fut7pro.com.br`
   - `DISABLE_WEB_DIRECT_DB=true`
   - Redeploy após ajustes.
3. **Validar fallback**
   ```powershell
   curl.exe -sI https://app.fut7pro.com.br/api/public/jogos-do-dia | findstr /I "x-fallback-source HTTP"
   ```

   - `backend` → tudo certo.
   - `static` → proxy em contingência (backend ainda offline).

## 📝 Checklist de Aceite

- [ ] `curl -sIv https://api.fut7pro.com.br` sem `WRONG_PRINCIPAL`.
- [ ] `GET https://api.fut7pro.com.br/health` retorna `200`.
- [ ] `GET https://app.fut7pro.com.br/api/public/jogos-do-dia` retorna `200` + JSON.
- [ ] `x-fallback-source = backend` em produção.
- [ ] Home pública sem `X-Robots-Tag`; `/admin/*` e `/superadmin/*` com `noindex, nofollow`.

## 🧪 Testes

### Script automatizado

```powershell
.\scripts\test-jogos.ps1
```

### Testes manuais

```bash
# 1. Certificado SSL
curl.exe -sIv https://api.fut7pro.com.br

# 2. Backend health
curl.exe -sI https://api.fut7pro.com.br/health

# 3. Proxy principal (diagnóstico completo)
curl.exe -sI https://app.fut7pro.com.br/api/public/jogos-do-dia

# 4. Fallback explícito (opcional)
curl.exe -sI https://app.fut7pro.com.br/api/public/jogos-do-dia-fallback
```

## 📡 Monitoramento

- Logs das Serverless Functions no Vercel indicam a trilha utilizada.
- Headers de resposta (`x-fallback-source`) servem como diagnóstico rápido.
- Healthcheck do backend disponível em `/health`.

## 🛠️ Troubleshooting

### Problema: 502 Bad Gateway

**Causa**: Certificado SSL inválido  
**Solução**: Corrigir SSL na Render. Fallback continua atendendo a UI.

### Problema: `x-fallback-source` permanece `static`

**Causa**: Backend segue indisponível  
**Solução**: Validar SSL/CORS e reestabelecer o backend.

### Problema: Backend não responde

**Causa**: Serviço fora do ar ou CORS incorreto  
**Solução**: Verificar Render, logs e liberação de origens.

## 📊 Status Atual

- ⚙️ **Sistema**: Fallback automático habilitado e testado.
- 🔒 **SSL Fix**: Correções aplicadas.
- 🔍 **Diagnóstico**: Headers `x-fallback-source` expostos.
- ✅ **Backend SSL**: Acompanhar renovação na Render.
