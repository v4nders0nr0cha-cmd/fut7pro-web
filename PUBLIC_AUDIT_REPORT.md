# PUBLIC AUDIT REPORT

Data: 2026-02-21 (revalidação pós-hotfixes + SEO + empty-state + política sem fallback default + smoke funcional real)  
Escopo: `src/app/(public)/**`, `src/app/api/public/**`, `src/components/layout/**`, `src/hooks/usePublic*`.

## Resumo Executivo

- Status geral: **melhorou de forma significativa**, com todos os bloqueios críticos anteriores corrigidos.
- Inventário validado: **105 rotas públicas (`page.tsx`)** e **46 rotas de API pública (`route.ts`)**.
- Resultado atual: **tecnicamente apto**, sem achados críticos/altos/médios abertos no escopo auditado.

### Evolução desde a auditoria anterior

- ✅ Corrigido risco multi-tenant no proxy público de patrocinadores.
- ✅ Corrigidos links quebrados da Sidebar pública (estatísticas por posição).
- ✅ Removidos placeholders legais/contato em páginas públicas.
- ✅ Endpoints legados públicos de jogos do dia agora retornam `410 Gone`.
- ✅ Fallback de `rachaConfig.slug` removido dos hooks públicos e das rotas públicas slugadas.
- ✅ Verificação Google Search Console concluída com token correto em produção (`google-site-verification`).
- ✅ Estados vazios públicos sem dados fictícios (`Jogador 1`, `Time A`, `Time B`, `placeholder-*`).
- ✅ Política de rotas públicas sem slug aplicada sem fallback default de tenant.
- ✅ Smoke SEO automatizado (Playwright) cobrindo `robots.txt` e `sitemap.xml` com sucesso (`6/6`).
- ✅ Smoke E2E funcional público em produção com slugs reais (`vitrine`, `chelsea`) aprovado em Chromium, Firefox e WebKit.

## Inventário e Navegação

### Rotas públicas

- `src/app/(public)/**`: 105 páginas.
- `src/app/api/public/**`: 46 endpoints.

### Navegação (cards/atalhos)

- Sidebar pública com links de posição agora apontando para rotas válidas:
  - `src/components/layout/Sidebar.tsx:151`
  - `src/components/layout/Sidebar.tsx:160`
  - `src/components/layout/Sidebar.tsx:169`

## Achados por Severidade

### Crítico

#### Nenhum achado crítico aberto nesta revalidação

### Alto

#### Nenhum achado alto aberto nesta revalidação

### Médio

#### Nenhum achado médio aberto nesta revalidação

## Itens Resolvidos (evidência de código)

### A) Multi-tenant no sponsors proxy (corrigido)

- Evidências:
  - `src/app/api/public/[slug]/sponsors/route.ts:9`
  - `src/app/api/public/[slug]/sponsors/route.ts:54`
  - `src/app/api/public/[slug]/sponsors/route.ts:70`
  - `src/app/api/public/[slug]/sponsors/route.ts:71`
- Resultado:
  - Query params de tenant/slug não sobrescrevem mais o tenant do path.

### B) Conteúdo legal/contato placeholder (corrigido)

- Evidências:
  - `src/app/(public)/contato/page.tsx:12`
  - `src/app/(public)/privacidade/page.tsx:4`
  - `src/app/(public)/termos/page.tsx:4`
- Resultado:
  - Sem ocorrências de `placeholder`, `Substitua` e `go-live` nas páginas legais básicas.

### C) Endpoints legados/fallback públicos (corrigido)

- Evidências:
  - `src/app/api/public/jogos-do-dia-fallback/route.ts:9`
  - `src/app/api/public/jogos-do-dia-fallback/route.ts:15`
  - `src/app/api/public/jogos-do-dia-ssl-fix/route.ts:9`
  - `src/app/api/public/jogos-do-dia-ssl-fix/route.ts:15`
- Resultado:
  - Endpoints legados retornam `410 Gone` com payload controlado e endpoint oficial indicado.

### D) Links quebrados da Sidebar (corrigido)

- Evidências:
  - `src/components/layout/Sidebar.tsx:64`
  - `src/components/layout/Sidebar.tsx:73`
  - `src/components/layout/Sidebar.tsx:91`
  - `src/components/layout/Sidebar.tsx:151`
  - `src/components/layout/Sidebar.tsx:160`
  - `src/components/layout/Sidebar.tsx:169`
- Resultado:
  - Links de atacantes/meias/goleiros apontam para rotas existentes.

### E) Fallback de slug nos hooks públicos e rotas `[slug]` (corrigido)

- Evidências:
  - Hooks: `src/hooks/usePublicMatches.ts:46`, `src/hooks/usePublicMatch.ts:23`, `src/hooks/usePublicAthletes.ts:33`, `src/hooks/usePublicPlayerRankings.ts:101`, `src/hooks/usePublicTeamRankings.ts:66`, `src/hooks/usePublicSponsors.ts:112`, `src/hooks/usePublicDestaquesDoDia.ts:29`, `src/hooks/usePublicBirthdays.ts:32`
  - Rotas slugadas: `src/app/(public)/[slug]/register/page.tsx:15`, `src/app/(public)/[slug]/login/page.tsx:15`, `src/app/(public)/[slug]/entrar/page.tsx:15`, `src/app/(public)/[slug]/partidas/times-do-dia/page.tsx:15`
- Resultado:
  - Fluxos slugados não dependem mais de tenant default implícito.

### F) Placeholder de verificação SEO removido (corrigido e validado em produção)

- Evidências:
  - `src/app/layout.tsx:16`
  - `src/app/layout.tsx:94`
  - `view-source:https://app.fut7pro.com.br/`
  - `view-source:https://app.fut7pro.com.br/vitrine`
- Resultado:
  - O placeholder fixo foi removido e a verificação Google usa env (`GOOGLE_SITE_VERIFICATION` com fallback opcional `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`), com confirmação de propriedade concluída no Search Console.

### G) Empty-state público sem dados artificiais (corrigido)

- Evidências:
  - `src/components/layout/Sidebar.tsx:193`
  - `src/components/layout/Sidebar.tsx:363`
  - `src/hooks/useJogosDoDia.ts:18`
  - `src/hooks/usePublicSponsors.ts:81`
- Resultado:
  - Removidos fallbacks fictícios e placeholders sintéticos; estados vazios agora exibem mensagens editoriais e dados reais publicados.

### H) Política sem fallback default em rotas públicas não slugadas (corrigido)

- Evidências:
  - `src/app/(public)/page.tsx:241`
  - `src/app/(public)/partidas/times-do-dia/page.tsx:7`
  - `src/app/(public)/partidas/times-do-dia/page.tsx:22`
  - `src/context/RachaContext.tsx:53`
- Resultado:
  - O fallback implícito para tenant default foi removido; rotas públicas sem slug passam a usar apenas contexto explícito (slug da URL ou slug ativo em cookie), sem hardcode de tenant.

### I) Smoke E2E funcional público com slugs reais (concluído)

- Evidências:
  - `tests/public/public-smoke-functional.spec.ts:56`
  - Execução Playwright em produção (`PLAYWRIGHT_BASE_URL=https://app.fut7pro.com.br`) com slugs reais `vitrine,chelsea`
  - Resultado: `3 passed` (Chromium, Firefox, WebKit)
- Resultado:
  - Rotas públicas principais `/:slug/**` responderam com sucesso e sem sinais de conteúdo mock/placeholder no conteúdo visível.

## Resultado de Prontidão (Go-Live Público)

- **Aprovado para go-live operacional público** nesta revisão final.
- Não há bloqueios críticos/altos/médios abertos no escopo desta auditoria documental/estrutural.

## Próxima Etapa Recomendada (ordem de execução)

1. Revalidar no Search Console nos próximos ciclos para confirmar crescimento de indexação via sitemap por slug.
2. Monitorar métricas de erro/latência das rotas públicas em produção por 24-72 horas pós-go-live.
