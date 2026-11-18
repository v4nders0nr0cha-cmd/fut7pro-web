# Continuidade do Guia Interativo — 18/11/2026

Este refinamento substitui a política anterior de apresentação normal apenas no primeiro acesso. Não altera decisões comerciais, critérios esportivos, oito etapas nem duas fases.

## Causas e correção

O apresentador exigia ausência de welcomePresentedAt/welcomeSeenAt para abrir STEPS; offeredLogin bloqueava novas oportunidades no login inteiro e sessionStorage registrava oferta antes da exibição. As transições eram registradas antes do DOM visível. O retorno contextual era sempre a página completa. A comemoração final dependia de recompensa elegível/concedida.

O apresentador da Dashboard agora lê o progresso atual na entrada, abre a primeira pendência e trata histórico, X, dispensa permanente e marcos separadamente. Não existe apresentador normal nas páginas operacionais. Um único ouvinte contextual global revalida o guia após notifyAdminGuideChanged, inclusive sem guia na URL; não há polling novo. O apresentador antigo de preparação da página completa foi removido; os marcos estão no apresentador da Dashboard.

X usa tenant + vínculo + onboardingLoginId, em armazenamento local, para sobreviver a navegação/refresh e compartilhar o fechamento entre abas da mesma origem/login. O fallback em memória atende armazenamento indisponível, com limitação de não sobreviver a recarregamento nesse caso. Um novo login gera identificador novo; refresh e atualização de sessão preservam o identificador existente, conforme callbacks e teste de autenticação. A dispensa permanente continua no vínculo do backend e vale em todos os dispositivos.

A apresentação de boas-vindas ou marco só é registrada em efeito após o diálogo visível estar montado. Marcadores não impedem STEPS. Novos marcos podem substituir STEPS no mesmo login. A consulta manual continua pelo perfil, sem card de Dashboard nem item novo na lateral.

## Navegação e dados

As duas URLs de times usam exatamente a mesma página, useTimes, API, payload e isolamento de grupo. Nenhum deles consulta guia para cadastrar, alterar, contar ou concluir. Backend conta Team por tenantId e archivedAt null; dois ativos concluem OFFICIAL_TEAMS. rememberAchievements preserva a conquista; actionAvailability continua exigindo dois ativos para FIRST_MATCHDAY, partida para resultados e resultados válidos para campeão.

Contexto acrescenta guiaOrigem=dashboard ou pagina. O legado sem origem retorna à página completa. Continuar guia/Voltar ao guia vindo do modal retorna à Dashboard com pedido explícito de retomada e slug do grupo. O pedido é validado contra o grupo atual e removido da URL, permitindo consulta manual mesmo com X/dispensa permanente sem apagar preferências nem reativar futuras aberturas automáticas. Não depende de history.back.

O painel de times mostra contagem real antes da conclusão e orientação concluída após confirmação do backend. Não redireciona ao salvar. Mostrar Novo Time focaliza o botão operacional existente. A revalidação do painel não remonta o formulário. A navegação do hub de criação mantém o contexto ao escolher Clássica ou Sorteio.

| Etapa           | Página real / salvamento                                   | Atualização e conclusão                                                                                   |
| --------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Conta criada    | Site público do grupo                                      | Tenant/slug persistido no backend; sem mutação artificial                                                 |
| Jogadores       | Convite separado; listar-cadastrar para cadastro/aprovação | INVITATION_COPIED e eventos useJogadores/useAthleteRequests; critério existente preservado                |
| Dias e horários | /admin/rachas                                              | useRachaAgenda após sucesso; agenda válida com dia/horário                                                |
| Times           | /admin/partidas/criar-times                                | useTimes após sucesso; ao menos dois ativos; histórico preservado                                         |
| Avaliações      | /admin/jogadores/nivel-dos-atletas                         | useNiveisAtletas após sucesso; dez elegíveis e cobertura válida; conquista preservada                     |
| Primeira rodada | /admin/partidas/criar, criar/classica, sorteio-inteligente | Salvamento de clássica/publicação de sorteio emite evento; backend reconhece preparação persistida válida |
| Resultados      | /admin/partidas/resultados-do-dia                          | ResultadosDoDiaAdmin após sucesso; backend verifica resultados compatíveis da rodada                      |
| Campeão         | /admin/partidas/time-campeao-do-dia                        | Evento após publicação; backend verifica ciclo publicado compatível                                       |

As ações futuras continuam bloqueadas pela disponibilidade do backend; suas explicações continuam clicáveis. Ao voltar à Dashboard, o destaque usa a primeira pendência real, sem ficar preso à seleção pedagógica antiga.

## Conclusão e comércio

Backend recebe somente uma extensão aditiva do contrato JSON: COMPLETION_PRESENTED / completionPresentedAt, validada pelas oito etapas e registrada uma vez por vínculo. Não há migração. rewardPresentedAt antigo é reconhecido como comemoração final já apresentada. REWARD_PRESENTED também registra a conclusão para compatibilidade.

Conclusão sem elegibilidade mostra comemoração sem prometer dias. Recompensa continua exigindo retorno granted do serviço existente e permite retry seguro. Concessão, ledger, transações, datas, cupons, checkout, permissões e Creator permanecem intactos. Ao concluir as oito etapas, o guia normal encerra as apresentações. A comemoração final tem controle próprio por vínculo e respeita a dispensa permanente; não transforma um X anterior em perda da conclusão.

## Evidências e limites

Testes direcionados cobrem apresentação pós-DOM, nova entrada/login, X entre remontagens, troca de vínculo/grupo, convite liberado durante o login, consulta de concluídas/futuras, seleção da próxima pendência, dispensa permanente, contexto com/sem parâmetro e preservação do formulário.

Browser: novos cenários executam o formulário real de times, falha de salvamento, um e dois times, navegação por menu lateral/contexto, retorno Dashboard/página completa, X com refresh, novo login real, confirmação permanente, retomada explícita, preparação/espera/liberação e conclusão com/sem recompensa. O estado operacional dos quatro marcos esportivos nesse cenário é fornecido por API sintética; a navegação ocorre nas páginas reais. Não se afirma que todos os formulários esportivos tenham sido preenchidos contra backend implantado.

PostgreSQL: teste com serviço real verifica zero/um/dois times, observação por dois administradores, arquivamento posterior, contagem atual e conquista preservada. As validações esportivas e comerciais já existentes continuam na suíte completa.

CI e identificadores finais ficam nas descrições dos PRs #257 e #189. Creator #132 permanece sem alterações nesta rodada. Conferência autenticada com dados reais, iPhone físico e homologação financeira continuam pendentes antes de produção. Nenhum merge, migração em produção ou deploy manual autorizado/executado.
