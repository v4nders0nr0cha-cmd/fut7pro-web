# Testes do Fluxo de Publicação

## Pré-requisitos

- Servidor rodando em `http://localhost:3000`
- Ter um `rachaId` válido no banco de dados

## Endpoints Disponíveis

### 1. Checklist de Publicação

Verifica se o racha está pronto para ser publicado.

```bash
curl "http://localhost:3000/api/admin/racha/checklist?rachaId=SEU_RACHA_ID"
```

**Resposta esperada:**

```json
{
  "items": [
    { "key": "slug", "label": "Slug válido", "ok": true },
    { "key": "branding", "label": "Logo OU tema definidos", "ok": false },
    {
      "key": "conteudo",
      "label": "Conteúdo mínimo (1 time OU 5 jogadores OU 1 partida futura)",
      "ok": true
    },
    { "key": "email", "label": "E-mail do presidente verificado", "ok": true }
  ],
  "allOk": false,
  "racha": {
    "id": "...",
    "slug": "meu-racha",
    "ativo": false
  }
}
```

### 2. Publicar Site

Publica o site do racha (apenas se checklist estiver completo).

```bash
curl -X POST "http://localhost:3000/api/admin/racha/publish" \
  -H "Content-Type: application/json" \
  -d "{\"rachaId\":\"SEU_RACHA_ID\"}"
```

**PowerShell (Windows):**

```powershell
curl -X POST "http://localhost:3000/api/admin/racha/publish" `
  -H "Content-Type: application/json" `
  -d "{`"rachaId`":`"SEU_RACHA_ID`"}"
```

**Resposta de sucesso:**

```json
{
  "message": "Publicado!",
  "racha": {
    "id": "...",
    "slug": "meu-racha",
    "ativo": true,
    "status": "ATIVO"
  }
}
```

**Resposta de erro (checklist incompleto):**

```json
{
  "error": "Checklist não concluído",
  "items": [...]
}
```

### 3. Despublicar Site

Remove o site do ar (coloca em rascunho).

```bash
curl -X POST "http://localhost:3000/api/admin/racha/unpublish" \
  -H "Content-Type: application/json" \
  -d "{\"rachaId\":\"SEU_RACHA_ID\"}"
```

**PowerShell (Windows):**

```powershell
curl -X POST "http://localhost:3000/api/admin/racha/unpublish" `
  -H "Content-Type: application/json" `
  -d "{`"rachaId`":`"SEU_RACHA_ID`"}"
```

**Resposta:**

```json
{
  "message": "Despublicado!",
  "racha": {
    "id": "...",
    "slug": "meu-racha",
    "ativo": false,
    "status": null
  }
}
```

### 4. API Pública (com Preview)

**Em produção** - apenas rachas ativos:

```bash
curl "http://localhost:3000/api/public/rachas/meu-racha"
```

**Em desenvolvimento** - preview com `?dev=1`:

```bash
curl "http://localhost:3000/api/public/rachas/meu-racha?dev=1"
```

## Fluxo Completo de Teste

1. **Verificar checklist inicial:**

   ```bash
   curl "http://localhost:3000/api/admin/racha/checklist?rachaId=SEU_RACHA_ID"
   ```

2. **Tentar publicar (vai falhar se checklist não estiver OK):**

   ```bash
   curl -X POST "http://localhost:3000/api/admin/racha/publish" \
     -H "Content-Type: application/json" \
     -d "{\"rachaId\":\"SEU_RACHA_ID\"}"
   ```

3. **Preencher os requisitos** (adicionar logo, jogadores, etc)

4. **Publicar com sucesso:**

   ```bash
   curl -X POST "http://localhost:3000/api/admin/racha/publish" \
     -H "Content-Type: application/json" \
     -d "{\"rachaId\":\"SEU_RACHA_ID\"}"
   ```

5. **Verificar site público:**

   ```bash
   curl "http://localhost:3000/api/public/rachas/meu-racha"
   ```

6. **Despublicar:**

   ```bash
   curl -X POST "http://localhost:3000/api/admin/racha/unpublish" \
     -H "Content-Type: application/json" \
     -d "{\"rachaId\":\"SEU_RACHA_ID\"}"
   ```

7. **Verificar que site não está mais acessível publicamente:**
   ```bash
   curl "http://localhost:3000/api/public/rachas/meu-racha"
   # Deve retornar 404
   ```

## Testar via Interface

1. Acesse o Dashboard: `http://localhost:3000/admin/dashboard`
2. Você verá o card "Publicação do site"
3. Se estiver em rascunho:
   - Veja o checklist
   - Clique em "Pré-visualizar" para ver o site com `?dev=1`
   - Quando tudo estiver OK, clique em "Publicar site"
4. Se estiver publicado:
   - Clique em "Ver o site" para abrir em nova aba
   - Clique em "Despublicar" para colocar em rascunho

## Notas

- O `rachaId` atualmente vem do body. Futuramente será obtido da sessão.
- Preview com `?dev=1` funciona apenas em `NODE_ENV !== "production"`
- Checklist valida: slug, branding (logo/tema), conteúdo mínimo, e-mail verificado
