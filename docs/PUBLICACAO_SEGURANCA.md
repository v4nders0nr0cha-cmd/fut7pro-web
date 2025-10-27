# Segurança e Permissões - Fluxo de Publicação

## Visão Geral

Sistema completo de autenticação, autorização e proteções para o fluxo de publicação de sites.

## Autenticação

### Guard Central: `requireAdminRacha`

**Arquivo**: `src/server/auth/requireAdminRacha.ts`

Valida sessão e permissões em todas as rotas admin:

```typescript
const ctx = await requireAdminRacha(req, res, rachaId);
// ctx = { userId, rachaId, slug, role }
```

**Fluxo**:

1. Valida sessão via NextAuth
2. Verifica se usuário é `ownerId` do racha OU tem relação em `RachaAdmin`
3. Retorna contexto com `userId`, `rachaId`, `slug` e `role`
4. Lança erro `UNAUTHENTICATED` (401) ou `FORBIDDEN` (403) se falhar

**Roles permitidos**:

- `PRESIDENTE` (owner do racha)
- `ADMIN` (relação em RachaAdmin com status="ativo")

### Validação de Permissões

```typescript
if (!requireRole(ctx, ["PRESIDENTE", "ADMIN"])) {
  return res.status(403).json({ error: "Sem permissão" });
}
```

## Rate Limiting

### Implementação: Token Bucket

**Arquivo**: `src/server/security/rateLimiter.ts`

Protege contra flood e abuso:

```typescript
if (!rateLimit(`publish:${userId}`, 5, 0.083)) {
  return res.status(429).json({ error: "Muitas requisições" });
}
```

**Configuração**:

- **Capacidade**: 5 tokens (requisições)
- **Recarga**: ~1 token a cada 12 segundos (5/min)
- **Escopo**: Por userId

**Limitações atuais**:

- ⚠️ In-memory (não compartilhado entre instâncias)
- Para produção multi-instância, migrar para Redis

**Limpeza automática**:

- Buckets antigos (>1h) são removidos a cada 30min
- Previne memory leak

## Verificação de E-mail

### Implementação Real

**Arquivo**: `src/server/services/publishChecklist.ts`

```typescript
const emailVerified = ownerData?.emailVerified ? true : ownerData?.status === "ativo";
```

**Prioridades**:

1. `User.emailVerified` (NextAuth)
2. Fallback: `Usuario.status === "ativo"`

**No checklist**:

```typescript
{
  key: "email",
  label: "E-mail do presidente verificado",
  ok: emailVerified,
  help: ownerData?.emailVerified
    ? "E-mail verificado via NextAuth"
    : "Usando status ativo como proxy"
}
```

## Auditoria Completa

### AdminLog com userId Real

Todas as ações são registradas:

```typescript
await prisma.adminLog.create({
  data: {
    rachaId: ctx.rachaId,
    adminId: ctx.userId, // userId real da sessão
    acao: "PUBLICAR_SITE",
    detalhes: `Racha publicado (slug=${slug}) por ${ctx.role}`,
  },
});
```

**Campos registrados**:

- `rachaId`: ID do racha afetado
- `adminId`: ID do usuário que executou a ação
- `acao`: Tipo da ação (`PUBLICAR_SITE`, `DESPUBLICAR_SITE`)
- `detalhes`: Informações adicionais (slug, role, etc)
- `criadoEm`: Timestamp automático

## Observabilidade

### Logs Estruturados (JSON)

Todos os eventos são logados em formato JSON para facilitar análise:

**Sucesso**:

```typescript
console.info({
  evt: "publish",
  slug: "meu-racha",
  userId: "user-123",
  rachaId: "racha-456",
  role: "PRESIDENTE",
});
```

**Falha**:

```typescript
console.error({
  evt: "publish_fail",
  error: "Mensagem do erro",
  stack: "Stack trace...",
});
```

**Rate limit**:

```typescript
console.warn({
  evt: "publish_rate_limited",
  userId: "user-123",
  rachaId: "racha-456",
});
```

**Tipos de eventos**:

- `publish` / `unpublish` - Sucesso
- `publish_fail` / `unpublish_fail` - Erro interno
- `publish_forbidden` / `unpublish_forbidden` - Sem permissão
- `publish_rate_limited` / `unpublish_rate_limited` - Rate limit
- `publish_checklist_incomplete` - Checklist pendente
- `revalidate_success` / `revalidate_failed` - ISR

## Cache e Revalidação

### ISR Habilitado

```typescript
try {
  if (typeof res.revalidate === "function") {
    await res.revalidate(`/${slug}`);
    console.info({ evt: "revalidate_success", slug });
  }
} catch (revalidateError) {
  console.warn({ evt: "revalidate_failed", slug, error });
}
```

**Quando revalidar**:

- ✅ Após publicação
- ✅ Após despublicação
- ✅ Atualização de conteúdo do racha

**Fallback**:

- Se revalidate falhar, apenas loga aviso
- Não bloqueia a operação de publish/unpublish

## Preview em Desenvolvimento

### Trava de Segurança

**Arquivo**: `src/pages/api/public/rachas/[slug].ts`

```typescript
const allowDevPreview = process.env.NODE_ENV !== "production" && req.query.dev === "1";
```

**Garantias**:

- ✅ `?dev=1` funciona **APENAS** em desenvolvimento
- ✅ Em produção, `?dev=1` é ignorado
- ✅ Preview não vaza sites inativos em produção

## Testes E2E

### Autenticação

**Arquivo**: `tests/e2e/publicacao-auth.spec.ts`

**Testes negativos**:

- ❌ Publish sem sessão → 401
- ❌ Unpublish sem sessão → 401
- ❌ Checklist sem rachaId → 400

**Testes de rate limiting**:

- ❌ Bloqueia após 5 requisições rápidas → 429

**Executar**:

```bash
npx playwright test tests/e2e/publicacao-auth.spec.ts
```

## Endpoints Protegidos

| Endpoint                     | Método | Auth | Permissão        | Rate Limit |
| ---------------------------- | ------ | ---- | ---------------- | ---------- |
| `/api/admin/racha/checklist` | GET    | ❌   | -                | -          |
| `/api/admin/racha/publish`   | POST   | ✅   | PRESIDENTE/ADMIN | 5/min      |
| `/api/admin/racha/unpublish` | POST   | ✅   | PRESIDENTE/ADMIN | 5/min      |
| `/api/public/rachas/[slug]`  | GET    | ❌   | -                | -          |

## Melhorias Futuras

### Curto Prazo

- [ ] Migrar rate limiter para Redis (multi-instância)
- [ ] Adicionar CAPTCHA em ações críticas
- [ ] Implementar 2FA para presidentes

### Médio Prazo

- [ ] Logs centralizados (Datadog, New Relic)
- [ ] Alertas automáticos para rate limit abuse
- [ ] Dashboard de auditoria para superadmin

### Longo Prazo

- [ ] RBAC granular (permissões por ação)
- [ ] Aprovação em duas etapas para publicação
- [ ] Histórico completo de mudanças (event sourcing)

## Troubleshooting

### 401 Unauthorized

- Verificar se NextAuth está configurado
- Verificar se cookie de sessão está presente
- Verificar `authOptions` em `src/server/auth/options.ts`

### 403 Forbidden

- Usuário não é owner nem admin do racha
- Verificar relação em `RachaAdmin` com `status="ativo"`
- Verificar `ownerId` do racha

### 429 Too Many Requests

- Aguardar ~12 segundos entre requisições
- Rate limit é por userId
- Em dev, pode limpar buckets reiniciando servidor

### Revalidate não funciona

- Verificar se está usando Pages Router (não App Router)
- Verificar se página existe em `/pages/[slug]`
- Verificar logs: `revalidate_failed` indica problema

## Segurança em Produção

✅ **Checklist de deploy**:

- [ ] `NEXTAUTH_SECRET` configurado
- [ ] `NODE_ENV=production`
- [ ] Preview com `?dev=1` desabilitado
- [ ] Rate limiter configurado (Redis recomendado)
- [ ] Logs estruturados habilitados
- [ ] Auditoria ativa em `AdminLog`
- [ ] ISR revalidation testado
- [ ] E2E passando em todas as rotas
