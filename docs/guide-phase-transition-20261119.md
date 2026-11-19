# Transição entre as fases do Guia Interativo

## Causa e decisão

`AdminOnboarding` usava `eligibility.footballUnlocked` para escolher a lista visível. Com as quatro etapas de preparação concluídas e menos atletas que o mínimo oficial, o modal voltava à lista da Fase 1 depois da comemoração.

A lista agora deriva da conclusão oficial da preparação (`phases.preparation.complete`, com compatibilidade para `eligibility.preparationComplete`). A autorização continua separada: `footballUnlocked`, `actionAvailability` e as validações existentes do backend controlam a execução. Não há novo estado persistido nem alteração dos critérios de conclusão.

## Comportamento

- Preparação incompleta: Fase 1.
- Preparação concluída: Fase 2, inclusive quando bloqueada. Etapas numeradas de 5 a 8 permitem consultar a orientação; botões de execução permanecem bloqueados.
- A comemoração mantém seu registro persistido e oferece “Conhecer a Fase 2”. Consultar essa fase não envia `FOOTBALL_STARTED`.
- Enquanto faltam atletas, o guia mostra quantidade, mínimo e restante fornecidos pelo backend. A barra limita apenas a representação visual a 100%. Não conta convites nem presume dez como configuração fixa.
- Revalidação ou contagem desconhecida mostra carregamento discreto. Erro não mostra um contador fictício e permite tentar atualizar.
- “Convidar mais jogadores” abre o painel de convites existente e retorna à visão esportiva.
- “Rever etapas da Fase 1” é uma consulta local à apresentação atual. Não altera progresso nem fase persistida. Fechar/reabrir, atualizar a página ou trocar de grupo retoma a fase correspondente ao progresso oficial.
- Ao receber a liberação oficial, remove-se o bloqueio geral. Permissões e pré-requisitos individuais continuam em vigor.

Banner, avatar, modal, fechamento por login, dispensa permanente, comemorações, recompensa e páginas operacionais mantêm a estrutura existente.

## Backend revisado

`src/modules/admin-guide/admin-guide.service.ts` calcula o mínimo em `ADMIN_GUIDE_MINIMUM_PLAYERS`, conta o elenco elegível, combina preparação e quantidade para liberar a fase e retorna `actionAvailability` por etapa. `FOOTBALL_STARTED` é rejeitado enquanto a fase não estiver disponível. Nenhuma dessas regras foi alterada. O PR backend desta entrega contém apenas a nova entrada da Central de Atualizações e seus testes.

## Verificação

Os testes de componente/apresentador cobrem preparação incompleta, comemoração e exploração sem iniciar a fase, zero atletas, orientações bloqueadas, mínimo oficial diferente de dez, atualização da contagem, restrições individuais após liberação, revisão local, reabertura e remount, troca de grupo, convite existente, carregamento, ausência de contagem e erro com repetição da consulta.

O percurso de navegador já existente passou a verificar a Fase 2 bloqueada após a comemoração, em vez de exigir o retorno à preparação. Novos percursos com preparação anteriormente concluída verificam reabertura e refresh com zero atletas, consulta das quatro etapas, revisão da Fase 1, convites sem aumento da contagem e atualização 0 → 9 → 10, em 1280, 390 e 320 px. O arquivo já integra o Admin Smoke em Chromium e a seleção de WebKit mobile.

Os percursos usam autenticação e interface reais com respostas operacionais isoladas. Não alteram dados de produção e não substituem uma conferência em iPhone físico. As capturas ficam nos artefatos do Admin Smoke do PR; resultados finais devem ser consultados nos checks do commit revisado.
