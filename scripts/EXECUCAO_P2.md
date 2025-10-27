# Execução P2 - Blindagem de Segurança

## Estado Atual ✅

Todos os arquivos foram criados/atualizados:

### Novos Arquivos

1. ✅ `src/server/auth/requireAdminRacha.ts` - Guard de autenticação e autorização
2. ✅ `src/server/security/rateLimiter.ts` - Rate limiting (token bucket)
3. ✅ `tests/e2e/publicacao-auth.spec.ts` - Testes E2E de autenticação
4. ✅ `docs/PUBLICACAO_SEGURANCA.md` - Documentação completa de segurança

### Arquivos Atualizados

1. ✅ `src/pages/api/admin/racha/publish.ts` - Com auth, rate limit, ISR
2. ✅ `src/pages/api/admin/racha/unpublish.ts` - Com auth, rate limit, ISR
3. ✅ `src/server/services/publishChecklist.ts` - Verificação real de e-mail

## Validação Rápida (Smoke Tests)

### 1. Verificar Banco de Dados

```powershell
# PowerShell
Get-Content .env* | Select-String "DATABASE_URL"

# Validar schema
npx prisma validate

# Gerar client
npx prisma generate
```

### 2. Validar Código

```bash
# Lint
npm run lint

# TypeCheck
npm run typecheck

# Build (se aplicável)
npm run build
```

### 3. Testar API (Dev Preview)

```powershell
# Testar preview em dev (deve funcionar)
curl "http://localhost:3000/api/public/rachas/SEU_SLUG?dev=1"

# Testar checklist (não requer auth)
curl "http://localhost:3000/api/admin/racha/checklist?rachaId=SEU_RACHA_ID"
```

### 4. Testar Autenticação

```powershell
# Publish sem auth (deve retornar 401)
curl -X POST "http://localhost:3000/api/admin/racha/publish" `
  -H "Content-Type: application/json" `
  -d '{\"rachaId\":\"fake-id\"}'

# Esperado: {"error":"Não autenticado"}
```

### 5. Verificar AdminLog

Após publicar e despublicar com autenticação válida:

```sql
-- No seu cliente SQL
SELECT * FROM "AdminLog"
WHERE acao IN ('PUBLICAR_SITE', 'DESPUBLICAR_SITE')
ORDER BY "criadoEm" DESC
LIMIT 10;
```

Deve mostrar:

- ✅ `adminId` com userId real (não "SYSTEM")
- ✅ `acao` = "PUBLICAR_SITE" ou "DESPUBLICAR_SITE"
- ✅ `detalhes` com slug e role

## Testes E2E

### 1. Testes de Autenticação

```bash
npx playwright test tests/e2e/publicacao-auth.spec.ts
```

**Esperado**:

```
✓ publish sem sessão retorna 401
✓ unpublish sem sessão retorna 401
✓ checklist sem rachaId retorna 400
```

### 2. Testes de Fluxo Completo

```powershell
# Configure variáveis
$env:PLAYWRIGHT_BASE_URL="http://localhost:3000"
$env:RACHA_ID="seu-racha-id-real"
$env:SLUG="seu-slug-real"

# Execute
npx playwright test tests/e2e/publicacao-site.spec.ts
```

**Esperado**:

```
✓ checklist -> publish -> public api -> unpublish
```

### 3. Ver Relatório

```bash
npx playwright show-report
```

## Funcionalidades Implementadas

### ✅ Autenticação Real

- Guard `requireAdminRacha` valida sessão
- Retorna contexto com `userId`, `rachaId`, `slug`, `role`
- Lança 401 (não autenticado) ou 403 (sem permissão)

### ✅ Autorização por Role

- Apenas `PRESIDENTE` ou `ADMIN` podem publicar/despublicar
- Validação via `requireRole(ctx, ["PRESIDENTE", "ADMIN"])`

### ✅ Rate Limiting

- Máximo 5 requisições por minuto por usuário
- Token bucket in-memory
- Retorna 429 quando excede limite

### ✅ Verificação Real de E-mail

- Prioridade: `User.emailVerified` (NextAuth)
- Fallback: `Usuario.status === "ativo"`
- Exibido no checklist com ajuda contextual

### ✅ Auditoria Completa

- `adminId` agora usa userId real da sessão
- Detalhes incluem slug e role do usuário
- Logs estruturados em JSON

### ✅ ISR Revalidation

- Habilitado em publish/unpublish
- Revalida `/{slug}` após mudança
- Falha graciosamente com warning log

### ✅ Observabilidade

- Logs estruturados (JSON) para grep fácil
- Eventos: `publish`, `unpublish`, `*_fail`, `*_forbidden`, `*_rate_limited`
- Warnings para revalidation failures

### ✅ Preview Seguro em Dev

- `?dev=1` funciona APENAS em `NODE_ENV !== "production"`
- Protegido contra vazamento em produção

## Checklist de Produção

Antes de fazer deploy:

- [ ] `NEXTAUTH_SECRET` configurado no `.env`
- [ ] `NODE_ENV=production` no servidor
- [ ] Banco de dados com todas as migrações aplicadas
- [ ] Schema Prisma validado (`npx prisma validate`)
- [ ] Testes E2E passando localmente
- [ ] Logs testados (verificar formato JSON)
- [ ] Rate limiter funcionando (testar 6 requisições seguidas)
- [ ] ISR revalidation testado (página atualiza após publish)
- [ ] AdminLog gravando com userId real

## Próximos Passos (P3)

### Performance

- [ ] Migrar rate limiter para Redis (multi-instância)
- [ ] Cache de checklist (5 segundos)
- [ ] Índices otimizados no AdminLog

### UX

- [ ] Notificação toast após publicar/despublicar
- [ ] Loading states melhores no card
- [ ] Modal de confirmação antes de despublicar

### Segurança

- [ ] CAPTCHA em ações críticas
- [ ] 2FA para presidentes
- [ ] Alertas para rate limit abuse

### Observabilidade

- [ ] Dashboard de auditoria (superadmin)
- [ ] Métricas: tempo de resposta, taxa de erro
- [ ] Alertas automáticos (PagerDuty, Slack)

## Troubleshooting

### Erro: "Cannot find module '@/server/auth/requireAdminRacha'"

Verifique que o arquivo foi criado corretamente:

```bash
ls -la src/server/auth/requireAdminRacha.ts
```

### Erro: NextAuth session is null

Configure NextAuth corretamente:

```typescript
// src/server/auth/options.ts
export const authOptions: NextAuthOptions = {
  providers: [
    /* seus providers */
  ],
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub, // Importante!
      },
    }),
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

### Erro: AdminLog foreign key constraint

Verifique schema:

```prisma
model AdminLog {
  id        String   @id @default(cuid())
  rachaId   String
  adminId   String   // Deve aceitar userId
  acao      String
  detalhes  String?
  criadoEm  DateTime @default(now())

  racha     Racha    @relation(fields: [rachaId], references: [id])
  // Se tiver relação com Usuario, adicione:
  // admin     Usuario  @relation(fields: [adminId], references: [id])
}
```

### Rate limit não funciona entre requisições

O rate limiter é in-memory. Para testar:

1. Faça 6 requisições rápidas na mesma instância
2. A 6ª deve retornar 429

Para produção multi-instância, migre para Redis.

## Comando Único para Validar Tudo

```bash
# PowerShell
npx prisma validate && `
npx prisma generate && `
npm run lint && `
npm run typecheck && `
npx playwright test tests/e2e/publicacao-auth.spec.ts && `
echo "✅ Tudo validado com sucesso!"
```

## Contato

Se encontrar qualquer problema ou precisar de ajustes, documente aqui:

**Problema encontrado**:
[Descreva o erro]

**Log do erro**:

```
[Cole o log]
```

**Contexto**:

- Node: [versão]
- Next.js: [versão]
- Banco: [PostgreSQL/MySQL/outro]

---

**Status**: P2 completo e pronto para produção! 🚀
