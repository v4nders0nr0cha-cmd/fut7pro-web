# Fluxo de Publicação de Sites

## Visão Geral

Sistema completo para publicação controlada de sites de rachas, com checklist de validação, auditoria e preview em desenvolvimento.

## Arquitetura

### 1. Backend

#### Serviço de Checklist

`src/server/services/publishChecklist.ts`

Valida 4 requisitos obrigatórios:

- ✅ Slug válido (mínimo 3 caracteres)
- ✅ Branding (logo OU tema definidos)
- ✅ Conteúdo mínimo (1 time OU 5 jogadores OU 1 partida futura)
- ✅ E-mail do presidente verificado (mockado como `true` por enquanto)

Usa transação Prisma para otimizar performance.

#### Endpoints de API

**`GET /api/admin/racha/checklist?rachaId={id}`**

- Retorna status do checklist
- Response: `{ items: ChecklistItem[], allOk: boolean, racha: {...} }`

**`POST /api/admin/racha/publish`**

- Body: `{ rachaId: string }`
- Valida checklist completo
- Atualiza: `ativo: true`, `status: "ATIVO"`
- Registra auditoria no `AdminLog`
- Response: `{ message: "Publicado!", racha: {...} }`

**`POST /api/admin/racha/unpublish`**

- Body: `{ rachaId: string }`
- Atualiza: `ativo: false`
- Registra auditoria no `AdminLog`
- Response: `{ message: "Despublicado!", racha: {...} }`

**`GET /api/public/rachas/[slug]`**

- Em produção: retorna apenas se `ativo: true`
- Em dev: aceita `?dev=1` para preview de inativos

### 2. Frontend

#### Card de Publicação

`src/components/admin/PublicarSiteCard.tsx`

Estados:

- **Rascunho**: Mostra checklist + botões "Pré-visualizar" e "Publicar"
- **Publicado**: Mostra botões "Ver o site" e "Despublicar"

#### Sidebar Dinâmica

`src/components/admin/SidebarPublicacaoStatus.tsx`

- Se ativo: "Ver o Site"
- Se inativo: "Pré-visualizar" (com `?dev=1`)
- Loading state durante fetch

#### Dashboard

`src/app/(admin)/admin/dashboard/page.tsx`

- Busca rachaId do contexto
- Fallback: busca primeiro racha via `/api/admin/rachas`
- Exibe card de publicação no topo

## Auditoria

Todas as ações são registradas em `AdminLog`:

```typescript
{
  rachaId: string,
  adminId: string, // TODO: obter da sessão
  acao: "PUBLICAR_SITE" | "DESPUBLICAR_SITE",
  detalhes: string,
  criadoEm: DateTime
}
```

## Fluxo de Uso

### 1. Novo Racha

- Nasce com `ativo: false`, `status: "INATIVO"`
- Aparece no Dashboard como "Rascunho"
- Presidente vê checklist com pendências

### 2. Preparação

- Presidente completa requisitos:
  - Define slug
  - Adiciona logo ou escolhe tema
  - Cadastra conteúdo (times/jogadores/partidas)
  - Verifica e-mail (quando implementado)

### 3. Publicação

- Dashboard mostra checklist ✅ completo
- Botão "Publicar site" fica habilitado
- Ao clicar:
  1. Valida checklist novamente (backend)
  2. Atualiza `ativo: true`
  3. Registra log de auditoria
  4. Sidebar muda para "Ver o Site"
  5. Site fica público em `/{slug}`

### 4. Despublicação (opcional)

- Presidente pode despublicar a qualquer momento
- Site sai do ar imediatamente
- Preview continua disponível com `?dev=1` em dev

## Preview em Desenvolvimento

Para testar site inativo localmente:

```
http://localhost:3000/seu-slug?dev=1
```

⚠️ Funciona apenas em `NODE_ENV !== "production"`

## Testes

### Teste E2E com Playwright

`tests/e2e/publicacao-site.spec.ts`

```bash
# Configure
$env:RACHA_ID="seu-id"
$env:SLUG="seu-slug"

# Execute
npx playwright test tests/e2e/publicacao-site.spec.ts
```

### Teste Manual (cURL)

```bash
# Checklist
curl "http://localhost:3000/api/admin/racha/checklist?rachaId=ID"

# Publicar
curl -X POST "http://localhost:3000/api/admin/racha/publish" \
  -H "Content-Type: application/json" \
  -d '{"rachaId":"ID"}'

# Despublicar
curl -X POST "http://localhost:3000/api/admin/racha/unpublish" \
  -H "Content-Type: application/json" \
  -d '{"rachaId":"ID"}'
```

## TODOs

### Curto Prazo

- [ ] Substituir `adminId: "SYSTEM"` pela sessão real
- [ ] Implementar verificação de e-mail do presidente
- [ ] Adicionar guard de permissão (apenas PRESIDENTE/ADMIN)

### Médio Prazo

- [ ] Habilitar ISR revalidation: `await res.revalidate(\`/\${slug}\`)`
- [ ] Notificação ao presidente após publicação
- [ ] Histórico de publicações no AdminLog

### Longo Prazo

- [ ] Preview público temporário (link compartilhável)
- [ ] Agendamento de publicação
- [ ] Moderação de conteúdo antes de publicar

## Segurança

1. **Validação Dupla**: Checklist é validado no frontend e backend
2. **Auditoria**: Todas as ações são logadas
3. **Preview Seguro**: `?dev=1` funciona apenas fora de produção
4. **Permissões**: (TODO) Apenas presidente/admin podem publicar

## Performance

- Queries otimizadas com transações Prisma
- Card usa `useState` local (não revalida a cada render)
- Sidebar tem loading state durante fetch
- Dashboard tem fallback para buscar racha automaticamente
