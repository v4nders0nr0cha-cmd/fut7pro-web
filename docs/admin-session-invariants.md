# Sessão administrativa e registro de partidas

## Incidente de 11/11/2026

Os logs confirmam uma renovação seguida de reutilização de um refresh token já rotacionado e seis respostas inválidas. Eles não identificam qual requisição ou aba gravou por último o cookie. O código anterior permitia a sequência: duas requisições NextAuth liam a mesma sessão; o backend rotacionava o token em uma delas; uma resposta atrasada gravava a versão antiga do cookie; novas tentativas usavam a credencial gasta. O `Map` de single flight cobria apenas requisições simultâneas no mesmo processo e perdia o resultado logo após a conclusão. O backend também criava uma sessão sucessora antes de atualizar a anterior, sem verificar se `updateMany` alterou uma linha, permitindo duas sucessoras em corrida.

## Invariantes

- A renovação normal emite um access token novo e devolve o mesmo refresh token até sua expiração original. Respostas fora de ordem podem trocar o access token, mas não podem ressuscitar uma credencial rotacionada.
- Toda renovação valida assinatura, prazo, hash e estado da `RefreshSession`, usuário atual e associação aprovada ao grupo solicitado. A atualização condicional por ID, usuário, família, hash, prazo e `revokedAt: null` deve afetar exatamente uma linha antes de emitir o access token.
- Logout, logout global, desativação e invalidação de segurança revogam sessões no banco. O sign-out do NextAuth revoga a sessão com o refresh token guardado no JWT do servidor, mesmo se o access token expirou. Refresh tokens já rotacionados continuam rejeitados; nunca se devolve um sucessor a quem apresentar um token antigo.
- Uma resposta 400/401/403 na renovação é definitiva para a credencial apresentada. Falha de rede, 408, 429 e 5xx preservam o refresh token, com espera progressiva de até um minuto. Um access token expirado não autoriza ações protegidas durante essa espera.
- O retorno ao primeiro plano precisa verificar a sessão independentemente dos temporizadores, que podem ser suspensos no iOS.
- Revalidação de acesso não deve desmontar um formulário já aberto por erro transitório. Não se deve afirmar que clicar em “Entrar novamente” preserva entradas locais.
- O resultado do dia guarda um rascunho por usuário, grupo e partida na `sessionStorage` por até seis horas, somente enquanto o retrato de placar e presenças do servidor não mudou. O rascunho é removido após confirmação de gravação. O `PUT` de resultado usa o mesmo estado completo ao repetir uma tentativa. O formulário não deve disparar dois envios simultâneos da mesma edição; após reconexão, tenta novamente no máximo duas vezes sem nova edição.
- Nenhum log de diagnóstico de renovação deve registrar tokens, IDs de usuário, sessão, família ou grupo, nem dados pessoais.

## Riscos e melhorias futuras

A opção de refresh estável elimina a corrida do cookie sem infraestrutura adicional, mas reduz a capacidade de detectar uso furtivo de uma credencial copiada durante os 30 dias padrão. O token permanece no JWT em cookie HTTP only do NextAuth, deixa de ser exposto na resposta da sessão administrativa, tem hash no banco, prazo fixo e revogação. Não se estende o prazo a cada acesso. Uma solução futura poderá usar sessão server side ou sucessor cifrado com confirmação de geração entre instâncias, mantendo rotação e recuperação segura após respostas fora de ordem. Isso exige desenho específico contra replay e não deve ser improvisado com uma janela ampla de aceitação de tokens antigos.

Se o backend estiver indisponível no exato momento do sign-out, o cookie local é removido, mas a revogação remota pode não ocorrer. Esse caso precisa de monitoramento e de um fluxo de revogação confiável no futuro. As sessões existentes com refresh token já gasto antes da implantação desta correção não podem ser recuperadas sem novo login.

O rascunho cobre resultados, gols e assistências na tela Resultados do Dia. O fluxo de partida clássica já usa armazenamento local. Outras telas de edição devem ser avaliadas separadamente. Um rascunho divergente permanece em `sessionStorage` e exige decisão explícita de revisão ou descarte. Reenvios após perda de resposta consultam o estado atual; se a gravação já ocorreu, o resultado idêntico é reconhecido sem novo PUT. Toda gravação de resultado exige a versão lida e avança essa versão na mesma transação que altera placar e presenças; uma edição concorrente recebe 409. A consulta prévia melhora a experiência, mas a transação é a proteção final contra a corrida. O navegador pode limpar `sessionStorage`, portanto ela não substitui confirmação de gravação no servidor.

O PUT genérico de partida não aceita placar, status nem alterações diretas de presenças. Uma troca de times exige a versão atual e usa a mesma proteção transacional. Um cliente sem versão recebe HTTP 428 sem gravar resultado; o frontend atualizado mostra o aviso inclusive se a tentativa era de autosave. Uma aba carregada com JavaScript anterior a esse tratamento pode não exibir o aviso, embora o backend recuse a gravação. Nesse caso, o usuário precisa anotar os dados visíveis antes de recarregar; não há garantia de recuperação automática para código antigo já carregado.
