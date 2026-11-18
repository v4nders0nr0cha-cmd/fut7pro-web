# Continuidade do Guia Interativo — 18/11/2026

Este refinamento substitui a política anterior de apresentação normal apenas no primeiro acesso. Não altera decisões comerciais, critérios esportivos, oito etapas nem duas fases.

## Causas e correção

O apresentador exigia ausência de welcomePresentedAt/welcomeSeenAt para abrir STEPS; offeredLogin bloqueava novas oportunidades no login inteiro e sessionStorage registrava oferta antes da exibição. As transições eram registradas antes do DOM visível. O retorno contextual era sempre a página completa. A comemoração final dependia de recompensa elegível/concedida.

O apresentador da Dashboard agora lê o progresso atual na entrada, abre a primeira pendência e trata histórico, X, dispensa permanente e marcos separadamente. O apresentador fica no layout administrativo para preservar sua continuidade, mas só abre diálogos na Dashboard. A confirmação financeira pode continuar após o salvamento operacional, como antes, sem abrir modal nem registrar apresentação sobre o formulário. Um único ouvinte contextual global revalida o guia após notifyAdminGuideChanged, inclusive sem guia na URL; não há polling novo. O apresentador antigo de preparação da página completa foi removido; os marcos estão no apresentador da Dashboard.

X usa tenant + vínculo + onboardingLoginId, em armazenamento local, para sobreviver a navegação/refresh e compartilhar o fechamento entre abas da mesma origem/login. O fallback em memória atende armazenamento indisponível, com limitação de não sobreviver a recarregamento nesse caso. Um novo login gera identificador novo; refresh e atualização de sessão preservam o identificador existente, conforme callbacks e teste de autenticação. A dispensa permanente continua no vínculo do backend e vale em todos os dispositivos.

A apresentação de boas-vindas ou marco só é registrada em efeito após o diálogo visível estar montado. Marcadores não impedem STEPS. Novos marcos podem substituir STEPS no mesmo login. A consulta manual continua pelo perfil, sem card de Dashboard nem item novo na lateral.

## Navegação e dados

As duas URLs de times usam exatamente a mesma página, useTimes, API, payload e isolamento de grupo. Nenhum deles consulta guia para cadastrar, alterar, contar ou concluir. Backend conta Team por tenantId e archivedAt null; dois ativos concluem OFFICIAL_TEAMS. rememberAchievements preserva a conquista; actionAvailability continua exigindo dois ativos para FIRST_MATCHDAY, partida para resultados e resultados válidos para campeão.

Contexto acrescenta guiaOrigem=dashboard ou pagina. O legado sem origem retorna à página completa. Continuar guia/Voltar ao guia vindo do modal retorna à Dashboard com pedido explícito de retomada e slug do grupo. O pedido é validado contra o grupo atual e removido da URL, permitindo consulta manual mesmo com X/dispensa permanente sem apagar preferências nem reativar futuras aberturas automáticas. Não depende de history.back.

O painel de times mostra contagem real antes da conclusão e orientação concluída após confirmação do backend. Não redireciona ao salvar. Após confirmação de pelo menos dois ativos, explica que o mínimo não limita o cadastro e oferece Cadastrar outro time, que aciona o botão Novo Time existente. Mostrar Novo Time focaliza esse mesmo botão operacional. A revalidação do painel não remonta o formulário. A navegação do hub de criação mantém o contexto ao escolher Clássica ou Sorteio.

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

### Ambiente de navegador

A regressão longa encontrou um encerramento nativo do WebKit após refresh e navegação na versão 1.56.1. A reprodução ocorreu no mesmo ponto em duas execuções do mesmo commit. O mantenedor documentou a falha de recarregamento e sua correção na 1.57: https://github.com/microsoft/playwright/issues/37766 . A ferramenta de testes e as imagens correspondentes de CI passam para 1.57.0, com os dois lockfiles sincronizados. Os mesmos percursos e assertions são mantidos, incluindo refresh e navegação direta; nenhum teste foi ignorado ou relaxado. Essa atualização afeta o ambiente de verificação, não a aplicação em produção.

## Refinamento visual de 18/11 — fase ativa e identidade

O modal apresenta progresso geral, uma lista de quatro etapas da fase liberada e, abaixo, os detalhes selecionados com ação principal. Chip FASE 1/FASE 2 e título separados substituem os cabeçalhos literais com travessão. As oito etapas continuam no contrato e na contagem geral; a fase esportiva só aparece com footballUnlocked confirmado. Durante a espera por atletas, mantém a preparação e uma orientação curta de convite. Etapas futuras da fase visível continuam consultáveis com ações bloqueadas pelos critérios existentes. Não há Ver próxima etapa nem botão de início concorrendo com a ação principal.

A identidade usa o escudo como cover ampliado, centralizado, com máscara radial, composição em luminosidade e vinheta sobre grafite com luz âmbar discreta. A imagem original não é alterada nem enviada a serviços; transparência compõe sobre o próprio fundo do banner. Avatar permanece independente do recorte. Sem logo, há composição decorativa de troféu no mesmo fundo.

Os cenários visuais verificam logos transparente, colorida e marca existente em desktop, celular e largura de 320px, a ordem lista/detalhes e quatro etapas visíveis. O percurso de continuidade registra também a fase esportiva desbloqueada. Apresentador, histórico de login, preferências, conclusão por dados persistidos, regras comerciais, backend e Creator ficam intactos nesta rodada visual.

### Entrega incremental

O proprietário mesclou os PRs #257, #189 e #132 em 18/11/2026 entre 15:15 e 15:16 UTC. O refinamento visual foi implementado depois, na mesma branch do frontend, e segue isolado no PR #258 em rascunho. O diff incremental se limita ao componente de apresentação, testes e esta documentação; backend e Creator não foram modificados nesta rodada. Nenhum merge de PR, migração ou deploy manual foi executado pelo agente durante este refinamento.
