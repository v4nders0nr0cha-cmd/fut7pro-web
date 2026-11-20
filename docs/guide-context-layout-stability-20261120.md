# Estabilidade do banner contextual do guia

## Causa

`AdminGuideContext` removia a contagem, a lista de horários e a orientação inferior ao iniciar uma revalidação. A descrição era substituída por uma frase curta. O título e o status também podiam quebrar em quantidades diferentes de linhas, e o botão de retorno mudava de largura. Na primeira consulta sem cache, o banner inteiro só entrava no fluxo após a resposta.

O hook já conserva a última resposta durante uma revalidação, com chave separada por usuário e grupo e `keepPreviousData: false`. Não foi necessário criar outro cache, alterar o hook ou modificar o controlador.

## Implementação

- As regiões de título, status, descrição, progresso e ações usam sobreposição em CSS Grid. Textos de dimensionamento invisíveis e `aria-hidden` reservam a área com a própria fonte e largura disponíveis. Os textos de dimensionamento usam pseudo-elementos, sem valores numéricos inventados ou controles interativos.
- A reserva é específica do contexto. Somente as etapas que apresentam informação complementar recebem esse espaço. Não há altura fixa no card nem corte de conteúdo.
- Na consulta inicial, a estrutura neutra e os skeletons estáticos ocupam os espaços previstos. Eles não oferecem ações de etapa nem mostram informações do grupo antes da confirmação das permissões.
- Durante atualização ou falha, a última resposta oficial permanece visível, identificada como “Última confirmação”. O status deixa de mostrar conclusão atual até a validação terminar. O botão de recuperação reutiliza a consulta existente.
- As condições originais de acesso, conclusão, contagem e desbloqueio permanecem nas funções existentes. Recusas 401/403/404 removem o banner. A URL só seleciona uma estrutura de carregamento em rotas conhecidas; não concede permissões.
- As instruções continuam recolhidas por padrão. A revalidação não troca o formulário, o seu foco nem o elemento `details` da mesma etapa e sessão.

## Medição reproduzível

Workflow: `.github/workflows/guide-context-layout.yml`.

O job `before` restaura somente o componente original do commit `16a2270d130faf1fd4a1f2aa9ac66c4abf940bc8` antes do build. O job `after` compila a correção. Os dois usam a mesma infraestrutura de API isolada, autenticação e cenários. Nenhuma chamada é enviada para o backend de produção.

`tests/guide-context-layout.fixture.spec.ts` executa Chromium em 1280, 390 e 320 CSS px e WebKit em 390 e 320 CSS px. As consultas são pausadas por uma promessa controlada no backend de teste, sem atrasos temporizados no produto.

O teste marca com um atributo o elemento operacional que já existe abaixo do banner. Não insere espaçadores. Compara sua coordenada no documento (`getBoundingClientRect().top + scrollY`) e registra separadamente a altura do banner e a coordenada no viewport. Isso distingue estabilidade real de compensações pelo scroll anchoring.

Transições medidas:

1. Consulta inicial para resposta confirmada, tanto concluída quanto em andamento na avaliação de atletas.
2. Dados confirmados para revalidação.
3. Revalidação para uma mudança oficial de contagem/descrição, preservando a conquista histórica.
4. Salvamento real pelo editor de estrelas e a revalidação disparada pelo hook operacional.
5. Falha de consulta e recuperação, com preservação de rascunho e foco na página.

Os oito contextos cobertos são jogadores, times, horários, avaliações, preparação de rodada, resultados, campeão e recrutamento adicional.

### Tolerância

A posição do conteúdo no job `after` pode variar no máximo **um pixel físico**, convertido para CSS px por `1 / devicePixelRatio`. A tolerância cobre arredondamento de coordenadas rasterizadas entre pinturas; não depende da altura do banner nem do tamanho do salto observado na versão anterior. O job `before` apenas mede o comportamento original, sem aplicar o limite da correção.

São aguardadas duas pinturas com `requestAnimationFrame` antes de cada amostra. As fontes da página são confirmadas antes da primeira medição. Não há `setTimeout`, animação de altura ou espera artificial no componente.

### CLS e capturas

Quando suportado, `PerformanceObserver` registra cada `layout-shift`, seu valor, `hadRecentInput` e as fontes classificadas em guia, conteúdo operacional e outras áreas. Os eventos brutos ficam no JSON, permitindo verificar a relação com a mudança de altura do guia sem atribuir a ele deslocamentos da própria página. WebKit pode não disponibilizar essa API; a medição geométrica permanece obrigatória nos dois navegadores.

Artefatos `guide-layout-before` e `guide-layout-after`: `layout-metrics.json`, capturas de carregamento e confirmação, relatório Playwright e evidências de falha, quando houver. Os resultados observados são apresentados no PR após a execução, sem números estimados neste documento.

## Limites intencionais

- Texto maior que todas as variantes previstas, zoom ou largura alterados pelo usuário e quantidade adicional de dias podem expandir o card. O conteúdo permanece legível, sem truncamento; não se fixa um limite artificial para esconder informação.
- A reserva de horários cobre a informação comum e os registros já disponíveis. Uma lista nova com muitos dias pode crescer legitimamente depois da primeira resposta.
- Recusa de autorização ou mudança de usuário/grupo pode remover a estrutura provisória. A proteção das informações prevalece sobre a manutenção de espaço de uma orientação que deixou de ser autorizada.
- Abrir as instruções detalhadas aumenta o banner por ação explícita do administrador.
