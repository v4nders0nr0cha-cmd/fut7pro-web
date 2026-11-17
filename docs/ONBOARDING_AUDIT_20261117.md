# Auditoria e implementação do onboarding — 17/11/2026

## Base auditada

Backend origin/main 904599d2. Frontend origin/main 6c07ebcc. Trabalho em branches e worktrees próprias.

## Evidências da implementação anterior

- `AdminGuideService.getGuide` calculava progresso a partir de cinco IDs em `admin-guide.constants.ts`.
- `buildTasks` concluía ACTIVE_PLAYERS com activeHumanPlayers > 0.
- `AuthService.createTenantForGoogleUser` e o cadastro de presidente chamam `ensureAthleteForUser`, criando o atleta administrativo automaticamente. Esse fluxo continua intacto.
- `activeHumanPlayerWhere` exclui bots, arquivados e vínculos pendentes. Os filtros continuam utilizados nas métricas esportivas.
- `AdminGuideService.updatePedagogicalState` já armazena JSON em Membership, valida administrador aprovado e bloqueia a linha com FOR UPDATE. expectedRevision rejeita concorrência com 409.
- O frontend oferecia um card na Dashboard e a página AdminGuideClient. Começar apenas registrava WELCOME_SEEN. Os novos componentes executam a orientação.
- Cadastro manual e vínculo permanecem na página listar-cadastrar e nos serviços existentes. O guia navega para essa página e instrui a usar Cadastrar Jogador, sem duplicar formulário.
- PublicService.resolveTenant disponibiliza o grupo por registro persistido e slug. ACCOUNT_READY exige o grupo existente e um slug válido. Não faz sondagem HTTP de disponibilidade da infraestrutura externa.

## Critérios das seis etapas

1. Conta criada e site no ar — vínculo administrativo aprovado, grupo persistido e slug válido no mesmo endpoint que exige autenticação.
2. Traga seus primeiros jogadores — convite copiado com sucesso em WhatsApp ou Instagram e ação autenticada persistida, OU perfil manual não arquivado e não bot, OU atleta com membership ATLETA aprovado no grupo. Contas com papel administrativo são provisionadas automaticamente e ficam fora dessa evidência de recrutamento. Um administrador convertido depois para ATLETA passa a ser considerado pela regra operacional atual.
3. Cadastre os times oficiais — pelo menos dois times não arquivados, conforme regra anterior.
4. Prepare o primeiro jogo — partida válida com dois times distintos, conforme consulta anterior.
5. Registre os resultados — todas as partidas válidas de um dia com placares, conforme consulta anterior.
6. Publique o Time Campeão do Dia — ciclo de resultados e publicação compatíveis no mesmo dia, conforme consulta anterior. A condição recomendada MATCHES_FINISHED permanece independente para preservar compatibilidade histórica.

## Persistência e segurança

- Nenhuma alteração de schema ou migração. Novos campos opcionais no JSON existente, normalizados para estados antigos.
- Progresso operacional calculado pelo grupo. Cópia do convite, canal, início, seleção, etapas puladas e dispensa pertencem ao vínculo Membership.
- STEP_SKIPPED registra o ID em dismissedTips e avança currentStep, sem concluir a etapa.
- Cópia registra primeiro timestamp e canal. Aberturas externas usam RESOURCE_VIEWED com nomes de tentativa, sem afirmar envio/publicação nem concluir recrutamento.
- X/Agora não fecham somente a apresentação na sessão. A dispensa permanente usa DASHBOARD_INVITE_DISMISSED e permanece intacta na abertura manual.
- Frontend isola cache por usuário e slug. Backend mantém guards, validação, isolamento por tenant e revisão concorrente.
- Links públicos derivam do tenant do servidor e da mesma configuração de origem utilizada pelo diretório público.

## Validação e limites

Testes direcionados do serviço e controller, componentes, hook, navegação e proxy. Verificação TypeScript nos dois repositórios. Resultados finais constam nos PRs.

Não foi executado cadastro real nem inspeção dos registros de produção. A validação visual em navegador autenticado, com fotos e branding reais, e o percurso esportivo completo desktop/mobile precisam de revisão antes da aprovação. As imagens educativas fornecidas foram convertidas para WebP, mantendo a fonte original.


## Revisão após CI e feedback

A saudação deriva dos dados atualizados do guia, incluindo chegada assíncrona. A apresentação é registrada ao fechar temporariamente, preservando a recepção durante a primeira abertura. A sessão autenticada ganha um identificador opaco exclusivo por login, preservado na renovação de tokens e usado apenas para a preferência de apresentação. Cada novo login permite nova oferta mesmo na mesma aba. A dispensa permanente do Membership continua prevalecendo.

A orientação contextual agora apresenta passos das ações reais e permite localizar os botões Cadastrar Jogador e Novo Time. Consultas periódicas foram removidas. Gravações bem-sucedidas de jogadores, times, preparação de partidas, resultados e publicação esportiva emitem um evento que atualiza o guia visível. Atualização por foco e retomada continua disponível via SWR.

A fonte oficial de atualizações do backend inclui a versão 2026.11.17 e o frontend referencia o PR backend #188 pelo fluxo editorial do repositório.

O preview Vercel foi aberto pelo navegador em 17/11. A sessão expirou e a tentativa de seleção do grupo terminou em /admin/login?expired=1. A validação autenticada com dados reais depende de login disponibilizado pelo usuário. O preview do frontend também requer o backend com o contrato do PR #188 para validar as seis etapas integradas.
