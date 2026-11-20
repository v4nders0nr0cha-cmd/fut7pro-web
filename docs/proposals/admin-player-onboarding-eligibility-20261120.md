# Elegibilidade do administrador jogador no início do grupo

Status: diagnóstico confirmado; proposta separada, não implementada neste PR.

## Evidência de produção em 20/11/2026

Consulta somente de leitura ao grupo `quintasemlei`, sem cadastrar, excluir, vincular ou alterar registros:

| Condição                                                       | Quantidade |
| -------------------------------------------------------------- | ---------: |
| Perfis humanos ativos, não arquivados                          |          8 |
| Perfis manuais humanos elegíveis                               |          7 |
| Perfil humano vinculado ao Presidente, sem participação válida |          1 |
| Identidades humanas duplicadas por conta ou e-mail normalizado |          0 |
| Partidas não excluídas                                         |          0 |
| Partidas válidas para o predicado de participação              |          0 |
| Perfis BOT, excluídos da elegibilidade                         |          9 |

O perfil Neymar é a conta do Presidente. Está ativo, não arquivado e não é BOT; seu único vínculo aprovado é `PRESIDENTE`, sem vínculo `ATLETA` e sem participação válida. Portanto, a diferença 8 ativos / 7 elegíveis decorre desse perfil, não de atraso de leitura ou duplicidade. A mesma origem explica `invitedPlayers = 7`: a divulgação inicial exclui perfis administrativos provisionados automaticamente. Concluir essa divulgação é uma conquista histórica distinta de reunir dez atletas elegíveis.

Fonte auditada: `fut7pro-backend`, commit `4ce80b14ea712f10ebd91c89bbb46bc02948ddae`, `AdminGuideService.loadEligibleRoster`, `getGuide` e `buildTasks`. Não foram lidos e-mails, senhas ou dados financeiros na saída da auditoria. As consultas verificaram as condições de vínculo, presença, partida e duplicidade, retornando somente os fatos necessários ao diagnóstico.

## Regra vigente

`loadEligibleRoster` exige perfil ativo (sem distinção de maiúsculas), humano e não arquivado. Aceita perfil manual sem `userId`, conta com vínculo aprovado `ATLETA`, ou conta administrativa aprovada com participação válida no mesmo grupo. Para administradores, a presença deve ser `TITULAR` ou `SUBSTITUTO`, com time atribuído e partida não excluída, com dois times e sem status cancelado/rascunho. Depois, o backend une identidades pela conta e pelo e-mail normalizado. Nome igual não basta para deduplicar.

A Fase 2 exige preparação concluída e pelo menos dez dessas identidades. A contagem continua vindo exclusivamente do backend.

| Grupo preparado, sem outras exclusões ou duplicidades          | Elegíveis atuais | Fase 2    |
| -------------------------------------------------------------- | ---------------: | --------- |
| Dez perfis manuais humanos                                     |               10 | Liberada  |
| Nove atletas elegíveis e Presidente jogador sem partidas       |                9 | Bloqueada |
| Nove atletas elegíveis e Presidente com participação válida    |               10 | Liberada  |
| Sete atletas manuais e Presidente sem partidas, caso observado |                7 | Bloqueada |

Há uma dependência circular na sequência guiada para dez participantes reais incluindo o Presidente: a presença usada como prova só existe depois de preparar uma partida, mas a preparação do primeiro jogo no guia vem após o requisito de dez. A operação pode ser acessada pelo menu; por isso, o diagnóstico é de dificuldade artificial no onboarding, não de impossibilidade absoluta de usar toda a plataforma.

## Proposta para decisão posterior

Separar o cargo administrativo da confirmação de participação como jogador, por grupo. Recomenda-se uma confirmação explícita de que o administrador joga, persistida e auditável, associada ao perfil humano existente. Esse dado poderia permitir a elegibilidade inicial sem partida anterior, preservando todas as demais exclusões e a deduplicação. A conta administrativa criada automaticamente, sem confirmação de participação, continuaria não contando.

Antes de implementar, definir quem confirma essa condição, como revogá-la e qual seu efeito no elenco, nas avaliações e no Sorteio Inteligente. Verificar a coerência entre os pré-requisitos dessas operações e o onboarding. Não reutilizar `isMensalista`, isenção financeira ou a conclusão da divulgação como prova de participação. Não criar outro perfil ou mudar o cargo para `ATLETA`: `Membership` identifica o vínculo único da conta com o grupo.

Alternativa: estabelecer um requisito de elenco inicial separado da elegibilidade esportiva. Essa opção exige deixar clara a diferença de contagens e impedir que a próxima ação continue bloqueada pelo mesmo predicado, apenas deslocando o problema.

Nenhuma dessas propostas foi aplicada. Este PR corrige somente a navegação e a orientação contextual. Testes de uma futura mudança devem cobrir Presidente/Vice e diretores que jogam ou não, grupo sem partidas, perfil vinculado/manual, BOT, arquivo/inatividade, vínculo pendente, duplicidades, avaliação, sorteio e revogação da confirmação.
