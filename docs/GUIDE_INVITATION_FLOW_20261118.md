# Convites do Guia Interativo — fluxo em dois momentos

## Apresentação

O painel mantém o modal existente. Na primeira tela, WhatsApp e Instagram aparecem lado a lado no desktop; em telas menores que 768 px, há seleção compacta e somente um card por vez. O cadastro manual não é uma terceira opção inicial. As imagens só são montadas quando a pessoa pede “Ver exemplo”, dentro de uma área com altura limitada. Retorno preserva o canal e o foco.

Copiar ou abrir um aplicativo leva à pergunta “Conseguiu compartilhar o convite?”. Não existe temporizador, listener de foco ou visibilitychange para concluir. A declaração exige um clique consciente. O painel apresenta “Etapa concluída!” somente depois que o backend indicar ACTIVE_PLAYERS concluída no GET, inclusive quando isso ocorrer por um cadastro real ou por progresso antigo.

Na conclusão, o cadastro manual é opcional, condicionado à permissão existente. A vinculação foi auditada no backend e exige conta presente no mesmo grupo. A sugestão do outro canal considera cópias, aberturas e confirmações já registradas, sem obrigar a usar os dois.

“Continuar para a próxima etapa” mantém o mesmo modal e a rota, seleciona a próxima pendência calculada dos dados reais e restaura o foco no progresso. Transições recém-liberadas aguardam a saída da orientação de convite, evitando ocultar a tela de conclusão antes da hora. Em seguida, os marcos persistentes seguem as regras anteriores.

## Persistência e contrato coordenado

Dependência: backend #191 precisa oferecer as novas ações antes de publicar o frontend #261. O backend #191 passou a conter essa mudança operacional, além do anúncio anterior; o motivo e o contrato estão documentados em docs/GUIDE_INVITATION_CONTRACT_20261118.md daquele repositório. Não há migração.

- INVITATION_COPY_RECORDED registra somente a cópia bem-sucedida por canal, em invitationCopies.
- RESOURCE_VIEWED continua registrando aberturas de WhatsApp/Instagram, sem concluir a etapa.
- INVITATION_SHARED_CONFIRMED registra a declaração do administrador em invitationConfirmations. Não significa que o aplicativo externo verificou envio ou publicação.
- INVITATION_COPIED e invitationCopiedAt permanecem compatíveis com clientes/progressos antigos. A interface nova não usa essa ação.

O proxy mantém uma lista explícita de campos; somente ação, canal e revisão são enviados. O hook mantém o cache por administrador/grupo, a fila de mutações e a recuperação controlada de conflitos 409 para as novas ações idempotentes.

Uma intenção não confirmada pode ser retomada pelo registro existente de cópia/abertura e por uma chave temporária de sessionStorage, isolada por grupo e Membership. Essa chave não conclui etapas nem autoriza ações. Não existe estado temporário de telas persistido no banco. Erros de clipboard não registram cópia; falhas de confirmação permitem tentar novamente. Se o PATCH for aceito mas a leitura falhar, “Atualizar progresso” pode repetir a confirmação de forma idempotente, sem desenhar conclusão fictícia.

## Limites preservados

Nenhuma alteração nos requisitos das demais etapas, mínimo de dez atletas, recompensa, cobrança ou Creator. Um convite não conclui as oito etapas e não concede bônus isoladamente. Conclusões e recompensas antigas permanecem.

O banner, saudação, fases, rodapé de dispensa, acesso manual imediato, X por login, preferências permanentes e contexto de retorno não foram redesenhados. A origem do cadastro manual usa a propriedade existente: modal retorna pelo fluxo modal; página completa usa guiaOrigem=pagina.

## Verificação

Testes unitários verificam cópia, apps, declaração, falhas, idempotência, permissões, exemplos, seleção da próxima pendência e marcos. Os percursos Playwright usam autenticação local e backend de teste isolado, com clipboard e aplicativos externos controlados, em Chromium desktop/320/390 e WebKit/iPhone emulado em 320/390. Teste transacional do backend verifica a confirmação no JSON real da Membership sem concessão extra de recompensa. Resultados finais e capturas ficam nos PRs e no relatório de entrega.

PRs de revisão: frontend #261 e backend #191, ambos em rascunho. Sem merge, deploy manual, migração ou alteração em produção.
