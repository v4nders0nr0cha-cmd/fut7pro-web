# Central de Assinatura — homologação da Fase 3

Data: 26–27/11/2026. Evidências com dados de demonstração, sem cobranças reais.

## Resultado e versões

Frontend [#273](https://github.com/v4nders0nr0cha-cmd/fut7pro-web/pull/273), commit `4f4ebdd72b4a055bfbd8ce034059e80105e2bd86`. Backend [#204](https://github.com/v4nders0nr0cha-cmd/fut7pro-backend/pull/204), commit `8a0cfced7e8e207630f5f1880c2aa207a5d8eed0`. Ambos abertos, sem merge. Verificar os checks e conflitos novamente ao atualizar suas bases.

As correções visuais e funcionais da homologação foram publicadas nos PRs existentes. Os checks atuais estão aprovados e não há discussão de revisão aberta ou conflito indicado. A aprovação integral de segurança continua condicionada à triagem das dependências descrita abaixo. Não houve merge nem publicação em produção.

## Problemas e correções

| Problema encontrado | Correção |
|---|---|
| Validade do PIX mostrava apenas o dia | Data, hora e fuso de Brasília, sem confundir com o prazo de acesso |
| Provedor simulado manteve PIX pendente além do prazo informado | Aviso de prazo encerrado, código desabilitado, QR e link de pagamento indisponíveis; nenhuma cobrança recriada ou cancelada automaticamente |
| Campo do código PIX sem o mesmo foco visível dos demais campos | Incluído o estilo de foco para textarea |
| Planos abriam sempre em Mensal | Periodicidade inicial segue o contrato confirmado; seleção separada por grupo/conta |
| Link de autorização retornado na contratação Enterprise era descartado | Link permitido do Mercado Pago preservado ao lado do PIX; nenhuma autorização automática |
| Data de registro aparecia como não registrada antes de terminar a consulta | “Consultando...” durante a busca; indisponibilidade explícita se a consulta falhar |
| Botões dos planos ficavam em alturas diferentes | Lista de benefícios ocupa o espaço disponível e alinha as ações |
| Atualizar quebrava a palavra em 390 px e mudava de largura durante a consulta | Cabeçalho mobile reorganizado e espaço reservado para os dois estados |
| Selo do plano se esticava junto do cartão | Alinhamento próprio do selo preserva sua largura natural |
| Filtro de situação perdia legibilidade em telas menores | Campo mais largo no tablet e uma linha própria no mobile |
| Rótulos do menu inferior se encostavam em 320 px | Ajuste tipográfico somente abaixo de 360 px, sem mudar nomes, destinos ou área de toque; necessário para a navegação da própria Central |
| Retorno do foco do PIX falhava quando a atualização ainda desabilitava o botão de origem | Aguarda a reativação por até 10 segundos e abandona a restauração se o usuário interagir com outro controle |
| Menu do perfil podia desaparecer antes do clique no Safari | Blur sem próximo elemento deixa o fechamento ao clique fora ou à escolha do destino; Escape e Tab continuam cobertos pelos testes |
| Evidências de telas normais eram capturadas após falha de pagamento | Capturas normais e cenário de erro separados |
| Outra execução Playwright podia apagar as imagens antes do upload | Artefato da Central enviado imediatamente após sua suíte |
| Security Scan verde não explicava alertas nem Snyk ignorado | JSON de auditoria preservado e cobertura descrita no resumo do job |
| Teste de convite preenchia e-mail antes da hidratação | Ordem de preparação corrigida, valor conferido e prazo do teste compatível com o login; os dois seletores “Continuar” foram preservados |

Arquivos de produto alterados nesta homologação: `OverviewPanel`, `PlansPanel`, `FinancialDialogs`, `presentation` e `central.module.css`, `Header`, `BottomMenuAdmin` e `Fut7DialogBase`. Os demais ajustes abrangem testes, ambiente isolado, workflows e documentação. Referências principais: [OverviewPanel](../../src/components/billing/central/OverviewPanel.tsx), [PlansPanel](../../src/components/billing/central/PlansPanel.tsx), [FinancialDialogs](../../src/components/billing/central/FinancialDialogs.tsx), [apresentação](../../src/components/billing/central/presentation.ts), [estilos](../../src/components/billing/central/central.module.css), [Header](../../src/components/layout/Header.tsx), [menu inferior](../../src/components/layout/BottomMenuAdmin.tsx) e [diálogo compartilhado](../../src/components/ui/feedback/Fut7DialogBase.tsx). A correção no diálogo compartilhado é necessária para a revalidação da Central; os testes dos demais diálogos e convites continuam na suíte completa.

No backend foram acrescentados somente o runner e o servidor de teste fora da aplicação de produção. Não houve alteração financeira, comercial ou de migração nesta homologação.

## Avaliação renderizada e capturas

Capturas integradas com API de assinatura e PostgreSQL reais; autenticação da área administrativa preparada por fixture e Mercado Pago simulado.

| Área | Desktop 1280 px | Mobile 390 px |
|---|---|---|
| Visão geral | [Abrir](images/overview-1280.png) | [Abrir](images/overview-390.png) |
| Benefícios | [Abrir](images/benefits-1280.png) | [Abrir](images/benefits-390.png) |
| Pagamentos | [Abrir](images/payments-1280.png) | [Abrir](images/payments-390.png) |
| Planos | [Abrir](images/plans-1280.png) | [Abrir](images/plans-390.png) |

Cenários adicionais: [PIX de demonstração](images/pix-390.png), [restrição do Diretor de Futebol](images/football-director-390.png) e [falha de status com plano preservado](images/status-error-390.png). As imagens são de momentos sucessivos da mesma base isolada: o PIX criado durante o teste aparece nas consultas seguintes; os contadores refletem os registros confirmados em cada consulta.

Foram inspecionadas as quatro áreas em 1280 e 390 px e amostras em 768 e 320 px. Sem transbordamento horizontal nas oito combinações automatizadas de navegador/largura. Foco visível e restauração após Escape, aria-current e ações por teclado foram conferidos. Voltar/avançar, recarga, link legado e recuperação após falha de status passaram em uma verificação adicional com movimento reduzido. Tab e Shift+Tab foram exercitados nas duas extremidades do diálogo, com retenção do foco e retorno por Escape após a recuperação da consulta. O menu inferior fixo aparece na posição da viewport nas capturas de página inteira, comportamento normal desse tipo de captura.

As imagens são capturas do navegador. O nome do grupo identifica a demonstração. Os PNGs publicados mantêm os mesmos bytes dos arquivos originais; os hashes estão em `manifest.json`. Não foram alteradas para remover erros ou esconder elementos.

## Testes e verificações

| Validação | Resultado |
|---|---|
| Frontend, suíte completa no CI | 948 testes em 174 suítes aprovados |
| Frontend, testes locais da Central | 15 testes da Central, 10 do Header e 5 do diálogo aprovados; execuções direcionadas sem cobertura global |
| Backend, CI da branch #204 | 117 unitários e 49 integração/E2E aprovados |
| Backend, repetição local em PostgreSQL separado | 49 integração/E2E aprovados |
| API integrada com JWT, grupos e cargos reais | 24 verificações HTTP aprovadas |
| Navegador integrado, Chromium e WebKit | 10 cenários aprovados: quatro larguras × dois navegadores e restrição do Diretor de Futebol nos dois navegadores; sem retries ou cenários ignorados |
| Admin Smoke, mobile, guia e regressões oficiais de acesso | 86 cenários aprovados; Central 8, acesso 6, convite 2, desempenho do Guia 4, navegação geral 46 e guia WebKit 20 |
| Lint, tipos, formatação e build padrão | Aprovados nos heads acima; build padrão do CI e build local isolado concluídos |
| Auditoria de dependências de produção | 56 ocorrências: 32 altas, 17 moderadas, 7 baixas e nenhuma crítica |
| Snyk | Não executado: `SNYK_TOKEN` não configurado |

Resultados públicos nos repositórios:

- [Frontend CI: testes, qualidade, build e audit](https://github.com/v4nders0nr0cha-cmd/fut7pro-web/actions/runs/45987961949).
- [Admin Smoke e segurança SuperAdmin](https://github.com/v4nders0nr0cha-cmd/fut7pro-web/actions/runs/45987961947).
- [Tipos e ESLint](https://github.com/v4nders0nr0cha-cmd/fut7pro-web/actions/runs/45987962003).
- [Backend: regressões financeiras e build](https://github.com/v4nders0nr0cha-cmd/fut7pro-backend/actions/runs/45904611797).
- [40 capturas do CI com fixtures](https://github.com/v4nders0nr0cha-cmd/fut7pro-web/actions/runs/45987961947/artifacts/15192511410), diferentes das capturas integradas desta galeria.
- [JSON do audit de segurança do head final](https://github.com/v4nders0nr0cha-cmd/fut7pro-web/actions/runs/45987961949/artifacts/15192476318).
- Registros da execução preservados nesta branch: [navegador final](browser-result.json), [rodada que identificou a falha de foco](browser-before-focus-fix.json), [HTTP](http-result.json) e [navegação/recuperação](navigation-result.json).

As 24 verificações HTTP conferem os cinco cargos, consulta de assinatura alheia, grupo sem vínculo, consulta malformada, filtros reais de devoluções, paginação com cursor, PIX simultâneo/reutilizado e pagamento pendente sem ativação. Não representam 24 cobranças: as operações usam exclusivamente um cliente externo simulado.

As tentativas iniciais de navegador em modo de desenvolvimento excederam o prazo durante a compilação sob demanda. Essa rodada foi interrompida e separada dos resultados do build de produção local. A primeira rodada do build local teve 9 aprovações e uma falha no menu do perfil no WebKit desktop. O caso foi reproduzido isoladamente: `blur` com `relatedTarget` nulo fechava o menu antes do clique. O fechamento foi corrigido, com testes específicos do Header e nova rodada completa. A rodada seguinte aprovou 9/10 cenários e encontrou a disputa de foco com a revalidação no Chromium 768 px; o último commit corrige esse caso, com os cinco testes locais do diálogo aprovados e nova execução integrada discriminada acima. O CI também detectou a preparação instável do login no teste de convite; o ajuste está no commit final. A primeira execução local direcionada do Jest aprovou os testes, mas terminou com erro no limiar global de cobertura; a execução direcionada correta e a suíte completa do CI estão discriminadas acima.

## Ambiente e limites da validação

O frontend consultou um Nest compatível com as Fases 1, 2 e 3, com controladores e serviços reais de assinatura, estratégia JWT real, guards reais de tenant e cargo, PostgreSQL isolado e gatilhos reais. O provedor externo de pagamentos foi substituído por um cliente simulado. O banco `billing_phase3_final_test` recebeu as três migrações em ordem pelo runner de fixture do backend, partindo do formato anterior à Fase 1; não se declara uma aplicação de toda a árvore histórica de migrações em produção. [Registro da validação](migration-result.json). Outra base local de testes recebeu a repetição dos E2E financeiros. Nenhum endereço de banco de produção foi utilizado.

Login, notificações, dashboard e outros recursos administrativos fora da assinatura usam uma fixture. Isso não homologa o AppModule completo nem o login real do produto. A separação entre grupos e permissões foi verificada também no backend real. A troca rápida A→B→A, troca de conta, respostas atrasadas e descarte de PIX antigo têm testes de componente com mocks; não se declara que todos esses cenários foram repetidos operacionalmente entre dois grupos no navegador.

Os fluxos financeiros completos de confirmação posterior, webhooks, cupons, cancelamento e recuperação continuam cobertos pelas suítes financeiras de PostgreSQL/HTTP com provedor simulado. Nesta homologação, a navegação integrada exercita as consultas e o PIX; não se declara uma contratação externa real no Mercado Pago. O retorno do checkout não foi tratado como confirmação de pagamento.

A instalação local disponível usa Next 15.5.28 e Playwright 1.56.1, fontes Google substituídas por Arial somente no ambiente de teste e instrumentação Sentry desativada no build local. O CI usa o lockfile com Next 15.5.29 e Playwright 1.57.0 e o build padrão. As capturas do CI com fixtures fornecem a referência adicional de renderização desse build; elas não devem ser confundidas com as capturas integradas. O preview do commit final está [Ready na Vercel](https://vercel.com/vanderson-rochas-projects/fut7pro-web/6PxxQCHfQUh6omCg5EgAamFi7W57), confirmado por consulta ao serviço. Não se declara esse preview operacional com as APIs pendentes: a validação integrada ocorreu localmente.

## Segurança, permissões e revisão

| Cargo verificado por HTTP real | Histórico detalhado | Cancelamento |
|---|---|---|
| Presidente | Permitido | Permitido conforme o estado |
| Vice-Presidente | Permitido | Negado |
| Diretor Financeiro | Permitido | Negado |
| Diretor de Futebol | Negado; somente resumo e pagamento permitidos | Negado |
| SuperAdmin | Permitido no contexto do grupo | Permitido conforme o estado |

As capacidades dependem do estado da assinatura e das operações em curso. A interface não concede autorização por datas. As rotas continuam exigindo autenticação e escopo de grupo; parâmetros e registros de outra assinatura foram rejeitados. URLs de pagamento continuam limitadas aos hosts HTTPS permitidos do Mercado Pago. Não foram modificadas credenciais ou permissões comerciais.

As duas discussões de revisão anteriores permanecem resolvidas: texto da recompensa na fixture web e recuperação de cancelamento incompleto no backend. Nova consulta em 27/11/2026 confirmou ambos os PRs abertos, mergeáveis, sem novos apontamentos e com os mesmos heads. Isso não substitui a revalidação após atualizar as branches de dependência.

A auditoria de dependências não permite declarar segurança integral aprovada. O limiar bloqueante existente é **critical**; o audit de **moderate** é informativo. Os 32 resultados altos incluem múltiplos caminhos de dependência e não significam 32 falhas comprovadamente exploráveis na Central. Há alertas em PostCSS, Zod e dependências de Sentry/Prisma. O Zod é direto e o relatório aponta correção em outra versão principal, o que exige avaliação de compatibilidade das validações do produto. Não foram aplicadas atualizações principais indiscriminadas nesta homologação. A triagem de exposição e a atualização compatível dessas dependências permanecem pendentes antes de declarar a aplicação integralmente aprovada em segurança.

Prioridade recomendada: revisar primeiro o Zod usado em validações executadas pela aplicação; o audit informa correção a partir de 4.6.6, em outra versão principal. Para PostCSS, revisar o pacote direto e a cópia transitiva do Next em conjunto. As cadeias de Sentry/webpack e Prisma/config também precisam ser atualizadas e revalidadas, mesmo quando os avisos descrevem ferramentas de build. Não foi demonstrada exploração dessas ocorrências nesta Central, nem se declarou ausência de exposição.

O Snyk foi ignorado pela condição `env.SNYK_TOKEN != ''`. Não houve varredura Snyk nesta entrega. Para habilitá-lo é necessário configurar a integração externa, fixar a ação em revisão confiável e confirmar a compatibilidade do scanner com o lockfile; nenhuma dessas credenciais foi alterada. O audit executado e seus alertas estão disponíveis no artefato informado acima.

## Dependências e sequência de integração

Backend **#199 → #200 → #201 → #202 → #203 → #204**. Frontend **#272 → #273**, depois do backend compatível.

Migrações anteriores, nesta ordem:

1. `20261122010000_billing_durable_operations`.
2. `20261122020000_durable_webhook_inbox`.
3. `20261122030000_subscription_history`.

Não há migração nova na Fase 3. Os PRs anteriores foram conferidos abertos, sem merge, sem conflitos indicados e com os mesmos commits. Ao integrar, atualizar a base e revalidar os checks de cada PR encadeado. Backend e schema precisam estar compatíveis antes do frontend #273. Preservar o histórico e os gatilhos; não reconstruir benefícios antigos.

Não houve merge, publicação em produção, migração de produção, cobrança real ou início da Fase 4. Esta branch contém somente evidências adicionais para revisão.
