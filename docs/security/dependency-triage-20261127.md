# Triagem de dependências do frontend — 27/11/2026

## Origem e comparação

Base de trabalho: frontend #273, commit `4f4ebdd72b4a055bfbd8ce034059e80105e2bd86`. A branch de segurança preserva #273 e backend #204. Não há migração, alteração do backend, merge ou publicação em produção.

O [JSON original do CI](https://github.com/v4nders0nr0cha-cmd/fut7pro-web/actions/runs/45987961949/artifacts/15192476318) foi baixado e o SHA-256 do ZIP conferido: `9b9bdf7ef57df9394f32ae7dd1cdc787f7a39b04f905654f53d60a52485b23fb`.

A `main` consultada era `4057c8c84ffe8437e55886c235abf44f011983a8`. Seus `package.json`, `pnpm-lock.yaml` e antigo `package-lock.json` eram byte a byte os mesmos blobs Git do #273. Uma nova consulta do audit confirmou o conjunto inicial. Portanto, nenhuma das ocorrências altas/críticas desse grafo foi introduzida pelo #273.

O relatório original possui 50 registros de advisory. As 32 ocorrências altas correspondem a 28 registros npm, 27 GHSAs e 11 pacotes. O mesmo GHSA de picomatch cobre duas versões principais e caminhos distintos: esses casos não foram descartados como duplicatas. A chave de consolidação é pacote + GHSA + versão instalada + caminho lógico completo.

A [matriz JSON](../../security/dependency-triage-20261127.json) preserva as 32 combinações, os caminhos, a origem, a classificação e a resolução de cada caso.

## Correções e exposição

| Pacote/grupo                    | Uso encontrado                                        | Tratamento                                                                                                |
| ------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| PostCSS                         | Compilação CSS do projeto e cópia do Next             | 8.5.31 nas duas origens; mesma versão principal 8                                                         |
| nanoid / source-map-js          | Identificadores e mapas do PostCSS                    | Resoluções corrigidas na cadeia CSS                                                                       |
| browserslist                    | Alvos de compilação e estatísticas do repositório     | Atualização controlada na versão principal 4                                                              |
| picomatch                       | Watcher e padrões do bundler                          | Corrigidas as ramificações 2 e 4, sem converter uma na outra                                              |
| brace-expansion                 | Expansão de globs do build Sentry                     | Atualizada somente a ramificação 5 já existente                                                           |
| fast-uri                        | Validação de configuração de webpack/schema-utils/Ajv | Patch na versão principal 3; o validador de URL de pagamento não utiliza essa biblioteca                  |
| effect / defu                   | Carregamento de configuração do Prisma                | Atualização dentro das versões principais 3 e 6, respectivamente                                          |
| webpack e cadeia do minificador | Integração de build do Sentry                         | Peer explícito 5.111.1, já presente no antigo lock npm; evita manter o peer automático vulnerável 5.102.1 |
| Zod                             | Formulários e validação de respostas no navegador     | Proteção da coleção com limite existente; exceção temporária descrita abaixo                              |
| deepmerge-ts                    | Configuração interna do Prisma                        | Exceção temporária descrita abaixo                                                                        |

Next.js 15.5.29, Sentry 10.75.2, Prisma/Client 6.17.1, React e as bibliotecas de interface mantêm suas versões diretas do lock pnpm homologado. Mudanças de contexto de peers não representam atualização dessas bibliotecas. As novas dependências internas declaradas pelo webpack ficam sujeitas ao build e às regressões completos; não são overrides arbitrários entre versões principais.

A classificação considera os pontos de chamada, e não apenas o campo dependencies/devDependencies. O CLI/config do Prisma pode aparecer no grafo de produção por meio de peers do Client, embora não seja um parser de requisições. Os processadores de CSS, mapas, globs e alvos de navegador recebem configuração e arquivos do repositório; não foi encontrada uma rota que encaminhe CSS, globs ou configurações Prisma arbitrários dos grupos para essas ferramentas.

## Duas exceções propostas, com vencimento em 11/12/2026

### Zod — GHSA-mrhx-c7xc-m3w5

Permanece instalado `zod@3.25.76`, exclusivamente no caminho `.>zod`. O alerta do pacote continua alto. Não há alegação de correção por versão nem de falso positivo.

Os consumidores atuais foram examinados: helpers dos hooks de leitura do grupo, editor Nossa História e formulário de configuração SuperAdmin. A página pública Nossa História importa somente constantes do módulo de schemas. Não foi identificado um handler de API que parseie corpos de requisição com Zod. Essa revisão estática não substitui análise geral de fluxo de dados.

A galeria já tinha limite de seis fotos. O helper `boundedArray` agora produz um erro fatal de tamanho antes de acessar qualquer elemento acima desse limite. O teste usa uma coleção esparsa de 100 mil posições com um getter que falha se algum item for lido. Também cobre seis fotos válidas, sete fotos rejeitadas, campo opcional e validação normal dos itens.

O [patch oficial v4](https://github.com/colinhacks/zod/pull/6652) antecipa os limites de tamanho declarados; coleções sem limite continuam sem essa proteção. Migrar apenas o número da versão não resolveria essa segunda situação. Uma migração v3/v4 também exige verificar UUIDs, e-mails, records, tipos e formato de erros existentes. Não foi feita uma migração principal para silenciar o audit.

Risco residual: consumo de recursos no navegador diante de respostas ou conteúdos excessivos, especialmente coleções sem limite. A mitigação não limita o tamanho de uma resposta HTTP antes de seu JSON ser carregado. Novos consumidores precisam de revisão; o inventário de imports literais bloqueia consumidores não revisados dos módulos relacionados.

### deepmerge-ts — GHSA-ggr8-5vv4-36mx

Permanece `7.1.5` no caminho `.>@prisma/client>prisma>@prisma/config>deepmerge-ts`. O [advisory](https://github.com/advisories/GHSA-ggr8-5vv4-36mx) exige grafos JavaScript cíclicos nas entradas da mesclagem. JSON comum não representa esse ciclo. Os grupos não controlam a configuração executável local do Prisma e a aplicação não importa esse parser para tratar requisições.

O Prisma atual declara essa dependência interna na versão principal 7. A correção publicada é na principal 8. Injetar 8 sem suporte/verificação da cadeia Prisma alteraria uma dependência interna fora de seu contrato. Essa troca foi adiada; a revisão deverá buscar uma combinação suportada ou backport antes do vencimento.

Responsável registrado nas duas entradas: manutenção de segurança do Fut7Pro. Ambas têm evidências, versão e caminho exatos. A aceitação do PR inclui revisar essas exceções; o CI não equivale a uma aprovação integral e permanente de segurança.

## Um único grafo de instalação

O frontend já declara pnpm 10.19.0 e o CI usa seu lockfile. O Dockerfile ainda executava npm e consumia outro grafo. Tentar regenerá-lo com novos overrides trouxe atualizações de bibliotecas de interface sem relação com a segurança; essas alterações foram descartadas.

Docker agora usa o pnpm declarado e o mesmo `pnpm-lock.yaml`. O lock npm alternativo foi removido; um preinstall explica o comando correto se outro gestor for usado. Os overrides npm redundantes foram removidos, mantendo a configuração efetiva em `pnpm.overrides`. O README principal foi alinhado.

O build da imagem gera o Client com URL fictícia e desabilita acesso direto ao banco durante a compilação. Não executa SQL ou migrações. As dependências exclusivas de desenvolvimento são removidas antes de copiar os módulos para o estágio final. A imagem roda com usuário não root e a checagem de runtime exige o Client gerado. A flag de banco usada na compilação não é definida no estágio final.

O contexto Docker exclui arquivos .env, configuração npm, caches, Git, evidências e arquivos locais de ferramentas. A imagem de validação do CI usa API loopback e não é publicada. O job verifica o build real e o carregamento dos módulos de produção; não representa um teste operacional do Docker contra serviços de produção.

## Política de CI

- Críticas sempre bloqueiam, inclusive quando há uma entrada correspondente de exceção.
- Altas sem exceção revisada bloqueiam, independentemente de quantidade ou de serem preexistentes.
- Exceções correspondem a GHSA, pacote, versão instalada e caminho exatos; não aceitam curingas ou faixas de versões. Exigem escopo, evidência, responsável, justificativa e prazo máximo de 30 dias. As duas entradas desta entrega usam 14 dias.
- Exceções vencidas, malformadas, duplicadas ou que deixaram de corresponder a um alerta bloqueiam.
- As exceções também ficam vinculadas ao SHA-256 do lockfile revisado. Mudar um pai da dependência ou qualquer outra resolução exige nova revisão; manter a mesma versão vulnerável na folha não carrega a exceção automaticamente para outro grafo.
- Falha de coleta, JSON inválido, formato desconhecido, detalhes ausentes e alertas suprimidos impedem a aprovação do gate.
- Baixas e moderadas continuam no relatório. Não há bloqueio por contagem bruta nem supressão global de pacotes.

O inventário de imports cobre os consumidores literais revisados. Ele sinaliza novos usos, inclusive imports relativos e o subpath zod/v3, mas não é um analisador geral de fluxo de dados nem uma garantia contra código malicioso no próprio repositório.

Os testes da política cobrem crítica, alta nova, duplicação de advisory, mudança de versão/caminho, validade da exceção e falhas do audit. Os workflows relevantes também aceitam a branch de dependência #273 para executar a suíte completa, Admin Smoke, Guia e mobile antes de qualquer merge.

## Análise adicional sem serviço pago

Foi incluída consulta gratuita à API pública OSV. O cliente envia somente nome/ecossistema/versão dos pacotes, sem código, dados dos grupos ou tokens. Deduplica versões, usa lotes limitados e timeout, e distingue execução concluída de indisponibilidade. Os testes simulam a resposta externa; a execução real fica registrada no artefato `security-osv.json`.

A consulta local usa o grafo de produção derivado do lockfile; a execução do CI usa a árvore efetivamente instalada. Os bancos OSV/GitHub têm cobertura parcialmente compartilhada: essa segunda consulta não é uma pesquisa independente de exploração nem substitui SAST ou teste de invasão. Novos resultados exigem triagem antes de declarar conclusão de segurança.

Snyk permanece condicionado ao token. Se o token estiver ausente, não foi executado, mesmo que o job esteja verde. A revisão da ação foi fixada em SHA; nenhuma credencial foi criada ou alterada.

## Resultados e integração

O arquivo de triagem informa as contagens efetivamente consultadas antes/depois. Há 30 combinações altas corrigidas e duas tratadas pelas exceções acima. Os alertas baixos/moderados restantes estão disponíveis no artefato do audit; suas cadeias de build também exigem manutenção, sem forçar atualizações principais de glob/minimatch.

Os resultados finais dos testes, build Docker, tipos, lint, Guia, Central e da consulta OSV são registrados nos checks e na descrição do PR. Não se antecipam aprovações ainda não executadas.

Integração futura: preservar a ordem backend #199 → #200 → #201 → #202 → #203 → #204 e frontend #272 → #273 → PR de segurança. Retargetar e revalidar as branches após integrar cada dependência. Não há mudança no backend ou nas três migrações já documentadas. Não houve merge, produção, cobrança real ou início da Fase 4.
