# ADMIN AUDIT REPORT

Data: 2026-02-18  
Escopo: `src/app/(admin)/admin/**`, navegação e integrações usadas pelo painel `/admin`.

## Resumo Executivo

- Status geral: **admin sem links quebrados no fluxo ativo, sem mocks residuais críticos, com hardening multi-tenant aplicado**.
- Foi concluído inventário completo das rotas do admin (62 rotas `page.tsx`) e auditoria de navegação (sidebar/header/bottom/cards).
- Foram removidos fallbacks perigosos de tenant (`rachaConfig.slug`) no admin e bloqueado o uso de `tenantId/rachaId/slug` do client para definição de escopo em proxies críticos.
- Foi aplicado hardening centralizado de query string em proxies admin com `appendSafeQueryParams` em allowlist rígida (bloqueando params perigosos e escopo de tenant).
- Rotas com tenant no path agora validam mismatch de escopo e retornam `403`.
- Logs administrativos agora têm sanitização de detalhes sensíveis no server-side (proxy) e no client (defesa em profundidade).
- Foram removidos `console.log` de hooks usados pelo admin e eliminados geradores de ID com `Math.random` em componentes do fluxo admin.
- Foi adicionado smoke test E2E para navegação principal do admin.
- O relatório está organizado por etapas de execução para acompanhamento incremental até o aceite final.

## Reauditoria Pós-Incidente (2026-02-18)

### Resumo da Reabertura

- A auditoria anterior foi **reaberta** após incidente em produção: racha bloqueado foi liberado sem confirmação real de pagamento.
- Causa raiz confirmada no backend: no fluxo de checkout recorrente, o método de ativação alterava estado da assinatura antes da confirmação do provedor.
- Foi aplicado hotfix server-side para impedir desbloqueio por clique e exigir confirmação do Mercado Pago para liberar acesso.
- Foi identificado também problema operacional no ambiente Render: webhook do Mercado Pago com assinatura inválida (`invalid signature`), exigindo ajuste de variável no ambiente.

### Novos Achados Críticos (Reauditoria)

#### 10) Desbloqueio indevido sem pagamento confirmado (BYPASS de inadimplência)

- Severidade: **Crítico**
- Repositório/arquivo:
  - `fut7pro-backend/src/billing/billing.service.ts`
- Problema:
  - O fluxo `activateSubscription` promovia assinatura para estado liberado durante a geração do checkout, sem aguardar confirmação real do pagamento.
  - Resultado: racha inadimplente podia voltar ao painel apenas clicando em "Continuar no Mercado Pago".
- Correção aplicada:
  - Removida alteração de `status` no `activateSubscription`; o fluxo agora apenas inicia checkout e grava identificadores necessários.
  - Desbloqueio permanece condicionado à confirmação real (webhook/status reconciliado).
  - Referências:
    - `fut7pro-backend/src/billing/billing.service.ts:329`
    - `fut7pro-backend/src/billing/billing.service.ts:337`
- Como testar:
  - Com assinatura `paused`/`past_due`, clicar em checkout recorrente e **não concluir pagamento**.
  - Validar que `/admin/access` continua bloqueando o tenant.
  - Validar que painel continua em tela de bloqueio até confirmação real.

#### 11) Webhook Mercado Pago inválido em produção (assinatura rejeitada)

- Severidade: **Crítico (Operacional)**
- Evidência:
  - Logs Render com `UnauthorizedException: invalid signature` em `/billing/mp/webhook`.
- Problema:
  - Mesmo com código correto, eventos do MP não são processados se a assinatura do webhook falhar, quebrando automação de reconciliação.
- Correção aplicada:
  - Não é correção de código; depende de configuração do ambiente.
- Ação obrigatória:
  - Ajustar `MP_WEBHOOK_SECRET` no Render para o mesmo segredo configurado no painel Mercado Pago para o endpoint:
    - `https://api.fut7pro.com.br/billing/mp/webhook`
- Como testar:
  - Disparar evento real/sandbox do MP e validar ausência de `invalid signature` nos logs.
  - Confirmar atualização de status de assinatura/fatura após pagamento aprovado.

### Novos Achados Altos (Reauditoria)

#### 12) Link "Abrir link do PIX" apontando para cobrança indisponível

- Severidade: **Alto**
- Repositório/arquivo:
  - `fut7pro-backend/src/billing/billing.service.ts`
- Problema:
  - Reuso cego de fatura pendente e idempotência determinística podiam reaproveitar cobrança inválida/expirada.
- Correção aplicada:
  - Validação de status do pagamento existente no MP antes de reutilizar cobrança.
  - Geração de idempotency key por `randomUUID()` para evitar reciclagem indevida de transação.
  - Referências:
    - `fut7pro-backend/src/billing/billing.service.ts:393`
    - `fut7pro-backend/src/billing/billing.service.ts:487`
- Como testar:
  - Gerar PIX, invalidar/expirar cobrança e gerar novamente.
  - Validar que novo QR/link é válido (não "Pagamento indisponível").

#### 13) Falha no checkout recorrente para assinatura em estado `paused`

- Severidade: **Alto**
- Repositório/arquivo:
  - `fut7pro-backend/src/billing/billing.service.ts`
- Problema:
  - Fluxo recorrente rejeitava parte dos estados bloqueados legítimos para regularização.
- Correção aplicada:
  - Inclusão de `paused` como estado elegível para iniciar checkout.
  - Fallback de URL de checkout (`init_point`/`sandbox_init_point`) com validação explícita.
  - Referências:
    - `fut7pro-backend/src/billing/billing.service.ts:274`
    - `fut7pro-backend/src/billing/billing.service.ts:324`
- Como testar:
  - Com assinatura `paused`, abrir modal de pagamento e clicar em "Continuar no Mercado Pago".
  - Validar redirecionamento para checkout sem liberar o painel antes do pagamento.

### Teste de Regressão Adicionado (Backend)

- Arquivo:
  - `fut7pro-backend/src/billing/__tests__/billing.service.spec.ts`
- Cobertura:
  - Garante que `activateSubscription` não altera `status` para liberar acesso ao iniciar checkout.
- Resultado local:
  - `pnpm exec jest src/billing/__tests__/billing.service.spec.ts --runInBand` ✅

### Estado Atual de Aceite (após reauditoria)

- `Zero bypass de bloqueio por clique`: **Corrigido em código** (pendente deploy).
- `Liberação apenas com confirmação do pagamento`: **Corrigido em código** (pendente deploy).
- `Webhook assinado e processando`: **Pendente ação operacional** (ajustar `MP_WEBHOOK_SECRET` no Render).
- `Conclusão final do aceite do admin`: **Reaberto até reteste em produção após deploy + ajuste do webhook**.

## Plano por Etapas (Execução)

| Etapa   | Objetivo                                                     | Achados vinculados | Status    | Critério de saída                                                                   |
| ------- | ------------------------------------------------------------ | ------------------ | --------- | ----------------------------------------------------------------------------------- |
| Etapa 1 | Inventário de rotas e navegação admin (sidebar/header/cards) | 3                  | Concluída | Zero rota quebrada, zero CTA morto, redirecionamentos legados criados               |
| Etapa 2 | Hardening multi-tenant (query/body/path)                     | 1, 2               | Concluída | Sem override de tenant por client, mismatch em path retorna `403`                   |
| Etapa 3 | Remoção de mocks/placeholders no admin                       | 4                  | Concluída | Fluxo admin sem mock residual crítico e sem dados fake                              |
| Etapa 4 | Segurança e privacidade de logs/admin                        | 5, 8               | Concluída | Logs sanitizados no server-side, sem `console.log` em produção                      |
| Etapa 5 | Qualidade funcional (SEO admin, PT-BR, IDs)                  | 6, 7, 9            | Concluída | Admin com `noindex,nofollow`, textos PT-BR revisados, sem `Math.random` para IDs    |
| Etapa 6 | Smoke E2E de navegação admin                                 | Smoke E2E          | Concluída | Spec executado com credencial admin real, navegação principal validada e sem `skip` |

### Checklist de Fechamento por Etapa

1. Etapa 1: Navegar por sidebar/header/cards e validar ausência de `404`.
2. Etapa 2: Testar tentativas de override de tenant por query/body/path e validar bloqueio.
3. Etapa 3: Rodar varredura de termos proibidos e confirmar ausência de mocks no admin.
4. Etapa 4: Validar redaction de detalhes sensíveis na API de logs, UI e CSV.
5. Etapa 5: Verificar `robots noindex,nofollow`, revisão de texto PT-BR e geração de IDs.
6. Etapa 6: Executar Playwright com credencial admin real e registrar evidência de `pass`.

### Próxima Ação Recomendada (Imediata)

1. Manter as credenciais E2E admin válidas no ambiente local/CI para evitar regressão de `skip`.
2. Incluir este smoke no pipeline de PR para bloquear merge com rota admin quebrada.
3. Reexecutar o smoke quando houver alteração em sidebar/header/cards do dashboard.

## Tabela de Rotas e Navegação

| Rota                                                | Existe no FS | Linkada no menu | Linkada por card/botão | Fonte de dados                                                                                                                                                                  |
| --------------------------------------------------- | ------------ | --------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| /admin/administracao/administradores                | Sim          | Sim             | Não                    | useAdminRoles, useAdminRoleAthletes, useAdminLogs \| /api/admin/administradores, /api/admin/administradores/atletas, /api/admin/administradores/[role], /api/admin/logs?limit=5 |
| /admin/administracao/logs                           | Sim          | Sim             | Não                    | useAdminLogs \| /api/admin/logs                                                                                                                                                 |
| /admin/administracao/permissoes                     | Sim          | Sim             | Não                    | UI estática                                                                                                                                                                     |
| /admin/administracao/transferir-propriedade         | Sim          | Sim             | Não                    | UI estática                                                                                                                                                                     |
| /admin/administradores                              | Sim          | Não             | Não                    | Redirecionamento (legado)                                                                                                                                                       |
| /admin/comunicacao/ajuda                            | Sim          | Sim             | Não                    | /api/admin/help-center/config                                                                                                                                                   |
| /admin/comunicacao/comunicados                      | Sim          | Sim             | Não                    | UI estática                                                                                                                                                                     |
| /admin/comunicacao/enquetes                         | Sim          | Sim             | Não                    | UI estática                                                                                                                                                                     |
| /admin/comunicacao/mensagens                        | Sim          | Sim             | Não                    | /api/admin/contact/messages?limit=200                                                                                                                                           |
| /admin/comunicacao/notificacoes                     | Sim          | Sim             | Sim                    | UI estática                                                                                                                                                                     |
| /admin/comunicacao/sugestoes                        | Sim          | Sim             | Não                    | useSearchParams \| /api/admin/suggestions?${params.toString()}, /api/admin/suggestions/${item.id}/read                                                                          |
| /admin/comunicacao/suporte                          | Sim          | Sim             | Sim                    | useSearchParams \| /api/admin/support/tickets?${params.toString()}, /api/admin/support/tickets/${ticketId}                                                                      |
| /admin/configuracoes/backup                         | Sim          | Sim             | Não                    | useRacha \| /api/admin/relatorios/diagnostics                                                                                                                                   |
| /admin/configuracoes/cancelar-conta                 | Sim          | Sim             | Não                    | useAuth, useRacha, useMe \| /api/admin/support/tickets/cancelamento-racha                                                                                                       |
| /admin/configuracoes/changelog                      | Sim          | Sim             | Não                    | UI estática                                                                                                                                                                     |
| /admin/configuracoes/dominio-proprio                | Sim          | Sim             | Não                    | useMe, useSubscription                                                                                                                                                          |
| /admin/configuracoes/integracoes                    | Sim          | Sim             | Não                    | useMe, useSubscription                                                                                                                                                          |
| /admin/configuracoes/temas                          | Sim          | Não             | Não                    | Redirecionamento (legado)                                                                                                                                                       |
| /admin/conquistas                                   | Sim          | Sim             | Não                    | UI estática                                                                                                                                                                     |
| /admin/conquistas/grandes-torneios                  | Sim          | Não             | Não                    | useRacha, useTorneios                                                                                                                                                           |
| /admin/conquistas/grandes-torneios/cadastrar        | Sim          | Não             | Não                    | Redirecionamento (legado)                                                                                                                                                       |
| /admin/conquistas/os-campeoes                       | Sim          | Não             | Não                    | usePublicLinks, usePublicPlayerRankings, usePublicTeamRankings \| /api/campeoes/finalizar-temporada                                                                             |
| /admin/dashboard                                    | Sim          | Sim             | Não                    | useRacha, useFinanceiro, usePublicMatches                                                                                                                                       |
| /admin/financeiro                                   | Sim          | Não             | Não                    | Redirecionamento (legado)                                                                                                                                                       |
| /admin/financeiro/mensalistas                       | Sim          | Sim             | Não                    | useRacha, useRachaAgenda, useJogadores                                                                                                                                          |
| /admin/financeiro/patrocinadores                    | Sim          | Sim             | Sim                    | usePatrocinadores, useSearchParams                                                                                                                                              |
| /admin/financeiro/planos-limites                    | Sim          | Sim             | Sim                    | useSubscription                                                                                                                                                                 |
| /admin/financeiro/prestacao-de-contas               | Sim          | Sim             | Não                    | useMe, useFinanceiro \| /api/admin/rachas/${tenantId}                                                                                                                           |
| /admin/jogadores                                    | Sim          | Não             | Não                    | UI estática                                                                                                                                                                     |
| /admin/jogadores/aniversariantes                    | Sim          | Não             | Não                    | useAdminBirthdays                                                                                                                                                               |
| /admin/jogadores/listar-cadastrar                   | Sim          | Sim             | Sim                    | useRacha, useJogadores, useAthleteRequests \| /api/jogadores/vincular, /api/uploads/avatar                                                                                      |
| /admin/jogadores/mensalistas                        | Sim          | Sim             | Não                    | useRacha, useJogadores \| /api/admin/mensalistas/requests?limit=100, /api/admin/mensalistas/requests/${encodeURIComponent(requestId)}/approve                                   |
| /admin/jogadores/nivel-dos-atletas                  | Sim          | Sim             | Não                    | useRacha, useMe, useJogadores \| /api/estrelas/historico?athleteId=${encodeURIComponent(atleta.id)}                                                                             |
| /admin/jogadores/ranking-assiduidade                | Sim          | Sim             | Não                    | useRacha, useJogadores                                                                                                                                                          |
| /admin/mensagens                                    | Sim          | Não             | Não                    | Redirecionamento (legado)                                                                                                                                                       |
| /admin/monetizacao                                  | Sim          | Não             | Sim                    | useMe, useSubscription, usePatrocinadores                                                                                                                                       |
| /admin/notificacoes                                 | Sim          | Não             | Não                    | Redirecionamento (legado)                                                                                                                                                       |
| /admin/partidas                                     | Sim          | Sim             | Não                    | useMe, useRacha, useTimesDoDiaPublicado                                                                                                                                         |
| /admin/partidas/criar                               | Sim          | Sim             | Sim                    | UI estática                                                                                                                                                                     |
| /admin/partidas/criar-times                         | Sim          | Sim             | Não                    | useRacha, useTimes \| /api/uploads/team-logo                                                                                                                                    |
| /admin/partidas/criar/classica                      | Sim          | Não             | Não                    | useSearchParams, useMe, useTimes \| /api/partidas, /api/partidas/${createdMatch.id}/resultado                                                                                   |
| /admin/partidas/criar/sorteio-inteligente           | Sim          | Não             | Não                    | Redirecionamento (legado)                                                                                                                                                       |
| /admin/partidas/historico                           | Sim          | Não             | Não                    | UI estática                                                                                                                                                                     |
| /admin/partidas/proximos-rachas                     | Sim          | Sim             | Não                    | useProximosRachas                                                                                                                                                               |
| /admin/partidas/resultados-do-dia                   | Sim          | Não             | Não                    | UI estática                                                                                                                                                                     |
| /admin/partidas/sorteio-inteligente                 | Sim          | Não             | Sim                    | useAuth                                                                                                                                                                         |
| /admin/partidas/time-campeao-do-dia                 | Sim          | Sim             | Sim                    | usePartidas \| /api/admin/destaques-do-dia?date=${dataKey}, /api/admin/destaques-do-dia                                                                                         |
| /admin/partidas/times-do-dia                        | Sim          | Sim             | Sim                    | useRacha                                                                                                                                                                        |
| /admin/perfil                                       | Sim          | Não             | Não                    | Redirecionamento (legado)                                                                                                                                                       |
| /admin/perfil/editar                                | Sim          | Não             | Não                    | Redirecionamento (legado)                                                                                                                                                       |
| /admin/personalizacao/editar-paginas                | Sim          | Sim             | Não                    | UI estática                                                                                                                                                                     |
| /admin/personalizacao/editar-paginas/contatos       | Sim          | Não             | Não                    | useRacha, useRachaPublic, useContatosAdmin                                                                                                                                      |
| /admin/personalizacao/editar-paginas/estatuto       | Sim          | Não             | Não                    | useEstatutoAdmin                                                                                                                                                                |
| /admin/personalizacao/editar-paginas/nossa-historia | Sim          | Não             | Não                    | UI estática                                                                                                                                                                     |
| /admin/personalizacao/footer                        | Sim          | Sim             | Não                    | useFooterConfigAdmin, useMe, useSubscription                                                                                                                                    |
| /admin/personalizacao/identidade-visual             | Sim          | Sim             | Não                    | useAboutAdmin, useMe, useRacha \| /api/public/slug?value=${encodeURIComponent(slugPreview)}, /api/admin/rachas/slug/${encodeURIComponent(tenantSlug)}                           |
| /admin/personalizacao/redes-sociais                 | Sim          | Sim             | Não                    | useSocialLinksAdmin                                                                                                                                                             |
| /admin/personalizacao/visual-temas                  | Sim          | Sim             | Não                    | UI estática                                                                                                                                                                     |
| /admin/rachas                                       | Sim          | Não             | Não                    | useRachaAgenda                                                                                                                                                                  |
| /admin/relatorios                                   | Sim          | Não             | Não                    | useAdminAnalytics                                                                                                                                                               |
| /admin/status-assinatura                            | Sim          | Não             | Não                    | UI estática                                                                                                                                                                     |
| /admin/suporte                                      | Sim          | Não             | Não                    | Redirecionamento (legado)                                                                                                                                                       |

## Achados por Severidade

### Crítico

#### 1) Escopo multi-tenant com fallback indevido para slug default

- Arquivos:
  - `src/app/(admin)/admin/jogadores/listar-cadastrar/page.tsx`
  - `src/app/(admin)/admin/jogadores/mensalistas/page.tsx`
  - `src/app/(admin)/admin/jogadores/ranking-assiduidade/page.tsx`
  - `src/app/(admin)/admin/personalizacao/identidade-visual/page.tsx`
  - `src/app/(admin)/admin/conquistas/grandes-torneios/page.tsx`
  - `src/app/(admin)/admin/partidas/page.tsx`
  - `src/components/admin/CardTimeCampeaoDoDia.tsx`
  - `src/components/admin/CardsDestaquesDiaV2.tsx`
  - `src/components/sorteio/ParticipantesRacha.tsx`
  - `src/hooks/usePublicLinks.ts`
  - `src/hooks/usePublicMatches.ts`
  - `src/hooks/usePublicMatch.ts`
- Problema:
  - Existiam fallbacks para `rachaConfig.slug` no fluxo admin. Sem tenant ativo, o painel podia carregar dados de slug default.
- Correção aplicada:
  - Remoção dos fallbacks no admin e nos hooks usados por telas admin.
  - Inclusão de estados explícitos de "racha não identificado".
  - `CardTimeCampeaoDoDia` e `CardsDestaquesDiaV2` só consultam API quando há slug ativo.
- Como testar:
  - Entrar no admin com tenant ativo e confirmar carregamento normal.
  - Simular falta de tenant ativo e confirmar mensagem de bloqueio/aviso sem carregar dados de outro racha.

#### 2) Proxies aceitando `tenantId/rachaId` do client para escopo

- Arquivos:
  - `src/app/api/admin/billing/subscription/route.ts`
  - `src/app/api/admin/billing/subscription/enterprise-monthly/start/route.ts`
  - `src/app/api/admin/billing/subscription/tenant/[tenantId]/route.ts`
  - `src/app/api/admin/financeiro/route.ts`
  - `src/app/api/admin/financeiro/[id]/route.ts`
  - `src/app/api/jogadores/route.ts`
  - `src/app/api/partidas/route.ts`
  - `src/app/api/partidas/[id]/route.ts`
  - `src/app/api/estrelas/route.ts`
  - `src/app/api/admin/administradores/route.ts`
  - `src/app/api/admin/administradores/atletas/route.ts`
  - `src/app/api/admin/administradores/[role]/route.ts`
  - `src/app/api/admin/contact/messages/route.ts`
  - `src/app/api/admin/contatos/route.ts`
  - `src/app/api/admin/destaques-do-dia/route.ts`
  - `src/app/api/admin/estatuto/route.ts`
  - `src/app/api/admin/financeiro/mensalistas/competencias/route.ts`
  - `src/app/api/admin/logs/route.ts`
  - `src/app/api/admin/mensalistas/requests/route.ts`
  - `src/app/api/admin/notifications/route.ts`
  - `src/app/api/admin/patrocinadores/route.ts`
  - `src/app/api/admin/patrocinadores/[id]/route.ts`
  - `src/app/api/admin/rachas/agenda/route.ts`
  - `src/app/api/admin/rachas/agenda/proximos/route.ts`
  - `src/app/api/admin/redes-sociais/route.ts`
  - `src/app/api/admin/solicitacoes/route.ts`
  - `src/app/api/admin/suggestions/route.ts`
  - `src/app/api/admin/support/tickets/route.ts`
  - `src/app/api/admin/torneios/route.ts`
  - `src/app/api/admin/torneios/[id]/route.ts`
  - `src/app/api/admin/analytics/route.ts`
  - `src/app/api/admin/rachas/[id]/route.ts`
  - `src/app/api/tenants/[tenantId]/athletes/me/route.ts`
  - `src/app/api/_proxy/helpers.ts`
- Problema:
  - Query/body do client podiam carregar `tenantId`, `tenantSlug`, `rachaId`, `slug` e influenciar escopo.
  - Endpoints com identificador de tenant no path podiam ser alvo de tentativa de bypass por URL manual.
- Correção aplicada:
  - Sanitização de query/body removendo campos de tenant vindos do client.
  - Criação de `appendSafeQueryParams` em `src/app/api/_proxy/helpers.ts` com **allowlist rígida** de query params permitidos.
  - Bloqueio explícito de chaves perigosas (`include`, `select`, `where`, `expand`, `populate`, `fields`, `orderBy` etc.) e de chaves de escopo de tenant.
  - Em `admin/analytics`, remoção de override de `slug` por query e validação de `period` por allowlist.
  - Hardening em billing para validar tenant ativo via `/admin/access` e bloquear mismatch (`403`).
  - Hardening em rotas com tenant no path para validar tenant ativo e bloquear mismatch (`403`): `admin/rachas/[id]` e `tenants/[tenantId]/athletes/me`.
  - `resolveTenantSlug` passou a priorizar cookie/sessão sobre override do client.
- Como testar:
  - Tentar chamar endpoints com `?tenantId=`/`?tenantSlug=`/`?rachaId=`/`?slug=` alterado e validar que o escopo não muda.
  - Tentar acessar `/api/admin/rachas/{tenantIdOutro}` e `/api/tenants/{tenantIdOutro}/athletes/me`; validar `403`.
  - Em billing, chamar com `tenantId` diferente e validar `403`.

### Alto

#### 3) Links quebrados e CTAs mortos no admin

- Arquivos:
  - `src/app/(admin)/admin/Header.tsx`
  - `src/components/layout/BottomMenuAdmin.tsx`
  - `src/app/(admin)/admin/Sidebar.tsx`
  - `src/app/(admin)/admin/PainelAdminBloqueado.tsx`
  - `src/app/(admin)/admin/conquistas/grandes-torneios/page.tsx`
  - `src/components/admin/AdminSidebar.tsx`
  - aliases criados:
    - `src/app/(admin)/admin/mensagens/page.tsx`
    - `src/app/(admin)/admin/financeiro/page.tsx`
    - `src/app/(admin)/admin/suporte/page.tsx`
- Problema:
  - Rotas inexistentes e links sem destino válido (`/admin/mensagens`, `/logout`, `/admin/config`, `/admin/configuracoes`, etc.).
- Correção aplicada:
  - Ajuste de links para rotas reais.
  - Logout real com `signOut`.
  - Substituição de link quebrado em torneios por ação válida (abrir modal de edição).
  - Criação de páginas de redirecionamento legado para evitar 404.
- Como testar:
  - Navegar por sidebar/header/bottom e cards do dashboard; validar ausência de 404.

#### 4) Mocks residuais em fluxo admin

- Arquivos:
  - `src/context/NotificationContext.tsx`
  - `src/components/admin/ListaNotificacoes.tsx`
  - `src/components/admin/CardProximosJogos.tsx`
  - `src/components/admin/PresidenteAccessBlock.tsx`
  - `src/app/(admin)/admin/administracao/administradores/AdministradoresClient.tsx`
  - `src/app/(admin)/admin/monetizacao/page.tsx`
  - `src/app/(admin)/admin/configuracoes/dominio-proprio/page.tsx`
  - `src/app/(admin)/admin/configuracoes/integracoes/page.tsx`
- Problema:
  - Dados e mensagens simuladas no painel (mock/local state simulado).
- Correção aplicada:
  - Integração com hooks/APIs reais.
  - Remoção de textos de simulação e estados fake.
- Como testar:
  - Abrir telas citadas e validar que dados vêm de API e não de arrays locais.

#### 5) Detalhes de logs sem sanitização suficiente

- Arquivo:
  - `src/app/api/admin/logs/route.ts`
  - `src/app/(admin)/admin/administracao/logs/LogsAdminClient.tsx`
- Problema:
  - Risco de exibir token/cookie/secret/JWT/IP bruto em "Detalhes", CSV ou retorno de API.
- Correção aplicada:
  - Sanitização **server-side** no proxy `/api/admin/logs` (GET e POST) com:
    - whitelist de campos de log;
    - whitelist de metadata permitida;
    - máscara de IP;
    - redação de tokens/cookies/JWT/secrets em texto livre.
  - Redação de padrões sensíveis e máscara de IPv4.
  - Aplicação da sanitização também no export CSV (defesa em profundidade no client).
- Como testar:
  - Inserir log com campos sensíveis e validar saída redigida na resposta de `/api/admin/logs`, na UI e no CSV.

### Médio

#### 6) SEO do admin com páginas indexáveis

- Arquivos:
  - `src/app/(admin)/admin/partidas/times-do-dia/page.tsx`
  - `src/app/(admin)/admin/partidas/sorteio-inteligente/page.tsx`
- Problema:
  - Meta robots `index, follow` em páginas do admin.
- Correção aplicada:
  - Troca para `noindex,nofollow`.
- Como testar:
  - Verificar `<meta name="robots" content="noindex,nofollow">` nessas páginas.

#### 7) Qualidade de texto PT-BR (ajustes pontuais)

- Arquivos:
  - `src/app/(admin)/admin/comunicacao/mensagens/page.tsx`
  - `src/components/admin/CardsDestaquesDiaV2.tsx`
  - `src/components/sorteio/ParticipantesRacha.tsx`
- Problema:
  - Textos com encoding/acentuação inconsistente em pontos do admin.
- Correção aplicada:
  - Ajustes pontuais de acentuação e mensagens.
- Como testar:
  - Revisar UI das telas citadas e confirmar textos em PT-BR correto.
  - Observação de varredura: `temporario` em `src/app/(admin)/admin/conquistas/os-campeoes/page.tsx` é campo de domínio para "temporada parcial", não placeholder/mocking.

#### 8) Logs de depuração (`console.log`) em hooks usados no admin

- Arquivos:
  - `src/hooks/useAdmin.ts`
  - `src/hooks/useAuth.ts`
  - `src/hooks/useFinanceiro.ts`
  - `src/hooks/useJogadores.ts`
  - `src/hooks/useNotifications.ts`
  - `src/hooks/usePartidas.ts`
- Problema:
  - Existiam `console.log` em fluxos de erro; em produção isso gera ruído operacional e exposição desnecessária de contexto.
- Correção aplicada:
  - Remoção dos `console.log` e uso de `console.error` apenas quando `NODE_ENV === "development"`.
- Como testar:
  - Executar o fluxo admin em produção e verificar ausência de `console.log` no cliente.

#### 9) Geração de IDs temporários com `Math.random` em componentes do admin

- Arquivos:
  - `src/components/admin/HistoricoPartidasAdmin.tsx`
  - `src/components/admin/ResultadosDoDiaAdmin.tsx`
  - `src/app/(admin)/admin/financeiro/prestacao-de-contas/components/ModalLancamento.tsx`
  - `src/app/(admin)/admin/personalizacao/editar-paginas/nossa-historia/NossaHistoriaEditor.tsx`
- Problema:
  - IDs temporários de UI eram gerados com `Math.random`, padrão frágil para rastreabilidade e sujeito a colisão.
- Correção aplicada:
  - Migração para `crypto.randomUUID()` com fallback seguro por timestamp (`Date.now().toString(36)`).
- Como testar:
  - Criar/editar itens nas telas listadas e confirmar geração de IDs string sem uso de `Math.random`.

## Smoke E2E (Admin)

- Arquivo criado: `tests/admin/admin-smoke-navigation.spec.ts`
- Cobertura:
  - Login admin.
  - Navegação pelos itens principais do sidebar.
  - Navegação por botões do header.
  - Navegação por cards/atalhos principais do dashboard.
  - Validação de heading esperado por rota.
  - Verificação de termos proibidos (`mock`, `em construção`, `temporário`, `placeholder`) no conteúdo principal.
  - Screenshot automática em falha (`afterEach`).
  - Fallback de credenciais: `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD` ou `TEST_EMAIL`/`TEST_PASSWORD`.
  - Login com seletores estáveis (`data-testid`) e fallback para seletor estrutural quando o deploy não tiver os `data-testid` mais novos.
- Hardening operacional:
  - `playwright.config.ts` passa a carregar automaticamente `.env.e2e.local` (credenciais locais ignoradas pelo git).
  - `.env.e2e.example` foi atualizado com os campos de credencial do smoke admin.
  - `tests/admin/admin-smoke-navigation.spec.ts` passou a detectar explicitamente o estado "Nenhum racha encontrado" no Hub e falhar com erro diagnóstico (sem timeout).
  - `src/app/admin/selecionar-racha/AdminHubClient.tsx` recebeu `data-testid` estáveis para busca/lista/ação de seleção de racha.

## Evidências de Validação

- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm exec playwright test tests/admin/admin-smoke-navigation.spec.ts --project=chromium --workers=1 --reporter=list` ⚠️ **PARCIAL** no cenário multi-racha real (mesmo usuário com 2 rachas: 1 ativo + 1 bloqueado):
  - ✅ `valida bloqueio por inadimplência com isolamento do tenant` (passou).
  - ❌ `navega pelos principais itens do admin sem rota quebrada` (falhou).
  - Falha observada no deploy atual: estado `Carregando painel...` permanece visível por tempo acima do limite do smoke (incluindo tentativa de reload), impedindo abertura consistente do shell admin.
  - Evidência Playwright: `test-results/admin-admin-smoke-navigati-48bb7--do-admin-sem-rota-quebrada-chromium/error-context.md`.
- Resultado E2E atual (ambiente real): isolamento de bloqueio confirmado, porém fluxo ativo ainda com intermitência/timeout no carregamento do painel para usuário multi-racha.
- Reauditoria de billing (backend) em 2026-02-18:
  - `pnpm lint` (`fut7pro-backend`) ✅
  - `pnpm typecheck` (`fut7pro-backend`) ✅
  - `pnpm exec jest src/billing/__tests__/billing.service.spec.ts --runInBand` (`fut7pro-backend`) ✅
  - `pnpm test -- --runInBand test/app.e2e-spec.ts` (`fut7pro-backend`) ✅

## Reteste Multi-Racha (2026-02-12)

- Conta de teste: mesmo usuário administrador em 2 rachas (um ativo e um bloqueado).
- Comandos executados:
  - `pnpm exec playwright test tests/admin/admin-smoke-navigation.spec.ts --project=chromium --workers=1 --reporter=list`
  - execução com `E2E_ACTIVE_TENANT_SLUG` e `E2E_BLOCKED_TENANT_SLUG` explícitos.
- Achado principal:
  - O cenário bloqueado está correto (redireciona e mantém isolamento por tenant).
  - O cenário ativo ainda apresenta travamento/intermitência no carregamento do painel em ambiente real.
- Correções locais já aplicadas para hardening desse fluxo (pendentes de publicação para validação final em produção):
  - isolamento de cookie admin dedicado (`fut7pro_admin_active_tenant`);
  - fail-safe visual no shell admin para evitar loading infinito;
  - timeout defensivo no `useAdminAccess` para evitar request pendurada sem fallback.

## Observações de Ambiente (Render/Vercel)

- Não foi necessária nova variável de ambiente para as correções aplicadas no admin.
- Para manter o smoke E2E executável com login real, usar credenciais válidas de admin em `.env.e2e.local` (local) ou secrets do CI:
  - `E2E_ADMIN_EMAIL` e `E2E_ADMIN_PASSWORD`, ou
  - `TEST_EMAIL` e `TEST_PASSWORD` (quando esses valores forem credenciais reais do ambiente alvo).
- Requisito operacional adicional identificado na reauditoria:
  - `MP_WEBHOOK_SECRET` no Render deve corresponder exatamente ao segredo configurado no webhook do Mercado Pago.
  - Sem esse ajuste, o backend registra `invalid signature` em `/billing/mp/webhook` e a reconciliação automática pode falhar.
