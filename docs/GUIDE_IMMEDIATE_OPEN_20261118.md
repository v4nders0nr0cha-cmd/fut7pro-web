# Abertura imediata do Guia Interativo — 18/11/2026

## Diagnóstico

O apresentador já fazia parte do layout administrativo, mas o atalho navegava para `/admin/dashboard?retomarGuia=1&grupoGuia=...`. Na Dashboard, a abertura aguardava `retry()` antes de tornar o diálogo visível. Uma API lenta, portanto, atrasava a própria janela; o cache existente não eliminava essa espera. Os acessos também retiravam o administrador da página em que estava trabalhando.

A sessão e o grupo já estavam resolvidos no momento do clique instrumentado. Não houve chamada duplicada no percurso medido: cada amostra emitiu um GET. O problema confirmado foi a dependência entre apresentação e resposta, acrescida da navegação para quem estava em outra página. A medição não atribui a latência real de produção ao backend, pois nenhuma consulta de produção foi instrumentada.

## Alteração

`AdminGuideControllerProvider`, dentro do layout autorizado, compartilha a intenção manual com os dois atalhos e o apresentador existente. O clique muda estado local sem navegar. O diálogo é o mesmo durante carregamento, falha, nova tentativa e conteúdo.

Com cache do administrador/grupo ativo, as explicações aparecem imediatamente; as ações operacionais ficam bloqueadas até a confirmação atual das permissões. Sem cache, aparecem título, X, mensagem de carregamento e três indicadores discretos. Falhas oferecem “Tentar novamente”. A leitura tem limite de quinze segundos; fechar a janela invalida a intenção, sem cancelar leituras compartilhadas necessárias a outros componentes.

O hook mantém a chave SWR por usuário e grupo. A abertura aproveita uma consulta já em andamento; só solicita outra quando não existe leitura pendente. Respostas fora do escopo ou de uma abertura anterior não reabrem a janela nem liberam ações.

## Continuidade preservada

- Abertura automática apenas na Dashboard, enquanto houver pendências e nenhuma dispensa aplicável.
- X temporário usa o `onboardingLoginId` existente, associado ao administrador e ID estável do grupo, inclusive quando fechado antes do primeiro GET. Também respeita o marcador anterior por membership para compatibilidade.
- `onboardingLoginId` nasce no login real e permanece durante renovação/revalidação. A alteração não modifica a autenticação.
- Dispensa permanente permanece no backend. O acesso manual não apaga preferências.
- As URLs contextuais antigas continuam aceitas; os atalhos rápidos não geram novas URLs intermediárias.
- Marcos já apresentados, celebrações pendentes, recompensa, oito etapas, critérios e visual final foram preservados.
- Nenhum polling novo. Perfil e Mais continuam abrindo a página completa. A dica única e o desaparecimento do livro após conclusão permanecem.

## Medição reproduzível

Build de produção Next, autenticação local real e grupo de teste em ambiente isolado. Playwright Chromium, desktop 1280×800 e celular 390×844. Três cliques por combinação, cache aquecido e GET atrasado deliberadamente em 6000 ms. O teste registra inserção visível do diálogo, primeiro frame via `requestAnimationFrame`, conteúdo, GET, rota e identidade do documento.

Antes: commit `fbb45d6a33f2a20990f5cad9f9bbe3c399dfebbf`, sem alterações do aplicativo. Execução [44408915201](https://github.com/v4nders0nr0cha-cmd/fut7pro-web/actions/runs/44408915201).

| Cenário Chromium   | Mediana até o diálogo antes (ms) |
| ------------------ | -------------------------------: |
| Desktop, Dashboard |                           6038,5 |
| Desktop, Times     |                           6095,3 |
| Celular, Dashboard |                           6027,0 |
| Celular, Times     |                           6091,6 |

Em todas as amostras anteriores, o diálogo só aparecia na Dashboard e havia um GET. Dados brutos anteriores estão no anexo local `baseline.json`. Resultados posteriores e capturas serão acrescentados após a execução completa.

## Arquivos

Produção: `AdminGuideController.tsx` (novo), `AdminGuidePresenter.tsx`, `AdminGuideDialog.tsx`, `AdminGuideMobileAccess.tsx`, `AdminHelpLauncher.tsx`, `AdminOnboarding.tsx`, `AdminLayoutContent.tsx` e `useAdminGuide.ts`.

Verificação: testes do apresentador, atalhos, layout e hook; novos percursos Playwright de cache frio/erro/foco/formulário e de desempenho; atualização do percurso de atalhos; inclusão das verificações no Admin Smoke CI, preservando os testes anteriores.

O backend recebe somente o anúncio canônico e as expectativas da última versão nos testes, conforme a política de publicação coordenada. Não houve mudança em APIs, banco, esportes, cobrança ou Creator.

## Entrega e limites

Frontend [#261](https://github.com/v4nders0nr0cha-cmd/fut7pro-web/pull/261) e anúncio [backend #191](https://github.com/v4nders0nr0cha-cmd/fut7pro-backend/pull/191), ambos em rascunho. Sem merge, deploy manual ou alteração em produção. A API de produção não foi medida; o atraso controlado comprova a independência da abertura visual.
