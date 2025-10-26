# Auditoria Fut7Pro Web — 18/10/2025

Este documento consolida a auditoria do módulo `fut7pro-web` (app.fut7pro.com.br) com base no README_DEV_GUIDE.md e ESPECIFICACAO_FUT7PRO_WEB.md. Serve como referência única para status, gaps e plano de conclusão para produção/vendas.

## Resumo Executivo

- Estado geral: parcialmente alinhado à especificação; dados reais de patrocinadores e classificação pública já expostos, mas ainda faltam integrações de rankings individuais e analytics para o go-live comercial.
- Pilares sólidos: App Router (público/admin), SEO/headers de segurança, PWA básico, NextAuth integrado ao backend, fallback robusto para "jogos do dia", estrutura multi-tenant, testes E2E/CI.
- Pipeline E2E (18/10): 15 passed, 4 skipped, 0 failed. Backend ouvindo em http://127.0.0.1:3333, CORS/health OK. Fase 1 (Sorteio) cravada com dados reais.
- Gaps críticos: uso de Prisma no web em produção (contraria a especificação), rankings individuais/destaques ainda servidos via mocks, cadastros públicos/fluxos sem delegar ao backend, relatórios/exportações incompletos, notificações/engajamento sem integração real.

## Andamento por Módulo

- Core
  - Sorteio Inteligente: parcialmente implementado (algoritmo e UI ok; dados/estrelas não persistem; usa mocks).
  - Rankings & Estatísticas: parcialmente implementado (agregadores e algumas rotas; classificação pública já consome backend multi-tenant, mas faltam títulos automáticos, rankings individuais e filtros completos em todas as telas).
  - Gestão Financeira: parcialmente implementado (tipos/UI, superadmin com agregação; exportações e delegação total ao backend pendentes).
  - Mobile/PWA: em grande parte pronto (manifest/meta/assets; UX responsiva consistente).
- Engagement
  - Gamificação & Conquistas: parcial (estrutura de campeões; faltam ícones/títulos automáticos e gatilhos pós‑partida).
  - Notificações & Engajamento: parcial (telas/hooks prontos; falta backend real, rotas do web inconsistentes).
- Monetização
  - Patrocinadores: parcial (CRUD/backoffice integrado ao backend multi-tenant e site público revalidando automaticamente; faltam métricas/UTM, relatórios e analytics de clique).
- Enterprise
  - Multi‑Admin & Auditoria: parcial (RBAC/roles; logs e exportações via backend pendentes).
  - Multi‑Rachas & Multi‑Local: parcial (middleware/context; integração final por tenant pendente em fluxos).
  - Segurança & Confiabilidade: bom baseline (CSP/headers/robots). Desvio: Prisma no web em produção.
- Analytics
  - Relatórios & Exportações: parcial (placeholders; implementar no backend e consumir via web).
- Developer
  - Integrações & APIs: parcial (NextAuth → backend; proxies públicos). Falta consolidar 100% do consumo via backend.

## O que já foi feito

- Estrutura App Router com grupos público/admin/superadmin.
- SEO/segurança: headers fortes, robots, sitemap.
- Multi‑tenant: header `x-tenant-slug` via middleware + contexts (`Tenant`/`Racha`).
- Autenticação: NextAuth com Credentials/Google delegando a `BACKEND_URL`; refresh/perfil via backend.
- Fallback público para "jogos do dia": backend → ssl-fix → mock → static.
- Estatísticas: agregadores server-side e endpoints iniciais.
- Patrocinadores multi-tenant: painel admin consumindo backend real, tags de revalidação (`sponsors:{slug}`/`footer:{slug}`) e rota pública `/api/public/sponsors` alimentando carrossel/footer.
- Classificação pública dos times: rota `/api/public/team-rankings` com fallback seguro e card do dashboard consumindo backend.
- Testes e CI: Playwright E2E, SEO check, workflows.

## O que falta

- Remover acesso direto ao DB em produção (usar apenas API do backend).
- Substituir mocks restantes: rankings individuais (artilheiros/assist�ncias/melhores por posi��o), destaques e widgets de dashboard.
- Fluxo de cadastro público de atletas (solicitações/approvals) 100% via backend.
- Relatórios/exportações (PDF/CSV/XLSX) implementados no backend e consumidos pelo web.
- Notificações/engajamento via endpoints reais; corrigir hooks para usar backend.
- Padronização de variáveis de ambiente (`NEXT_PUBLIC_API_URL` → domínio oficial) e revalidate on‑demand em publicações.
- Auditoria/logs centralizados no backend, expostos ao web somente via API.
- Endpoint p�blico consolidado de times (logo, varia��o) para eliminar fallbacks locais no ranking.

## Status de Produção

- Em produção: app na Vercel (domínio oficial), fallback de “jogos do dia”, NextAuth com backend, segurança/SEO.
- Fora do padrão: Prisma em produção por rotas do web; mocks ativos em módulos críticos; cadastro/solicitações de atletas no web; exportações e notificações pendentes.

## Riscos e Desvios

- Prisma no web em produção (rotas Pages/API e alguns endpoints App Router) contraria a especificação (web não acessa DB em prod).
- Inconsistências de consumo de API: hooks/rotas locais versus backend ainda presentes nos rankings individuais e destaques.
- Mocks em componentes críticos (sorteio avançado, rankings individuais, destaques) podem gerar divergência de dados.
- `NEXT_PUBLIC_API_URL` divergente do domínio oficial pode gerar CORS/cache inconsistentes.
- Backend ainda não expõe endpoint consolidado de times; ranking público depende de fallback local para logos/variação.
- Backend ainda não expõe endpoint consolidado de times; ranking público depende de fallback local para logos/variação.

## Plano Cirúrgico (Checklist por Fases)

- [x] Fase 0 - Congelar acesso ao DB no web em produção (1-2 dias)
  - [x] Guard global: se `NODE_ENV=production` e `DISABLE_WEB_DIRECT_DB=true`, bloquear Prisma no web (erro claro e identificável).
  - [x] Rotas App Router sensíveis devolvem 501 em prod quando DB direto estiver bloqueado.
  - [x] Rotas Pages API com Prisma devolvem 501 em prod (transitório) até migração para backend.
  - [x] Documentar `DISABLE_WEB_DIRECT_DB=true` nas variáveis (Vercel/produção) e alinhar `NEXT_PUBLIC_API_URL`.

- [ ] Fase 1 - Dados Reais (3-5 dias)
  - [x] Sorteio: `useJogadoresRacha(rachaId)` consumindo backend; integrar jogadores/times reais; publicar via backend; persistir estrelas (config localStorage por ora).
  - [ ] Cadastro/solicitações de atletas: tela admin integrada às rotas `/api/admin/solicitacoes*` (Next.js API, Prisma dev-only), com aprovação/rejeição e flag `autoAprovarAtletas` no racha. Iniciado.
  - [x] Patrocinadores: CRUD básico integrado às rotas  `/api/admin/patrocinadores` (Next.js API, Prisma dev-only), substituindo mocks no painel e refletindo no site público via tags de revalidação. 
  - [ ] Rankings públicos: consumir backend multi-tenant para artilheiros/assistências/melhores por posição; manter fallback seguro até API completa. Em andamento (classificação dos times já integrada).
  - [ ] (Opcional) Seeds p/ cobrir testes skipped: rate limit e publish com slug inválido no runner E2E.

---

## Regras do Sorteio Inteligente (Obrigatórias)

Resumo objetivo das regras e status de conformidade:

- Balancear força geral por métrica composta (OK)
  - Composição: estrelas + ranking + vitórias/partida. Implementado em `getCoeficiente()` (maior peso para estrelas no início; aumenta peso do ranking conforme o racha acumula jogos).

- Balancear posições de linha (OK — serpentina + balanceamento por posição)
  - Meta: distribuir zagueiros, meias e atacantes de forma equivalente entre os times.
  - Implementação: distribuição em rounds zigue‑zague com escolha da posição de menor contagem na equipe (desempate por disponibilidade), após garantir 1 GOL/Time. Heurística leve ativada no draft de picks.

- Goleiro obrigatório (OK)
  - Exatamente 1 goleiro por time.
  - Se faltarem goleiros reais, o sistema completa com “goleiros fictícios” de 3 estrelas.
  - Esses goleiros fictícios são marcados como não ranqueáveis (não entram em rankings/estatísticas/pontuação) – ver flags `isFicticio` e `naoRanqueavel` no tipo `Participante`. Na serialização de publicação são enviados com `status: "ausente"` para os agregadores atuais ignorarem-no em estatísticas.

- Goleiros excedentes (PARCIAL)
  - Regra: se sobrarem goleiros reais além do número de times, ficam como substitutos (a menos que tenham posição de linha cadastrada).
  - Implementação atual: como o cadastro não contém multi‑posição, os goleiros excedentes são realocados como jogador de linha (fallback “ZAG”) apenas para manter o tamanho dos elencos. TODO: quando houver suporte a multi‑posição/bench explícito, manter excedentes como suplentes por padrão ou realocá‑los conforme posição secundária.

- Mensalistas selecionados por padrão (OK)
  - Na seleção inicial, mensalistas já aparecem marcados como participantes do dia (tela Administrativa > Sorteio).

- Draft serpentina “zigue‑zague” (OK)

- Goleiro fictício disponível na seleção (OK)
  - Ao definir o número de times, os cards de seleção de jogadores passam a exibir até N goleiros fictícios (onde N = número de times) como opções adicionais aos atletas reais. Permite ao admin completar o elenco caso vá faltar goleiro.
  - Fluxo: após garantir 1 goleiro por time, ordena todos os jogadores de linha por força composta e distribui por rounds: ida T1..TN, volta TN..T1, repetindo até completar o elenco (ex.: com 4 times e 7 atletas por time: 6 rounds de linha após os goleiros, alternando a ordem a cada volta).

Referências de código

- Regra de força composta: `src/utils/sorteioUtils.ts: getCoeficiente()`
- Algoritmo atualizado do sorteio: `sortearTimesInteligenteV2()` em `src/utils/sorteioUtils.ts`
- Flags para goleiro fictício e não ranqueável: `src/types/sorteio.ts`

Observações e próximos passos

- Goleiros excedentes: quando o domínio suportar multi‑posição ou banco formal, aplicar a regra de "suplentes por padrão" e realocar só quem tiver posição de linha.
- Cadastro/Solicitações: rotas locais (Next.js API) habilitadas para dev/homolog; em produção seguem bloqueadas por `DISABLE_WEB_DIRECT_DB`. Próximo: delegar para backend Nest.
- Patrocinadores: CRUD básico integrado (rotas locais). Próximo: métricas/UTM, visibilidade pública e relatórios via backend Nest; remover mocks restantes.

- [ ] Fase 2 — Relatórios e Publicação Cruzada (2–4 dias)
  - [ ] Exportações (financeiro/patrocinadores/rankings) via backend (PDF/CSV/XLSX) e consumo no web.
  - [ ] Revalidate on‑demand ao publicar campeões/destaques/patrocinadores/partidas.

- [ ] Fase 3 — Notificações & Polimento (2–3 dias)
  - [ ] Notificações: unificar hooks para backend; listar/ler/apagar; integrações e‑mail/WhatsApp quando disponíveis.
  - [ ] SEO/Performance: revisão Lighthouse/Playwright‑SEO para páginas‑chave.

- [ ] Fase 4 — Deploy estável e handover (1–2 dias)
  - [ ] Ambiente padronizado (`NEXT_PUBLIC_API_URL`/`BACKEND_URL`); remover fallback de mocks.
  - [ ] Testes E2E atualizados (publicar site/sorteio/rankings) e CI verde; checklist de produção ok.

---

Atualize as caixas acima conforme as fases avancem. Este documento deve acompanhar cada entrega até o go‑live comercial.
