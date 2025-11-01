# Fut7Pro Web — Especificação Funcional

Aplicação web multi-tenant (painel do racha + site público) que oferece todas as ferramentas para gestão profissional de rachas de Futebol 7. Este documento descreve, de forma objetiva, o escopo funcional, módulos, fluxos, entidades e critérios de pronto para produção do módulo `fut7pro-web` (app.fut7pro.com.br).

## Visão Geral

- Objetivo: permitir que um racha opere de forma profissional com sorteio inteligente, rankings, finanças, patrocínios, comunicação, auditoria e relatórios — tudo integrado ao site público.
- Público-alvo: presidentes de racha e administradores (painel), atletas (mínimo acesso) e visitantes (site público).
- Arquitetura: multi-tenant com isolamento lógico por racha; site responsivo, mobile-first e PWA-ready; LGPD-ready.

## Ambiente & Integração

- Deploy: Vercel (`app.fut7pro.com.br`), com NextAuth integrado ao backend (Render, `api.fut7pro.com.br`).
- Base de API (produção): `NEXT_PUBLIC_API_URL=https://api.fut7pro.com.br`. Em servidor, `API_URL`/`BACKEND_URL` podem ser usados.
- Autenticação: use os paths do backend Nest (sem proxy do Next):
  - `AUTH_LOGIN_PATH=/auth/login`, `AUTH_REFRESH_PATH=/auth/refresh`, `AUTH_ME_PATH=/auth/me`.
  - Remova `AUTH_SECRET` e mantenha apenas `NEXTAUTH_SECRET`.
- Banco: Neon (Postgres). Em produção, `DISABLE_WEB_DIRECT_DB=true` para bloquear acesso Prisma nas rotas do Next (usar sempre o backend).
- Storage: Supabase (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, buckets `sponsors`, `public-media`, `private-media`, `temp-uploads`).
- Imagens (next.config): `images.remotePatterns` inclui `*.supabase.co`.

## Escopo do Módulo (Web)

- Painel Admin (presidente/vice/diretores): operação completa do racha, configuração, auditoria e relatórios.
- Site Público do Racha: página do racha com resultados, rankings, perfis de atletas, patrocinadores e calendário (sem acesso a telas administrativas).
- Acesso por link do racha (subdomínio): ex.: `meuracha.fut7pro.com` (exibição pública) e painel autenticado com RBAC.

## Perfis e Acessos (RBAC)

- Presidente: acesso total (inclui transferir/excluir racha, gerir admins, finanças, auditoria).
- Vice-Presidente: acesso amplo com restrições críticas (sem transferência de propriedade).
- Diretor de Futebol: foco em partidas, sorteios, rankings e presenças.
- Diretor Financeiro: controle financeiro e prestação de contas.
- Atleta: acesso ao próprio perfil e resultados; solicitações e confirmações.
- Visitante: acesso público a páginas e rankings permitidos.

## Definição de Pronto (Produção)

O `fut7pro-web` só é considerado pronto para produção quando:

1. Todos os módulos listados em “Módulos Principais” estão implementados e integrados.
2. Painel Admin e Site Público estão interligados (dados coerentes, permissões aplicadas, publicação controlada).
3. Multi-tenant com isolamento lógico, TLS/HTTPS e LGPD atendidos.
4. Exportações (PDF/CSV/XLSX) e relatórios funcionais por período/evento.
5. Auditoria completa (quem fez o quê e quando) e RBAC efetivo.
6. PWA/mobile-ready com boa performance em conexões comuns.
7. Integrações essenciais habilitadas (e-mail e ao menos 1 canal de push/WhatsApp) e webhooks básicos de eventos.

---

## Módulos Principais

### Core

- Sorteio Inteligente
  - Times equilibrados via coeficientes (rankings, posição e estrelas do admin).
  - 6 rankings usados no balanceamento: Geral, Posição, Gols, Assistências, Pontuação, Frequência.
  - Anti-panelinha (diversificação de combinações; evita repetições) e ajustes manuais pós-sorteio.
- Rankings & Estatísticas
  - 7 rankings públicos: Classificação dos Times, Ranking Geral, Artilheiros, Assistências, Melhores por Posição, Tira-teima, e (Admin) Assiduidade.
  - Cálculo automático após partidas; filtros por período (mês/quadrimestre/ano/histórico).
- Gestão Financeira
  - Lançamentos por categoria (receitas/despesas), filtros por período, gráficos e exportações.
  - Visibilidade pública/privada seletiva e prestação de contas.
- Mobile-Ready & PWA
  - Acesso direto via site, responsivo e touch-friendly; desempenho otimizado.

### Engagement

- Gamificação & Conquistas
  - Conquistas anuais/quadrimestrais; níveis de assiduidade; perfil público do atleta com histórico e tira-teima.
- Notificações & Engajamento
  - Lembretes/confirmar presença; alertas de ranking/prêmios; mensagens e comunicados; aprovação de atletas.

### Monetização

- Gestão de Patrocinadores
  - Cadastro/visibilidade no site; carrossel de logos; UTM/click tracking; relatórios mensais (PDF).
  - Requisitos detalhados:
    - Publicação automática: ao salvar no admin (`/admin/financeiro/patrocinadores`), publicar em `/{slug}/sobre-nos/nossos-parceiros` e no carrossel do rodapé, com mesma ordem.
    - Modal (Parte 1 – Conteúdo): logo (upload), nome (obrigatórios); ramo, sobre, link (URL), cupom, benefício (opcionais). Card público clica no link em nova aba.
    - Modal (Parte 2 – Finanças & Tempo): valor, período início/fim; status automático por data: `em_breve` (faltam 30 dias para início), `ativo` (entre início e fim), `expirado` (após fim). Ocultar `expirado` no público; exibir badge "Em breve" quando aplicável.
    - Ordem e Tiers: `displayOrder` (inteiro) e `tier` (`basic`|`plus`|`pro`). Ordenar por tier (pro>plus>basic), depois `displayOrder` asc, depois `atualizadoEm` desc. `showOnFooter` decide presença no rodapé; `plus`/`pro` aparecem por padrão.
    - Validação de link e upload: normalizar `https://`, bloquear `javascript:` e esquemas inseguros, validar contra domínios permitidos (config). Upload em storage (Supabase/S3) com URL assinada; aceitar imagens até 2MB (png/jpg/webp/svg sanitizado).
    - Notificações e Dashboard: notificar "a expirar" (30 dias antes do fim) e "expirado"; widget "Patrocínios a expirar" no Dashboard (filtro 30 dias).
    - Auditoria: registrar `createdById` e `updatedById` em todas as mudanças.
    - Revalidação: cada alteração dispara `revalidateTag('sponsors:{slug}')` e `revalidateTag('footer:{slug}')`.

### Enterprise

- Multi-Admin & Auditoria
  - Hierarquia (Presidente, VP, Diretores) com permissões granulares; logs de auditoria.
- Multi-Rachas & Multi-Local
  - Suporte a múltiplos rachas/unidades e múltiplos dias/horários por racha.
- Segurança & Confiabilidade
  - Isolamento por tenant; TLS/HTTPS; backups; LGPD-ready.

### Analytics

- Relatórios & Exportações
  - KPIs por módulo; filtros por período/evento; exportações PDF/CSV/XLSX; compartilhamento.

### Developer

- Integrações & APIs
  - API REST autenticada (JWT), rate limiting, Swagger; webhooks de eventos; integrações de e-mail, push e WhatsApp Business.

---

## Fluxos Essenciais (Detalhes)

### 1) Sorteio Inteligente

- Coeficientes Inteligentes: combinam rankings (6), posição e estrelas (1–5) do admin.
- Anti-panelinha: evita repetições excessivas; rotação inteligente.
- Ajustes Manuais: admin pode arrastar/soltar atletas entre times; validação final de equilíbrio.
- Processo: (1) Análise de histórico → (2) Cálculo de coeficientes → (3) Distribuição → (4) Validação.

### 2) Rankings & Estatísticas

- Pós-partida: registrar gols, assistências e presenças; o sistema atualiza rankings automaticamente.
- Pontuação Geral: vitória +3, empate +1, derrota 0 (sem bônus por gol/assistência no ranking geral).
- Rankings por Posição: competição especializada (atacante, meia, zagueiro, goleiro) baseada em pontos de equipe.
- Filtros: quadrimestre, temporada atual, histórico.

### 3) Gamificação & Conquistas

- Conquistas anuais e quadrimestrais (melhor do período, artilheiro, maestro, campeão, por posição).
- Níveis de Assiduidade: Novato, Juvenil, Titular, Destaque, Veterano, Lenda (com marcos de jogos).
- Perfil do Jogador: histórico, conquistas, evolução e tira-teima (comparador).
- Feed de Conquistas: registro público/semipúblico; notificações automáticas.

### 4) Notificações & Aprovação de Atletas

- Tipos: sistema, superadmin, mensagem, pendência, financeiro, novidade.
- Aprovação Manual: cadastro gera solicitação; admin recebe notificação com aprovar/rejeitar; dashboard de pendências.
- Comunicados: gerais por tenant e específicos por racha/evento; comentários; chat básico entre jogadores.
- Sugestões: envio por atletas; status (pendente/respondida/recusada); analytics de engajamento.

### 5) Patrocínios

- Gestão: até 10 patrocinadores; planos e benefícios configuráveis; período de vigência; comprovantes anexos.
- Visibilidade: rodapé/carrossel, página de patrocinadores; links/UTM e contagem de cliques.
- Relatórios: métricas de visitas/cliques; exportação PDF para prestação de contas.

### 6) Gestão Financeira

- Lançamentos: receitas (mensalidades, patrocínios, eventos) e despesas (campo, material, arbitragem, etc.).
- Filtros: mês, quadrimestre, ano, histórico; combinações; resumo e gráfico de evolução.
- Visibilidade: transparente/privada/seletiva; exportações e relatórios.

### 7) Multi-Admin & Auditoria

- RBAC: permissões por módulo (rachas, usuários, finanças, analytics, auditoria).
- Logs: quem fez o quê e quando; dados antes/depois; IP/dispositivo; exportação de logs.

### 8) Multi-Rachas & Multi-Local / Multi-Horários

- Configurar múltiplos dias/horários por racha (manhã/tarde/noite); feriados; temporadas/pausas.
- Próximos jogos automáticos; calendário por racha/local; relatórios consolidados.

### 9) Mobile-Ready & PWA

- Acesso por navegador; layout responsive; botões/gestos touch; cache e lazy loading.
- Registro de partidas e upload de fotos direto do campo.

### 10) Relatórios & Exportações

- Engajamento: acessos, usuários ativos, tempo de sessão, funcionalidades mais usadas.
- Performance: rankings por posição e período, gols/assistências, presenças, evolução.
- Financeiro: receitas/despesas por categoria, fluxo de caixa, prestação de contas.
- Patrocínios: visitas/cliques e ROI por patrocinador.
- Formatos: PDF (apresentação), CSV e XLSX.

### 11) Segurança & Confiabilidade

- Multi-tenant: isolamento lógico por tenant/racha; acesso restrito por domínio/subdomínio.
- TLS/HTTPS, headers de segurança (CSP/HSTS), backups automáticos e redundância.
- LGPD: dados mínimos; consentimento; exclusão/portabilidade; logs e relatórios de compliance.
- Monitoramento: health checks, métricas, alertas de segurança/performance; resposta a incidentes (detecção → análise → contenção → recuperação).

### 12) Integrações & APIs

- API Pública: JWT, rate limiting, documentação Swagger, auditoria.
- Webhooks: jogador.novo, partida.criada, pagamento.recebido, ranking.atualizado (payloads padronizados).
- Mensageria: e-mail (ex.: SendGrid), push (ex.: OneSignal), WhatsApp Business API; SMS (Twilio, opcional).
- Pagamentos: Mercado Pago (PIX, cartão, boleto), faturamento automático (admins) e webhooks de status.
- Analytics/Marketing: Google Analytics, Meta Pixel/Conversion API, Hotjar, Google My Business.
- Calendário: integração com Google Calendar (sincronização e lembretes).

---

## Entidades de Domínio (alto nível)

- Tenant/Racha, Local, Usuário, AdminRole, Permissão
- Atleta, Posição, Time, Partida, Presença, Gol, Assistência
- Ranking (Geral, Posição, Gols, Assistências, Pontuação, Frequência), Classificação de Times
- Conquista, Nível de Assiduidade, Destaques do Dia
- Patrocinador, Plano/Período, Métricas (visitas/cliques), Comprovante
- Lançamento Financeiro (categoria, valor, data, visibilidade)
- Notificação, Comunicado, Mensagem, Sugestão, Pendência
- Relatório, Exportação, KPI
- AuditoriaLog, SecurityEvent, WebhookEvent

## Navegação (alto nível)

- Público: Home, Calendário, Resultados de Sorteios, Rankings (Geral/Times/Artilheiros/Assistências/Posição), Perfil do Atleta, Patrocinadores, Regras/Contato.
- Admin: Dashboard, Jogadores, Partidas/Sorteio, Rankings/Conquistas, Financeiro, Patrocinadores, Notificações/Comunicados, Relatórios, Auditoria, Configurações (racha/local/horários/tenant).

## Segurança, Privacidade e Compliance

- LGPD: base legal, consentimento, transparência, direitos dos titulares, DPO e relatório de impacto quando aplicável.
- Proteção: TLS 1.3, CSP/HSTS, hashing de senhas, rotação de chaves; RTO/RPO alinhados a metas de disponibilidade.
- Observabilidade: logs estruturados (aplicação, auditoria, segurança), métricas e alertas.

## Checklist de Implementação (atualize o status)

- [ ] Sorteio inteligente (coeficientes, 6 rankings, anti-panelinha, ajustes manuais)
- [ ] Rankings & estatísticas (7 rankings públicos + assiduidade admin; filtros/periodização)
- [ ] Gamificação & conquistas (anuais/quadrimestrais; níveis de assiduidade; perfil público)
- [ ] Notificações, comunicados e aprovação de atletas (workflow completo)
- [ ] Patrocínios (cadastro, visibilidade, métricas e relatórios PDF)
- [ ] Financeiro (categorias, filtros por período, gráficos e exportações)
- [ ] Multi-admin & auditoria (RBAC granular e logs exportáveis)
- [ ] Multi-rachas/locais e multi-horários (feriados/temporadas)
- [ ] Mobile-ready & PWA (performance e UX touch)
- [ ] Relatórios & exportações (PDF/CSV/XLSX; compartilhamento)
- [ ] Segurança & confiabilidade (TLS, backups, LGPD, monitoramento)
- [ ] Integrações & APIs (REST, webhooks, e-mail, push, WhatsApp, pagamentos)
- [ ] Interligação painel ↔ site público (publicação/visibilidade por permissão)

## Referências Internas

- README do módulo: `fut7pro-web/README.md`
- Guia do dev (módulo): `fut7pro-web/README_DEV_GUIDE.md`
- Multi-tenant (implementação): `fut7pro-web/IMPLEMENTACAO_MULTI_TENANT.md`
- Variáveis/ambiente/deploy: `fut7pro-web/ENV_SETUP.md`, `fut7pro-web/ENV_PRODUCTION.md`, `fut7pro-web/VERCEL_ENV_FINAL.md`, `fut7pro-web/VARIAVEIS_VERCEL.md`
- SSL/Segurança: `fut7pro-web/VERCEL_ENV_FINAL.md`

---

Atualize este documento conforme os módulos evoluírem. Ele é a referência para entender o propósito do `fut7pro-web`, seus requisitos e o que precisa estar pronto para produção.

---

## Infra & Produção (Obrigatório)

### Vercel (Deploy & Ambientes)

- Projeto: fut7pro-web
- Branch mapping:
  - `main` → Production
  - `develop` (ou `feature/*`) → Preview
- Build: `pnpm install && pnpm build`
- Output: Next.js (App Router)
- Logs: Vercel Logs + Sentry (frontend)
- Revalidação/Cron: on-demand revalidate ao publicar/editar partidas, campeões/destaques do dia e patrocinadores.

### Environment Matrix (Web)

Observação: o web não acessa DB direto em produção; toda leitura/escrita vem da API do backend. Os valores reais residem nos ambientes Vercel (Project Settings → Environment Variables) e arquivos `.env.local` apenas em dev.

| Nome                              | Prod     | Preview/Dev | Observações                                 |
| --------------------------------- | -------- | ----------- | ------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`             | ✅       | ✅          | Ex.: https://app.fut7pro.com.br             |
| `NEXT_PUBLIC_API_URL`             | ✅       | ✅          | Base pública da API do backend              |
| `BACKEND_URL`                     | ✅       | ✅          | Base privada para server actions/middleware |
| `NEXTAUTH_URL`                    | ✅       | ✅          | Igual ao domínio atual                      |
| `NEXTAUTH_SECRET`                 | ✅       | ✅          | Rotacionável                                |
| `DISABLE_WEB_DIRECT_DB`           | true     | opcional    | Bloqueia Prisma no web em prod              |
| `NEXT_PUBLIC_GA_ID`               | opcional | opcional    | Google Analytics (se usado)                 |
| `SENTRY_DSN`                      | opcional | opcional    | Erros frontend (server/client)              |
| `NEXT_PUBLIC_IMAGES_CDN`          | opcional | opcional    | Base de imagens (Supabase/S3/CDN)           |
| `NEXT_PUBLIC_DEFAULT_TENANT_SLUG` | —        | ✅          | Útil em dev local                           |
| `MP_*` / `MP_WEBHOOK_SECRET`      | ✅       | ✅          | Mercado Pago (se habilitado)                |
| `SMTP_*`                          | opcional | opcional    | E-mail transacional via provider            |

Outras variáveis existentes no repositório devem seguir o mesmo critério: públicas apenas se necessárias no cliente (`NEXT_PUBLIC_*`), privadas no server (sem prefixo).

### Cache, SSR/ISR e Revalidação

- Páginas públicas por slug do racha: usar ISR com `revalidate` (ex.: 60–300s) + on-demand revalidate quando o admin:
  - publicar “Campeão do Dia”/destaques
  - finalizar partidas/estatísticas
  - alterar patrocinadores
- Páginas sensíveis/dinâmicas (perfil logado/admin): `export const dynamic = 'force-dynamic'`.
- API routes do web (se existirem): cache apenas GET com `Cache-Control: s-maxage=60, stale-while-revalidate=300`.

### Domínios, Slug e Multi‑Tenant

- Estratégia oficial: path-based `/{slug-do-racha}` (ex.: `/rachatop`).
- Middleware: resolver slug do 1º segmento, carregar contexto (404 se não existir).
- Privacidade: se racha “privado”, setar `noindex,nofollow` e excluir do sitemap.
- OG/Social: gerar OG dinâmico por racha com `@vercel/og`.

### SEO Técnico (Obrigatório)

- Head: `<title>` único, `<meta name="description">` específico por página/racha, `<h1 class="sr-only">` para acessibilidade.
- URLs limpas: sem acentos; slugs kebab (ex.: `/tira-teima`, `/gerador-de-times`).
- Sitemaps multi-tenant:
  - `/sitemap.xml` (root) lista todos os slugs ativos.
  - `/{slug}/sitemap.xml` lista páginas públicas daquele racha.
- `robots.txt`: bloquear `/admin` e rotas privadas.
- Canonical: evitar duplicadas entre `/` vs `/{slug}`.

### Imagens & CDN

- `next.config.*` → `images.remotePatterns` incluir storages:
  - Supabase: `*.supabase.co`
  - S3/R2: `${bucket}.s3.${region}.amazonaws.com` ou CDN equivalente
- Fallbacks: `alt` obrigatório; avatar default; `priority` apenas no LCP.

### Segurança HTTP

- Headers via middleware (base Helmet/next-safe):
  - Content-Security-Policy: `img-src` incluindo Supabase/S3; `connect-src` incluindo backend.
  - Strict-Transport-Security (HSTS).
  - Referrer-Policy: `strict-origin-when-cross-origin`.
  - Cookies/Auth: `Secure`, `HttpOnly`, `SameSite=Lax`.

### LGPD & Consentimento

- Banner de consentimento para Analytics/Pixel com categorias granulares.
- Páginas de Termos e Privacidade; direito de exclusão/portabilidade documentado.

### Observabilidade

- Sentry (frontend) para erros de UI e falhas em chamadas do web.
- Vercel Analytics + Web Vitals (`reportWebVitals`) com envio ao backend/GA.
- Logs/auditoria já descritos no módulo Enterprise.

### Acessibilidade (a11y)

- Checks automáticos nas rotas públicas (contrast, focus, landmarks).
- `h1` com `sr-only` quando necessário; foco visível; labels e `aria-*` consistentes.

### Testing e CI

- Separação: Jest (unit/integration) e Playwright (e2e/SEO/a11y).
- Gates em PR: `pnpm lint`, `pnpm typecheck`, `pnpm test -i` e Lighthouse CI nas páginas públicas.
- A11y: `@axe-core/playwright` nas rotas principais.
- Perf budget: LCP < 2.5s (3G Fast), TBT < 200ms nas páginas críticas.

### Feature Flags

- `NEXT_PUBLIC_FEATURE_*` para toggles de UI/rota pública.
- Server flags (sem `NEXT_PUBLIC_`) para habilitar módulos em rollout gradual.
- Futuro: Unleash/ConfigCat para controle remoto.

### Guard‑rail: bloquear DB direto em produção

Manter documentado e ativo para evitar regressões. O web não deve instanciar Prisma em produção; use a API do backend.

```ts
// src/server/prisma.ts (web)
if (process.env.NODE_ENV === "production" && process.env.DISABLE_WEB_DIRECT_DB === "true") {
  throw new Error("Direct DB access is disabled in production. Use backend API.");
}
```

### Pequenas Políticas e PWA

- Imagem de perfil: máx. 1MB; formatos jpeg/png/webp; 512×512; crop central.
- Revalidação: endpoints do backend devem disparar `revalidateTag()/revalidatePath()` após publicações.
- PWA (futuro): `manifest.json` e service worker com `stale-while-revalidate` apenas para assets estáticos.
