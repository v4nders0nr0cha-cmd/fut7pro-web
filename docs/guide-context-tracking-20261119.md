# Acompanhamento contextual do Guia Interativo

## Diagnóstico e escopo

O bloco anterior procurava botões pelo texto, mostrava todas as instruções e encaminhava o retorno modal por outra página. A assinatura de atualização pertencia ao componente de apresentação. A agenda também usava uma chave de cache sem identidade de administrador/grupo.

O painel agora utiliza o estado do controlador global, identifica a etapa, recolhe os detalhes e abre o modal na página atual. `guiaOrigem=pagina` continua retornando à página completa. Os validadores de `guiaRetorno`, `retomarGuia` e `grupoGuia` permanecem compatíveis para os links antigos. Nenhum parâmetro participa dos cadastros, das permissões no servidor ou dos critérios de conclusão.

## Etapas auditadas

| Etapa           | Página administrativa                                                                            | Confirmação persistida e evento                                                                                                       | Dados utilizados                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Conta criada    | Site público, sem painel operacional                                                             | O backend reconhece a conta/site. O clique externo não conclui etapas                                                                 | Sem alteração                                                                                          |
| Jogadores       | `/admin/jogadores/listar-cadastrar`                                                              | `useJogadores` após criação/alteração/exclusão; `useAthleteRequests` após admissão. A divulgação declarada continua no fluxo aprovado | `invitedPlayers`; a conclusão vem de `tasks`, incluindo confirmação de divulgação e histórico legado   |
| Dias e horários | `/admin/rachas`                                                                                  | `useRachaAgenda`: POST/DELETE `/api/admin/rachas/agenda`, aviso somente após sucesso                                                  | `agendaConfigured`; horários reais da mesma consulta da página, com cache por administrador/grupo      |
| Times oficiais  | `/admin/partidas/criar-times`                                                                    | `useTimes`: `/api/times`, criação/edição/exclusão/arquivamento/restauração avisam após sucesso                                        | `activeOfficialTeams`; mínimo de dois ativos, sem limitar equipes adicionais                           |
| Avaliações      | `/admin/jogadores/nivel-dos-atletas`                                                             | `useNiveisAtletas`, POST `/api/estrelas`, aviso após resposta bem-sucedida                                                            | `eligiblePlayerCount` e `evaluatedEligiblePlayers`; mínimo dez e avaliação salva de todos os elegíveis |
| Primeira rodada | `/admin/partidas/criar`, `/admin/partidas/criar/classica`, `/admin/partidas/sorteio-inteligente` | Partida clássica avisa após salvar; Sorteio Inteligente após publicação confirmada. A escolha mantém o contexto                       | `validMatchCount`; não confundir gerar sorteio com publicar/salvar                                     |
| Resultados      | `/admin/partidas/resultados-do-dia`                                                              | PUT `/api/partidas/:id/resultado`; recuperação de resultado confirmado pelo servidor, exclusão e registro do fechamento também avisam | Backend exige todos os resultados de um dia. Não há contagem artificial de partidas faltantes          |
| Campeão         | `/admin/partidas/time-campeao-do-dia`                                                            | Publicação confirmada avisa antes de revalidar a fila                                                                                 | Backend exige ciclo válido concluído e publicado; abrir prévia não conclui                             |

Identificadores complementares existentes: `IDENTITY`, `MONTHLY_MODEL` e `MATCHES_FINISHED` recebem a mesma apresentação, com rótulo “Orientação complementar”, sem virar novas etapas. O modelo de mensalistas continua sendo uma escolha pedagógica do guia completo. `PUBLIC_SITE` é externo e não recebe painel. `SPONSORS`, `RANKINGS` e `COMMUNICATION` são recomendações, não tarefas contextuais. Não foi encontrado `MATCHES_PREPARED` entre as tarefas atuais do backend.

## Segurança, atualização e continuidade

- Exibição exige controlador com identidade de login, associação `APROVADO`, tarefa aplicável, permissão correspondente e destino válido. A orientação de rodada aceita somente as três rotas reais, sem prefixo genérico.
- A conclusão é sempre `task.completed` confirmado no guia; a interface não calcula conquistas a partir das contagens. O backend preserva conquistas históricas. O painel distingue essas conquistas da contagem operacional atual.
- Uma assinatura no controlador agrupa eventos simultâneos e serializa leituras. Se outro salvamento ocorrer durante uma consulta, uma leitura seguinte confere esse resultado. A desmontagem/troca de identidade cancela os próximos trabalhos daquela assinatura.
- A consulta do guia mantém o isolamento existente por usuário/grupo. A agenda agora usa o mesmo isolamento, sem reaproveitar os dados anteriores em outra identidade.
- Durante consulta ou erro, nenhuma conclusão em cache é anunciada como confirmação atual. A recuperação não exige recarregar a página.
- Não há polling, busca de botões por texto, clique simulado, rolagem/foco programáticos ou alteração de campos. O formulário real continua independente do painel.
- A continuidade manual usa `openGuide()`; o apresentador existente escolhe a próxima pendência e preserva transições, X, dispensa permanente e apresentação automática apenas na Dashboard.
- As páginas já apresentam confirmação de salvamento. Não foi criado outro toast de conclusão nem modal automático nas páginas operacionais. O estado do painel é anunciado de forma acessível.

## Validação reproduzível

Testes unitários: `AdminGuideContext.test.tsx`, `admin-guide-events.test.ts`, `useRachaAgenda.test.tsx`; suíte completa do frontend e verificações existentes.

Integração com páginas, formulários, hooks e navegação reais, usando servidor de autenticação isolado e respostas controladas: `guide-context-tracking.fixture.spec.ts`, `onboarding-continuity.fixture.spec.ts`, `guide-invitation.fixture.spec.ts` e demais percursos obrigatórios do Admin Smoke. As fixtures não pretendem substituir a validação dos predicados persistidos no backend.

O fluxo obrigatório do CI executa Chromium em 1280, 768, 390, 375 e 320 px; WebKit/iPhone em 390 e 320 px. Produz capturas de times pendente/parcial/concluído e de horários pendente/concluído. Inclui falha de salvamento, consulta em andamento, erro/recuperação, preenchimento preservado, ausência de painel na página normal e continuidade sem mudança de URL.

Os resultados e capturas da execução ficam nos artefatos `admin-smoke-artifacts` do workflow Admin Smoke CI. A descrição do PR registra o status efetivamente observado. O TypeScript local possui dois erros preexistentes em tipos gerados de archive/restore; o CI limpo é a referência adicional, sem alterar essas rotas fora do escopo.

## Limites

Nenhuma API, migração ou regra do backend precisou ser alterada. O PR coordenado do backend contém somente a entrada editorial exigida pela Central de Atualizações. Não há mudança em Creator, cobrança ou elegibilidade.

Os testes de navegador utilizam fixtures isoladas; não há operação em produção nem credenciais reais. WebKit emulado não substitui um teste em iPhone físico. A disponibilidade de métricas é limitada ao contrato atual: não inventamos pendências detalhadas de resultados ou uma nova contagem de convites entregues.
