# GitHub Connector — Fut7Pro Web

**Repositório:** `v4nders0nr0cha-cmd/fut7pro-web`  
**Permissões necessárias:** Read & Write (para abrir PRs)

## Branches de trabalho do agente

- `fix/frontend-stabilization` (padrão para estabilização)
- Branches adicionais podem ser criados com prefixos: `fix/`, `feat/`, `chore/`.

## Comandos/Scripts disponíveis

- `npm ci`
- `npm run type-check`
- `npm run lint`
- `npm test`
- `npm run build`

## Critérios de aceite no PR do agente

- Build Next.js sem warnings/erros.
- ESLint: **0 erros** e **0 warnings**.
- TypeScript: type-check limpo.
- Testes: 100% passando (melhorar cobertura continuamente).
- Respeitar padrões do projeto (dark theme, SEO, slugs dinâmicos, etc.).
