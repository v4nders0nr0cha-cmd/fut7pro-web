# Auditoria de modais e confirmações — 13/11/2026

## Escopo e critério

Foram revisados os componentes com nomes `Modal`, `Dialog`, `Drawer` e `Sheet`, além de sobreposições implementadas diretamente nas páginas. A prioridade foi manter título, fechamento e ações acessíveis em telas baixas, reservar uma única área de rolagem para o conteúdo, preservar dados e ações existentes e simplificar mensagens dirigidas a administradores de grupos. As imagens fornecidas pelo usuário serviram como referência para o convite administrativo e o PIX.

## Achados e correções por fluxo

| Fluxo auditado                                                                          | Problema encontrado                                                                                                                                        | Correção                                                                                                                                                                         |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Convite e escolha de atleta para administrador                                          | Convite longo, termos técnicos, cartões apertados; escolha de atleta sem limite adequado de altura                                                         | Texto direto, opções de mensalidade legíveis, caixa de próximos passos, escolha no diálogo base com cabeçalho e ações persistentes                                               |
| PIX em Planos e Limites                                                                 | QR Code, código, resumo e validade numa coluna longa; fechamento e resumo fora da janela em altura reduzida; navegação inferior cobria o rodapé no celular | Valor em destaque, QR e cópia organizados, resumo e validade separados, cabeçalho e rodapé persistentes, camada acima da navegação, conteúdo rolável e folha inferior no celular |
| Outros diálogos de Planos e Limites                                                     | Fechamento pouco visível e conteúdo extenso                                                                                                                | Botão de fechar no cabeçalho, limite de altura e rolagem no próprio diálogo                                                                                                      |
| Mensalistas, inadimplentes, detalhes de pagamento e lançamento financeiro               | Listas e formulários extensos podiam produzir rolagem dupla ou ações fora da tela                                                                          | Limite por viewport, rolagem concentrada no conteúdo e ações preservadas                                                                                                         |
| Jogadores, dias de mensalista, nível dos atletas e cadastro/edição de partidas          | Formulários e listas densos em altura pequena                                                                                                              | Altura máxima dinâmica, conteúdo rolável, cabeçalhos e controles acessíveis                                                                                                      |
| Conquistas, regras, destaques, campeão do dia, resultados e histórico                   | Janelas informativas ou de edição com altura fixa/sem limite suficiente                                                                                    | Estrutura responsiva, rolagem interna e apresentação em folha inferior quando apropriado                                                                                         |
| Comunicação: enquetes, sugestões, suporte e comunicados                                 | Caixas de confirmação extensas em telas pequenas                                                                                                           | Limite de altura e rolagem no diálogo                                                                                                                                            |
| SuperAdmin: admins, rachas, notificações, integrações, localização e vínculos de contas | Conteúdo denso, algumas listas com segunda rolagem e ações baixas                                                                                          | Diálogos compartilhados onde possível; demais janelas limitadas à viewport, com rolagem única e fechamento visível                                                               |
| Recorte de imagens, patrocinadores e cadastro público                                   | Editor de imagem e pedidos em sobreposição podiam ultrapassar a altura útil                                                                                | Dimensões pela viewport e área rolável                                                                                                                                           |
| Avisos de sucesso, compensação de acesso, tema e conquistas premium                     | Variações do mesmo padrão visual                                                                                                                           | Alinhamento de altura, cabeçalho e ações ao padrão compartilhado                                                                                                                 |
| Entrada e cadastro públicos, bloqueio no login administrativo e card do atleta          | Sobreposições próprias sem limite suficiente em telas baixas                                                                                               | Altura dinâmica, rolagem no painel e apresentação em folha inferior no celular                                                                                                   |
| Confirmação de ações de embaixadores no SuperAdmin                                      | Formulário extenso com ações que podiam sair da tela                                                                                                       | Cabeçalho e rodapé preservados, conteúdo rolável                                                                                                                                 |
| Menu inferior de Solicitações, menu lateral mobile, ajuda contextual e avisos públicos  | Controles de fechamento, rolagem e foco conferidos; não havia o mesmo corte das capturas                                                                   | Mantidos sem mudança de comportamento                                                                                                                                            |

## Padrão adotado

`Fut7DialogBase` concentra a largura por tamanho, altura máxima com `dvh`, cabeçalho com título e `X`, uma área rolável com `overscroll-contain`, rodapé de ações, espaço seguro inferior, Escape, retorno de foco e retenção de foco dentro do diálogo. No celular apresenta folha inferior; em telas maiores, diálogo central. `Fut7ConfirmDialog` usa o mesmo padrão e apresenta a lista de efeitos sob o título mais claro “O que acontece depois”. Diálogos com layout próprio seguem as mesmas medidas quando a migração completa não é apropriada.

## Inventário revisado

- **Administração e financeiro:** convite e seleção de administradores; Planos e Limites (pagamento, PIX, faturas, troca de plano e cupom); mensalistas, inadimplentes, detalhe de pagamento, lançamento de prestação de contas, patrocinadores e recorte de logo.
- **Jogadores e partidas:** listar/cadastrar jogadores, mensalistas, nível dos atletas, cadastro de torneio, edição de partida e de campeão, finalização de partida clássica, resultados do dia, histórico, regras e destaque do dia.
- **Comunicação e conquistas:** enquetes, comunicados, sugestões, suporte, campeão do dia e modais de conquistas.
- **SuperAdmin:** novo/editar/detalhes de administrador, senha redefinida, detalhes de racha, criação e prévia de notificação, integrações, localização, vínculos de contas e confirmação de ações de embaixadores.
- **Público e atleta:** entrada e cadastro, pedido de participação, avisos de acesso, recorte de imagem, visualização do card e conquistas premium.
- **Navegação e ajuda, já adequadas:** menu de Solicitações, menu lateral mobile, ajuda contextual, aviso público de autenticação e decisão de entrada do atleta.

## Textos simplificados

- “Condição da mensalidade” → “Mensalidade” ou “Como ficará a mensalidade dele?”
- “Mensalista isento de cobrança” → “Administrador sem pagar mensalidade”
- “Mensalista com cobrança normal” → “Administrador pagando normalmente”
- A opção sem mensalidade esclarece que a escolha vale enquanto estiver ativa e pode ser alterada depois pelo presidente.
- Explicações sobre isenção, cobrança e concessão de permissões foram reescritas com o evento concreto: aceitar o convite.
- “Impacto da ação” → “O que acontece depois”.
- No PIX, as instruções foram reduzidas ao ato de escanear ou copiar o código; total, período e validade ganharam rótulos separados.

## Revisão complementar

- O diálogo compartilhado devolve o foco ao controle que o abriu mesmo quando é removido da árvore. Ao voltar da confirmação do convite, o foco vai para “Continuar” na seleção; ao cancelar a seleção, volta ao botão que a abriu.
- Uma prévia local temporária permitiu inspecionar no celular os modais de dias do mensalista, regras do Time Campeão, detalhes de pagamento, detalhes de administrador no SuperAdmin e recorte de foto no cadastro. A prévia foi removida após a inspeção e não faz parte do produto.
- Nessa amostragem, as regras da partida foram divididas em etapas curtas, o valor do pagamento passou a exibir centavos e o botão de fechar o recorte ganhou área de toque maior.

## Limites da cobertura

O roteiro `tests/modal-ux-viewport.fixture.spec.ts` abriu o convite e o PIX com fixtures locais e verificou geometria, rolagem interna, bloqueio da página ao fundo, Escape, retorno de foco e ausência de botões cobertos em 1280×800, 768×1024, 390×844, 320×640 e 640×320. As capturas de celular e desktop foram inspecionadas visualmente. Outros cinco fluxos receberam amostragem visual em 390×844. Os demais fluxos não foram abertos individualmente em todos os navegadores e tamanhos; essa validação ainda é recomendada antes do merge.

Esta mudança é de interface. Não altera cálculo, cobrança, Mercado Pago, permissões, API nem banco. O fluxo PIX usa cobrança sintética no roteiro visual; os testes de interface não comprovam o processamento financeiro nem substituem a validação de uma cobrança de teste controlada.
