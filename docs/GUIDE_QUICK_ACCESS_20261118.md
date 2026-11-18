# Acessos ao Guia Interativo — 18/11/2026

## Escopo

Mudança de acesso e retomada. O componente AdminOnboarding, banner, quatro etapas por fase, critérios, transições, recompensa e regras esportivas/comerciais ficam preservados.

## Abertura

AdminHelpLauncher usa resumeGuideHref para Guia Interativo. Central de Ajuda e WhatsApp permanecem iguais. Na Dashboard, a navegação é interna à mesma página e o menu fecha; em outra rota, o mesmo comando leva à Dashboard. O header mobile recebe um BookOpen de 44px imediatamente antes do avatar, somente enquanto o progresso real do grupo estiver pendente. O hook existente fornece dados autenticados e isolados por usuário/grupo; nenhum contador paralelo foi criado.

AdminGuidePresenter continua sendo o único apresentador. O comando manual pede progresso atualizado antes de abrir, é consumido removendo a consulta da URL e não modifica X nem a preferência permanente. O acesso funciona repetidamente no mesmo login, inclusive após falha de leitura. Concluídos continuam consultáveis manualmente no desktop, sem voltar a abrir automaticamente. Os links do perfil e Mais preservam /admin/guia-fut7pro.

## Dica de localização

Uma dica pequena é solicitada somente pelo X do modal principal pendente. Escape e fundo continuam fechando sem gerar a dica; confirmar a dispensa permanente também não a gera. Fut7DialogBase recebe apenas um callback opcional para o botão X, com o comportamento anterior como padrão para os demais diálogos.

A dica acompanha a posição real do acesso desktop/mobile e mede novamente ao girar/redimensionar a tela. Não rouba foco, não cobre o header e possui Entendi. Fecha ao usar o acesso. É adiada/ocultada enquanto houver diálogo, menu expandido ou gaveta administrativa aberta. O observador existe apenas durante a dica, sem polling.

A chave local guide-access-hint:v1:<tenantId>:<membershipId> registra a primeira apresentação efetiva. Não contém login, não se repete após refresh/novo login no navegador e não atravessa grupos ou administradores. Se armazenamento estiver bloqueado, há fallback em memória, que não sobrevive ao refresh. Não há tabela, migração ou endpoint novo.

O Tooltip existente é apenas hover e texto não interativo; não atende ao toque, botão Entendi ou controle de apresentação única. A dica é restrita a esta funcionalidade, sem sistema global de notificações.

## Validação

Unidades cobrem X específico, escopos, abertura manual após dispensa, espera por progresso atual, falhas recuperáveis, dica única, menus/diálogos e conclusão do ícone. Cenários de navegador com autenticação HTTPS local verificam desktop, 320/375/390px e paisagem 844px, retorno de outra rota, ausência de reload na abertura desktop, perfil/Mais e remoção do ícone pelo progresso confirmado.

A API dos cenários é isolada. A suíte existente de continuidade, segurança, responsividade e conclusão com/sem bônus permanece obrigatória. Resultados finais e capturas ficam no PR específico.

A fonte canônica da Central de Atualizações está no backend e a política do frontend exige uma entrada para melhoria funcional. O PR coordenado do backend se limita à nova entrada e aos testes de metadados do changelog, sem alterar serviços ou regras.

Sem merge, deploy manual, migração ou alteração em produção nesta entrega.
