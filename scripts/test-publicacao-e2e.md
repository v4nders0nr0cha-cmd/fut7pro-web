# Teste E2E - Fluxo de Publicação

## Pré-requisitos

1. Ter um racha de teste no banco com dados completos (slug, logo/tema, jogadores/times)
2. Servidor rodando em `http://localhost:3000`

## Como Executar

### 1. Configure as variáveis de ambiente

**PowerShell:**

```powershell
$env:PLAYWRIGHT_BASE_URL="http://localhost:3000"
$env:RACHA_ID="seu-racha-id-aqui"
$env:SLUG="seu-slug-aqui"
```

**Bash/Git Bash:**

```bash
export PLAYWRIGHT_BASE_URL="http://localhost:3000"
export RACHA_ID="seu-racha-id-aqui"
export SLUG="seu-slug-aqui"
```

### 2. Execute o teste

```bash
npx playwright test tests/e2e/publicacao-site.spec.ts
```

### 3. Ver relatório

```bash
npx playwright show-report
```

## O que o teste valida

1. ✅ **Checklist** - Busca e valida estrutura do checklist
2. ✅ **Publicação** - Publica o racha e valida que `ativo=true`
3. ✅ **API Pública** - Valida que o racha está acessível publicamente
4. ✅ **Despublicação** - Remove da publicação e valida `ativo=false`
5. ✅ **Preview em Dev** - Valida que `?dev=1` funciona quando inativo

## Exemplo de Saída Esperada

```
✓ Fluxo de publicação do site › checklist -> publish -> public api -> unpublish (1.2s)

1 passed (1.2s)
```

## Se o Checklist Falhar

Se o teste skipar com "Checklist não concluído", veja o console:

```
Checklist pendente: [
  { key: 'branding', label: 'Logo OU tema definidos', ok: false }
]
```

Ajuste os dados do racha de teste para completar os requisitos.

## Debug

Para ver logs detalhados:

```bash
npx playwright test tests/e2e/publicacao-site.spec.ts --debug
```

## Rodando em CI/CD

No seu pipeline, configure as variáveis de ambiente e rode:

```yaml
- name: Teste E2E Publicação
  env:
    PLAYWRIGHT_BASE_URL: ${{ secrets.APP_URL }}
    RACHA_ID: ${{ secrets.TEST_RACHA_ID }}
    SLUG: ${{ secrets.TEST_SLUG }}
  run: npx playwright test tests/e2e/publicacao-site.spec.ts
```
