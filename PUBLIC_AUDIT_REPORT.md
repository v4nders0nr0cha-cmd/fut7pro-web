# PUBLIC AUDIT REPORT

Data: 2026-02-20 (revalidação pós-hotfixes + validação em produção)  
Escopo: `src/app/(public)/**`, `src/app/api/public/**`, `src/components/layout/**`, `src/hooks/usePublic*`.

## Resumo Executivo

- Status geral: **melhorou de forma significativa**, com todos os bloqueios críticos anteriores corrigidos.
- Inventário validado: **105 rotas públicas (`page.tsx`)** e **46 rotas de API pública (`route.ts`)**.
- Resultado atual: **não aprovado ainda para go-live comercial**, por pendências de qualidade em empty-states e fallback residual em rotas não slugadas.

### Evolução desde a auditoria anterior

- ✅ Corrigido risco multi-tenant no proxy público de patrocinadores.
- ✅ Corrigidos links quebrados da Sidebar pública (estatísticas por posição).
- ✅ Removidos placeholders legais/contato em páginas públicas.
- ✅ Endpoints legados públicos de jogos do dia agora retornam `410 Gone`.
- ✅ Fallback de `rachaConfig.slug` removido dos hooks públicos e das rotas públicas slugadas.
- ✅ Verificação Google Search Console concluída com token correto em produção (`google-site-verification`).

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

#### 1) Estado vazio público ainda usa textos/dados artificiais

- Arquivos:
  - `src/components/layout/Sidebar.tsx:194`
  - `src/hooks/useJogosDoDia.ts:15`
  - `src/hooks/useJogosDoDia.ts:16`
  - `src/hooks/usePublicSponsors.ts:58`
- Problema:
  - Ainda existem fallbacks visuais como `Jogador 1`, `Time A`, `Time B`, `placeholder-*`.
- Impacto:
  - Percepção de mock e redução de qualidade comercial no site público.
- Correção recomendada:
  - Trocar para mensagens editoriais reais de empty-state (sem entidades fictícias).

#### 2) Fallback default ainda existe em rotas públicas não slugadas

- Arquivos:
  - `src/app/(public)/page.tsx:242`
  - `src/app/(public)/partidas/times-do-dia/page.tsx:20`
  - `src/context/RachaContext.tsx:54`
- Problema:
  - Para rotas sem slug explícito, ainda há fallback para tenant default.
  - Em rotas slugadas e hooks públicos, esse fallback já foi removido.
- Impacto:
  - Risco residual de comportamento implícito em navegação sem contexto de slug.
- Correção recomendada:
  - Definir política explícita para raiz (`/`) e rotas públicas sem slug:
    - redirecionar para seletor/tenant explícito, ou
    - manter fallback default como decisão de produto documentada.

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

## Resultado de Prontidão (Go-Live Público)

- **Ainda não aprovado para venda** nesta revisão.
- Bloqueios críticos foram resolvidos, porém restam pendências médias de qualidade funcional (empty-state e política de tenant em rotas não slugadas).

## Próxima Etapa Recomendada (ordem de execução)

1. Remover textos/dados artificiais de empty-state (`Jogador 1`, `Time A`, `Time B`, `placeholder-*`).
2. Formalizar política de tenant para rotas públicas não slugadas (`/` e redirects).
3. Executar smoke E2E público final (rotas principais + validações de conteúdo sem mocks).
