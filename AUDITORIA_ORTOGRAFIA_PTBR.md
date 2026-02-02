# AUDITORIA_ORTOGRAFIA_PTBR

Data: 2026-02-01
Status: Correções aplicadas em 2026-02-01 (itens abaixo já ajustados no código).
Escopo: src/app/**, src/components/**, src/config/\*\* (apenas texto visível ao usuário)

## Ocorrências (Correções aplicadas)

### src/app/(admin)/admin/comunicacao/comunicados/page.tsx

- L42: ""Administracao"" -> ""Administração""
- L104: "autor: user?.name || "Administracao"," -> "autor: user?.name || "Administração","
- L136: "(meta.autor as string) || (meta.nomeResponsavel as string) || user?.name || "Administracao";" -> "(meta.autor as string) || (meta.nomeResponsavel as string) || user?.name || "Administração";"
- L178: "(meta.autor as string) || (meta.nomeResponsavel as string) || user?.name || "Administracao";" -> "(meta.autor as string) || (meta.nomeResponsavel as string) || user?.name || "Administração";"

### src/app/(admin)/admin/comunicacao/notificacoes/page.tsx

- L176: "autor: user?.name || "Administracao"," -> "autor: user?.name || "Administração","

### src/app/(admin)/admin/conquistas/grandes-torneios/page.tsx

- L59: "Grandes Torneios (Gestao)" -> "Grandes Torneios (Gestão)"
- L62: "Cadastre, edite ou exclua <b>torneios especiais</b> do seu racha. Atletas campeoes" -> "Cadastre, edite ou exclua <b>torneios especiais</b> do seu racha. Atletas campeões"
- L63: "recebem o <b>icone especial</b> em seus perfis." -> "recebem o <b>ícone especial</b> em seus perfis."
- L138: ""Tem certeza que deseja excluir este torneio? Esta acao nao pode ser desfeita."" -> ""Tem certeza que deseja excluir este torneio? Esta ação não pode ser desfeita.""

### src/app/(admin)/admin/conquistas/os-campeoes/page.tsx

- L165: "const errorMessage = rankingAno.error || rankingTimesAno.error || "Erro ao carregar campeoes.";" -> "const errorMessage = rankingAno.error || rankingTimesAno.error || "Erro ao carregar campeões.";"
- L196: "titulo: "Campeao do Ano"," -> "titulo: "Campeão do Ano","
- L207: "valor: topAssist ? `${topAssist.assistencias} assistencias` : "Em processamento"," -> "valor: topAssist ? `${topAssist.assistencias} assistências` : "Em processamento","
- L317: "title: "Campeoes do Racha"," -> "title: "Campeões do Racha","
- L318: "text: "Confira os campeoes do racha no Hall da Fama."," -> "text: "Confira os campeões do racha no Hall da Fama.","
- L351: "<title>Os Campeoes (Admin) | Fut7Pro</title>" -> "<title>Os Campeões (Admin) | Fut7Pro</title>"
- L365: "Os Campeoes (Gestao)" -> "Os Campeões (Gestão)"
- L369: "destaques por posicao." -> "destaques por posição."
- L408: "<h2 className="text-2xl font-bold text-yellow-400 text-center mb-6">Campeoes do Ano</h2>" -> "<h2 className="text-2xl font-bold text-yellow-400 text-center mb-6">Campeões do Ano</h2>"
- L422: "Melhores por Posicao" -> "Melhores por Posição"
- L427: "Carregando posicoes..." -> "Carregando posições..."
- L439: "Campeoes por Quadrimestre" -> "Campeões por Quadrimestre"
- L489: "<p className="mb-2">Ao confirmar esta acao:</p>" -> "<p className="mb-2">Ao confirmar esta ação:</p>"
- L491: "<li>A temporada do racha sera encerrada definitivamente.</li>" -> "<li>A temporada do racha será encerrada definitivamente.</li>"
- L493: "Os rankings anuais serao finalizados e o sistema passara a contabilizar" -> "Os rankings anuais serão finalizados e o sistema passará a contabilizar"
- L497: "As premiacoes anuais (Melhor do Ano, Artilheiro do Ano, Maestro do Ano," -> "As premiações anuais (Melhor do Ano, Artilheiro do Ano, Maestro do Ano,"
- L498: "Campeao do Ano e Melhores por Posicao) serao aplicadas automaticamente nos" -> "Campeão do Ano e Melhores por Posição) serão aplicadas automaticamente nos"
- L502: "As premiacoes do 3o quadrimestre tambem serao aplicadas neste momento, ja" -> "As premiações do 3o quadrimestre também serão aplicadas neste momento, já"
- L503: "que os titulos do 1o e 2o quadrimestres sao concedidos automaticamente ao" -> "que os títulos do 1o e 2o quadrimestres são concedidos automaticamente ao"
- L504: "final de cada periodo." -> "final de cada período."
- L510: "Atencao: apos finalizar a temporada, os resultados nao poderao ser alterados." -> "Atenção: após finalizar a temporada, os resultados não poderão ser alterados."
- L514: "<h4 className="text-yellow-300 font-semibold mb-1">Finalizacao automatica</h4>" -> "<h4 className="text-yellow-300 font-semibold mb-1">Finalização automática</h4>"
- L516: "Caso o ano termine e este botao nao seja acionado, o sistema finalizara a" -> "Caso o ano termine e este botão não seja acionado, o sistema finalizará a"
- L517: "temporada automaticamente no ultimo dia do ano, aplicando todas as premiacoes" -> "temporada automaticamente no último dia do ano, aplicando todas as premiações"
- L539: "Confirmar finalizacao da temporada" -> "Confirmar finalização da temporada"
- L582: "alt="Icone de trofeu"" -> "alt="Ícone de troféu""
- L610: "Compartilhar Campeoes" -> "Compartilhar Campeões"
- L712: "titulo: "Campeao do Quadrimestre"," -> "titulo: "Campeão do Quadrimestre","

### src/app/(admin)/admin/dashboard/page.tsx

- L120: "periodoLabel: doMes.length ? "mes" : "todo historico"," -> "periodoLabel: doMes.length ? "mês" : "todo histórico","
- L147: "nome: vencedor.name || "Time campeao do dia"," -> "nome: vencedor.name || "Time campeão do dia","
- L179: "POS-JOGO" -> "PÓS-JOGO"
- L190: "PRE-JOGO" -> "PRÉ-JOGO"
- L200: "Veja as escalacoes e confrontos automaticos do racha de hoje." -> "Veja as escalações e confrontos automáticos do racha de hoje."
- L203: "Ver Escalacoes" -> "Ver Escalações"
- L210: "PRE-JOGO" -> "PRÉ-JOGO"
- L220: "Monte os times de forma automatica, balanceada e transparente." -> "Monte os times de forma automática, balanceada e transparente."
- L240: "Monetizacao" -> "Monetização"
- L257: "emptyMessage="Cadastre lancamentos para visualizar o desempenho financeiro."" -> "emptyMessage="Cadastre lançamentos para visualizar o desempenho financeiro.""
- L280: "<span className="text-lg font-bold text-gray-100">Mais assiduos</span>" -> "<span className="text-lg font-bold text-gray-100">Mais assíduos</span>"
- L299: "alt={`Jogador assiduo ${j.nome}`}" -> "alt={`Jogador assíduo ${j.nome}`}"
- L312: "<span className="text-sm text-gray-400">Nenhum dado de presenca encontrado.</span>" -> "<span className="text-sm text-gray-400">Nenhum dado de presença encontrado.</span>"
- L314: "<span className="text-xs text-gray-400 mt-2">Ranking por presenca</span>" -> "<span className="text-xs text-gray-400 mt-2">Ranking por presença</span>"
- L351: "<span className="text-sm text-gray-400">Nenhum aniversario proximo.</span>" -> "<span className="text-sm text-gray-400">Nenhum aniversário próximo.</span>"
- L353: "<span className="text-xs text-gray-400 mt-2">Deseje parabens!</span>" -> "<span className="text-xs text-gray-400 mt-2">Deseje parabéns!</span>"

### src/app/(admin)/admin/financeiro/patrocinadores/components/ModalPatrocinador.tsx

- L28: "MENSAL: "Quanto este patrocinador paga por mes?"," -> "MENSAL: "Quanto este patrocinador paga por mês?","
- L34: "MENSAL: "Voce ja recebeu o 1o pagamento mensal deste patrocinador?"," -> "MENSAL: "Você já recebeu o 1o pagamento mensal deste patrocinador?","
- L35: "QUADRIMESTRAL: "Voce ja recebeu o 1o pagamento quadrimestral deste patrocinador?"," -> "QUADRIMESTRAL: "Você já recebeu o 1o pagamento quadrimestral deste patrocinador?","
- L36: "ANUAL: "Voce ja recebeu o pagamento do plano anual deste patrocinador?"," -> "ANUAL: "Você já recebeu o pagamento do plano anual deste patrocinador?","
- L153: "throw new Error("Imagem invalida.");" -> "throw new Error("Imagem inválida.");"
- L203: "throw new Error("URL nao retornada");" -> "throw new Error("URL não retornada");"
- L241: "Este plano esta vencido. A logo continua no site publico. Confirme o recebimento quando" -> "Este plano está vencido. A logo continua no site público. Confirme o recebimento quando"
- L258: "setFirstPaymentError("Informe se o primeiro recebimento ja ocorreu.");" -> "setFirstPaymentError("Informe se o primeiro recebimento já ocorreu.");"
- L300: "Subtitulo/Categoria" -> "Subtítulo/Categoria"
- L335: "Define a frequencia do ciclo e dos alertas. O lancamento no caixa so ocorre apos a" -> "Define a frequência do ciclo e dos alertas. O lançamento no caixa só ocorre após a"
- L336: "confirmacao do recebimento." -> "confirmação do recebimento."
- L388: "Ja recebi" -> "Já recebi"
- L414: "Ainda nao" -> "Ainda não"
- L454: "O sistema so vai lancar na Prestacao de Contas quando esta data chegar." -> "O sistema só vai lançar na Prestação de Contas quando esta data chegar."
- L507: "Descricao/Observacoes" -> "Descrição/Observações"

### src/app/(admin)/admin/financeiro/patrocinadores/components/TabelaPatrocinadores.tsx

- L96: "title={sponsor.visivel ? "Ocultar do site publico" : "Exibir no site publico"}" -> "title={sponsor.visivel ? "Ocultar do site público" : "Exibir no site público"}"
- L126: "? `Renovacao pendente desde ${dueLabel}`" -> "? `Renovação pendente desde ${dueLabel}`"
- L127: ": `Proxima renovacao em ${dueLabel} (faltam ${diasParaVencer} dia(s))`}" -> ": `Próxima renovação em ${dueLabel} (faltam ${diasParaVencer} dia(s))`}"
- L130: "<div className="mt-2 text-sm text-gray-400">Vencimento nao informado.</div>" -> "<div className="mt-2 text-sm text-gray-400">Vencimento não informado.</div>"

### src/app/(admin)/admin/financeiro/planos-limites/page.tsx

- L796: "Historico recente das suas cobrancas e pagamentos." -> "Histórico recente das suas cobranças e pagamentos."

### src/app/(admin)/admin/financeiro/prestacao-de-contas/page.tsx

- L264: "setErroLancamento("Nao foi possivel salvar o lancamento. Tente novamente.");" -> "setErroLancamento("Não foi possível salvar o lançamento. Tente novamente.");"
- L277: "toast.success("Lancamento excluido.");" -> "toast.success("Lançamento excluído.");"
- L283: "error instanceof Error ? error.message : "Nao foi possivel excluir o lancamento.";" -> "error instanceof Error ? error.message : "Não foi possível excluir o lançamento.";"
- L385: "<title>Prestacao de Contas | Admin - Fut7Pro</title>" -> "<title>Prestação de Contas | Admin - Fut7Pro</title>"
- L399: "<span className="text-xs text-yellow-400 animate-pulse">Salvando alteracao...</span>" -> "<span className="text-xs text-yellow-400 animate-pulse">Salvando alteração...</span>"
- L404: "Esta pagina esta <b>oculta no site publico</b>.<br />" -> "Esta página está <b>oculta no site público</b>.<br />"
- L405: "Ative a transparencia financeira para liberar o acesso aos atletas e visitantes." -> "Ative a transparência financeira para liberar o acesso aos atletas e visitantes."
- L407: "Quando ativado, qualquer pessoa podera visualizar a prestacao de contas deste racha." -> "Quando ativado, qualquer pessoa poderá visualizar a prestação de contas deste racha."
- L413: "<h1 className="text-2xl sm:text-3xl font-bold text-yellow-500">Prestacao de Contas</h1>" -> "<h1 className="text-2xl sm:text-3xl font-bold text-yellow-500">Prestação de Contas</h1>"
- L415: "Gestao total das receitas e despesas do racha." -> "Gestão total das receitas e despesas do racha."
- L425: "+ Novo Lancamento" -> "+ Novo Lançamento"
- L432: "<label className="text-xs text-gray-300 font-bold mb-1">Periodo</label>" -> "<label className="text-xs text-gray-300 font-bold mb-1">Período</label>"
- L441: "<option value="mes">Mes</option>" -> "<option value="mes">Mês</option>"
- L448: "<label className="text-xs text-gray-300 font-bold mb-1">Mes</label>" -> "<label className="text-xs text-gray-300 font-bold mb-1">Mês</label>"
- L503: "placeholder="Buscar por descricao ou observacao"" -> "placeholder="Buscar por descrição ou observação""
- L552: "<div className="text-xs text-gray-400 mb-2">Carregando lancamentos reais...</div>" -> "<div className="text-xs text-gray-400 mb-2">Carregando lançamentos reais...</div>"
- L556: "Nao foi possivel carregar os lancamentos do backend agora. Tente novamente em instantes." -> "Não foi possível carregar os lançamentos do backend agora. Tente novamente em instantes."
- L569: "<h3 className="text-lg font-bold text-yellow-500 mb-2">Evolucao Financeira</h3>" -> "<h3 className="text-lg font-bold text-yellow-500 mb-2">Evolução Financeira</h3>"
- L585: "<p className="text-xs text-gray-400">Sem receitas no periodo selecionado.</p>" -> "<p className="text-xs text-gray-400">Sem receitas no período selecionado.</p>"
- L610: "<p className="text-xs text-gray-400">Sem despesas no periodo selecionado.</p>" -> "<p className="text-xs text-gray-400">Sem despesas no período selecionado.</p>"
- L649: "Sincronizando lancamento com o backend..." -> "Sincronizando lançamento com o backend..."

### src/app/(admin)/admin/Header.tsx

- L156: "Ver perfil publico" -> "Ver perfil público"

### src/app/(admin)/admin/jogadores/listar-cadastrar/page.tsx

- L100: "Cadastro manual cria um jogador sem login. Use apenas quando necessario." -> "Cadastro manual cria um jogador sem login. Use apenas quando necessário."
- L215: "Esta acao conecta a conta com login ao jogador NPC selecionado. O atleta passa a usar" -> "Esta ação conecta a conta com login ao jogador NPC selecionado. O atleta passa a usar"
- L216: "este jogador, mantendo todo o historico, rankings e estatisticas do NPC." -> "este jogador, mantendo todo o histórico, rankings e estatísticas do NPC."
- L219: "Os dados da conta escolhida (nome, apelido, foto, posicao, status) passam a substituir" -> "Os dados da conta escolhida (nome, apelido, foto, posição, status) passam a substituir"
- L223: "Se a conta escolhida ja tiver historico, o vinculo sera bloqueado para evitar" -> "Se a conta escolhida já tiver histórico, o vínculo será bloqueado para evitar"
- L313: "Apito inicial: ao ligar o auto-aceite, todo atleta novo entra no racha sem aprovacao" -> "Apito inicial: ao ligar o auto-aceite, todo atleta novo entra no racha sem aprovação"
- L360: "<h2 className="text-lg text-red-400 font-bold">Rejeitar solicitacao</h2>" -> "<h2 className="text-lg text-red-400 font-bold">Rejeitar solicitação</h2>"
- L362: "Voce esta recusando <strong>{solicitacao.name}</strong>. A conta continua global, mas nao" -> "Você está recusando <strong>{solicitacao.name}</strong>. A conta continua global, mas não"
- L445: "<h2 className="text-lg text-yellow-400 font-bold">Vincular solicitacao</h2>" -> "<h2 className="text-lg text-yellow-400 font-bold">Vincular solicitação</h2>"
- L453: "Este fluxo conecta o atleta pendente a um jogador NPC existente, mantendo historico," -> "Este fluxo conecta o atleta pendente a um jogador NPC existente, mantendo histórico,"
- L454: "rankings e estatisticas do NPC." -> "rankings e estatísticas do NPC."
- L459: "Conta do atleta ainda nao localizada. Aguarde a criacao ou aprove a solicitacao." -> "Conta do atleta ainda não localizada. Aguarde a criação ou aprove a solicitação."
- L486: "<div className="text-xs text-yellow-300">Nenhum jogador NPC disponivel.</div>" -> "<div className="text-xs text-yellow-300">Nenhum jogador NPC disponível.</div>"
- L799: "const message = err instanceof Error ? err.message : "Erro ao rejeitar solicitacao.";" -> "const message = err instanceof Error ? err.message : "Erro ao rejeitar solicitação.";"
- L860: "const message = err instanceof Error ? err.message : "Falha ao vincular solicitacao.";" -> "const message = err instanceof Error ? err.message : "Falha ao vincular solicitação.";"
- L876: "const message = err instanceof Error ? err.message : "Erro ao aprovar solicitacao.";" -> "const message = err instanceof Error ? err.message : "Erro ao aprovar solicitação.";"
- L939: "throw new Error("Nao foi possivel cadastrar o jogador.");" -> "throw new Error("Não foi possível cadastrar o jogador.");"
- L944: "const message = err instanceof Error ? err.message : "Nao foi possivel cadastrar o jogador.";" -> "const message = err instanceof Error ? err.message : "Não foi possível cadastrar o jogador.";"
- L973: "throw new Error("Nao foi possivel atualizar o jogador.");" -> "throw new Error("Não foi possível atualizar o jogador.");"
- L979: "const message = err instanceof Error ? err.message : "Nao foi possivel atualizar o jogador.";" -> "const message = err instanceof Error ? err.message : "Não foi possível atualizar o jogador.";"
- L1077: "<h2 className="text-base font-bold text-yellow-400">Solicitacoes de atletas</h2>" -> "<h2 className="text-base font-bold text-yellow-400">Solicitações de atletas</h2>"
- L1079: "Cadastros feitos no site publico aguardam aprovacao para liberar ranking, jogos e" -> "Cadastros feitos no site público aguardam aprovação para liberar ranking, jogos e"
- L1085: "Aceitar solicitacoes automaticamente" -> "Aceitar solicitações automaticamente"
- L1090: "ariaLabel="Aceitar solicitacoes automaticamente"" -> "ariaLabel="Aceitar solicitações automaticamente""
- L1097: "<span className="ml-2 text-gray-300 font-semibold">Desligado:</span> exige aprovacao" -> "<span className="ml-2 text-gray-300 font-semibold">Desligado:</span> exige aprovação"
- L1101: "<div className="mt-2 text-xs text-gray-400">Atualizando configuracao...</div>" -> "<div className="mt-2 text-xs text-gray-400">Atualizando configuração...</div>"
- L1110: "Auto-aceite ligado: novas solicitacoes entram aprovadas automaticamente." -> "Auto-aceite ligado: novas solicitações entram aprovadas automaticamente."
- L1116: "Solicitacoes pendentes ({solicitacoesCount})" -> "Solicitações pendentes ({solicitacoesCount})"
- L1124: "<div className="text-center text-gray-400 py-6">Carregando solicitacoes...</div>" -> "<div className="text-center text-gray-400 py-6">Carregando solicitações...</div>"
- L1127: "Nao foi possivel carregar as solicitacoes." -> "Não foi possível carregar as solicitações."
- L1174: "Solicitacao pendente" -> "Solicitação pendente"
- L1223: "<div className="text-center text-gray-400 py-6">Sem solicitacoes pendentes.</div>" -> "<div className="text-center text-gray-400 py-6">Sem solicitações pendentes.</div>"
- L1245: "aria-label="Filtrar por posicao"" -> "aria-label="Filtrar por posição""

### src/app/(admin)/admin/jogadores/nivel-dos-atletas/page.tsx

- L93: "throw new Error(body || "Erro ao carregar historico");" -> "throw new Error(body || "Erro ao carregar histórico");"
- L109: "<h2 className="text-lg font-bold text-yellow-400">Historico de alteracoes</h2>" -> "<h2 className="text-lg font-bold text-yellow-400">Histórico de alterações</h2>"
- L120: "{loading && <div className="text-sm text-gray-300">Carregando historico...</div>}" -> "{loading && <div className="text-sm text-gray-300">Carregando histórico...</div>}"
- L452: "toast.error(`${skipped} atletas nao foram atualizados.`);" -> "toast.error(`${skipped} atletas não foram atualizados.`);"
- L768: "Historico" -> "Histórico"

### src/app/(admin)/admin/partidas/criar/classica/page.tsx

- L93: "Carregando sessao de partidas classicas..." -> "Carregando sessão de partidas clássicas..."
- L328: "issues.push("Ha atletas repetidos em mais de um time.");" -> "issues.push("Há atletas repetidos em mais de um time.");"
- L339: "issues.push(`Goleiro obrigatorio: selecione um goleiro em ${teamName}.`);" -> "issues.push(`Goleiro obrigatório: selecione um goleiro em ${teamName}.`);"
- L651: "if (!liveDate) return "Informe a data base da sessao.";" -> "if (!liveDate) return "Informe a data base da sessão.";"
- L667: "return "Ha atletas repetidos em mais de um time. Ajuste a distribuicao.";" -> "return "Há atletas repetidos em mais de um time. Ajuste a distribuição.";"
- L678: "return `Goleiro obrigatorio: selecione um goleiro em ${teamName}.`;" -> "return `Goleiro obrigatório: selecione um goleiro em ${teamName}.`;"
- L686: "setLiveNotice("Rascunho salvo. Voce pode retomar esta sessao quando quiser.");" -> "setLiveNotice("Rascunho salvo. Você pode retomar esta sessão quando quiser.");"
- L754: "throw new Error("Data ou horario invalido.");" -> "throw new Error("Data ou horário inválido.");"
- L772: "throw new Error(body || "Falha ao criar partida classica");" -> "throw new Error(body || "Falha ao criar partida clássica");"
- L777: "throw new Error("Resposta invalida ao criar partida classica");" -> "throw new Error("Resposta inválida ao criar partida clássica");"
- L824: "setLiveMatchError("Inicie a sessao antes de cadastrar partidas.");" -> "setLiveMatchError("Inicie a sessão antes de cadastrar partidas.");"
- L832: "setLiveMatchError("Os times nao podem ser iguais.");" -> "setLiveMatchError("Os times não podem ser iguais.");"
- L873: "setFinalizeError("Nenhuma partida cadastrada na sessao.");" -> "setFinalizeError("Nenhuma partida cadastrada na sessão.");"
- L970: "Sessao de Partidas Classicas" -> "Sessão de Partidas Clássicas"
- L973: "Configure a sessao atual e registre confrontos em tempo real." -> "Configure a sessão atual e registre confrontos em tempo real."
- L981: "<h2 className="text-lg font-semibold text-yellow-300">Cabecalho da sessao</h2>" -> "<h2 className="text-lg font-semibold text-yellow-300">Cabeçalho da sessão</h2>"
- L983: "Campos editaveis enquanto a sessao nao for finalizada." -> "Campos editáveis enquanto a sessão não for finalizada."
- L988: "<FaCheckCircle /> Sessao ativa" -> "<FaCheckCircle /> Sessão ativa"
- L1066: "Nenhum time cadastrado. Cadastre os times antes de criar partidas classicas." -> "Nenhum time cadastrado. Cadastre os times antes de criar partidas clássicas."
- L1070: "Nenhum atleta cadastrado. Cadastre atletas antes de montar partidas classicas." -> "Nenhum atleta cadastrado. Cadastre atletas antes de montar partidas clássicas."
- L1145: "label: "Goleiro obrigatorio"," -> "label: "Goleiro obrigatório","
- L1212: "{liveActive ? "Sessao em andamento" : "Iniciar sessao"}" -> "{liveActive ? "Sessão em andamento" : "Iniciar sessão"}"
- L1222: "Pontuacao em tempo real baseada nos resultados desta sessao (3 pontos vitoria, 1" -> "Pontuação em tempo real baseada nos resultados desta sessão (3 pontos vitória, 1"
- L1273: "<label className="text-xs text-neutral-400">Horario da rodada</label>" -> "<label className="text-xs text-neutral-400">Horário da rodada</label>"
- L1361: "<h3 className="text-sm font-semibold text-yellow-300">Cadastrar proxima rodada</h3>" -> "<h3 className="text-sm font-semibold text-yellow-300">Cadastrar próxima rodada</h3>"
- L1363: "Selecione manualmente o proximo confronto ou use a sugestao abaixo." -> "Selecione manualmente o próximo confronto ou use a sugestão abaixo."
- L1389: "<p>Empate na ultima partida. Selecione o proximo confronto manualmente.</p>" -> "<p>Empate na última partida. Selecione o próximo confronto manualmente.</p>"
- L1426: "<label className="text-xs text-neutral-400">Horario</label>" -> "<label className="text-xs text-neutral-400">Horário</label>"
- L1437: "Horario automatico" -> "Horário automático"
- L1449: "Agora (Brasilia): {nextTimePreview}. Horario definido automaticamente no momento" -> "Agora (Brasília): {nextTimePreview}. Horário definido automaticamente no momento"
- L1467: "Cadastrar proxima rodada" -> "Cadastrar próxima rodada"
- L1479: "Os cards abaixo sao identicos ao painel de Resultados do Dia." -> "Os cards abaixo são idênticos ao painel de Resultados do Dia."
- L1520: "<h2 className="text-lg font-semibold text-yellow-300">Finalizacao oficial</h2>" -> "<h2 className="text-lg font-semibold text-yellow-300">Finalização oficial</h2>"
- L1550: "content="Orquestre partidas classicas em tempo real com cadastro de confrontos e resultados do dia."" -> "content="Orquestre partidas clássicas em tempo real com cadastro de confrontos e resultados do dia.""
- L1554: "content="partida classica, sessao de jogos, resultados, painel admin, fut7pro"" -> "content="partida clássica, sessão de jogos, resultados, painel admin, fut7pro""
- L1567: "<h3 className="text-lg font-semibold text-yellow-300">Finalizar sessao</h3>" -> "<h3 className="text-lg font-semibold text-yellow-300">Finalizar sessão</h3>"
- L1570: "Isso vai consolidar os resultados do dia e liberar os destaques para o Time Campeao." -> "Isso vai consolidar os resultados do dia e liberar os destaques para o Time Campeão."
- L1573: "Todas as partidas ja estao finalizadas. Deseja continuar?" -> "Todas as partidas já estão finalizadas. Deseja continuar?"

### src/app/(admin)/admin/partidas/historico/page.tsx

- L11: "<title>Historico de Partidas | Painel Admin - Fut7Pro</title>" -> "<title>Histórico de Partidas | Painel Admin - Fut7Pro</title>"
- L14: "content="Lance resultados, gols e assistencias das partidas do seu racha. Painel Fut7Pro completo para administracao profissional."" -> "content="Lance resultados, gols e assistências das partidas do seu racha. Painel Fut7Pro completo para administração profissional.""
- L25: "Historico de Partidas" -> "Histórico de Partidas"

### src/app/(admin)/admin/partidas/page.tsx

- L71: "content="Centralize o seu racha em um so lugar: registre resultados do Sorteio Inteligente e consulte o historico completo de partidas."" -> "content="Centralize o seu racha em um só lugar: registre resultados do Sorteio Inteligente e consulte o histórico completo de partidas.""
- L85: "Centralize o seu racha em um so lugar: registre os resultados dos confrontos gerados no" -> "Centralize o seu racha em um só lugar: registre os resultados dos confrontos gerados no"
- L86: "Sorteio Inteligente e consulte o historico completo de partidas, com filtros por periodo" -> "Sorteio Inteligente e consulte o histórico completo de partidas, com filtros por período"
- L87: "e busca rapida." -> "e busca rápida."
- L90: "As partidas do Sorteio Inteligente ja ficam disponiveis no site publico, aqui voce" -> "As partidas do Sorteio Inteligente já ficam disponíveis no site público, aqui você"
- L115: "Lancamento rapido por confronto (placar e destaques)" -> "Lançamento rápido por confronto (placar e destaques)"
- L119: "Validacao para evitar erros (ex: placar incompleto)" -> "Validação para evitar erros (ex: placar incompleto)"
- L123: "Finalizacao oficial para liberar Time Campeao do Dia" -> "Finalização oficial para liberar Time Campeão do Dia"
- L132: "Lancar Resultados de Hoje" -> "Lançar Resultados de Hoje"
- L140: "Ver confrontos publicados no site publico" -> "Ver confrontos publicados no site público"
- L150: "lancamento." -> "lançamento."
- L159: "<h2 className="text-lg font-semibold text-yellow-300">Historico de Partidas</h2>" -> "<h2 className="text-lg font-semibold text-yellow-300">Histórico de Partidas</h2>"
- L162: "evolucao do racha ao longo do tempo." -> "evolução do racha ao longo do tempo."
- L170: "Filtros por ano, mes e periodo" -> "Filtros por ano, mês e período"
- L178: "Edicao e correcao de resultados (com registro de alteracao)" -> "Edição e correção de resultados (com registro de alteração)"
- L187: "Abrir Historico Completo" -> "Abrir Histórico Completo"
- L189: "<span className="text-xs text-gray-500">Exportar relatorio (em breve)</span>" -> "<span className="text-xs text-gray-500">Exportar relatório (em breve)</span>"

### src/app/(admin)/admin/partidas/resultados-do-dia/page.tsx

- L14: "content="Registre placares do dia, gols e assistencias em tempo real. Resultados atualizam rankings e historico do seu racha no Fut7Pro."" -> "content="Registre placares do dia, gols e assistências em tempo real. Resultados atualizam rankings e histórico do seu racha no Fut7Pro.""

### src/app/(admin)/admin/partidas/time-campeao-do-dia/page.tsx

- L175: "throw new Error(body?.error || "Falha ao atualizar ausencia.");" -> "throw new Error(body?.error || "Falha ao atualizar ausência.");"
- L182: "setActionError(err instanceof Error ? err.message : "Falha ao atualizar ausencia.");" -> "setActionError(err instanceof Error ? err.message : "Falha ao atualizar ausência.");"

### src/app/(admin)/admin/perfil/page.tsx

- L27: "if (!value) return "Nao informado";" -> "if (!value) return "Não informado";"
- L62: "Nao foi possivel carregar o perfil. Recarregue a pagina ou faca login novamente." -> "Não foi possível carregar o perfil. Recarregue a página ou faça login novamente."
- L103: "Perfil publico do atleta exibido no site do racha." -> "Perfil público do atleta exibido no site do racha."
- L110: "<span className="text-zinc-400">Posicao: </span>" -> "<span className="text-zinc-400">Posição: </span>"
- L114: "<span className="text-zinc-400">Posicao secundaria: </span>" -> "<span className="text-zinc-400">Posição secundária: </span>"
- L117: ": "Nao informado"}" -> ": "Não informado"}"
- L121: "{me.athlete.status || "Nao informado"}" -> "{me.athlete.status || "Não informado"}"
- L125: "{me.athlete.mensalista ? "Ativo" : "Nao"}" -> "{me.athlete.mensalista ? "Ativo" : "Não"}"
- L144: "Ver perfil publico" -> "Ver perfil público"

### src/app/(admin)/admin/personalizacao/identidade-visual/page.tsx

- L40: "const [logo, setLogo] = useState<LogoData>({ url: LOGO_PADRAO, nome: "Logo padrao Fut7Pro" });" -> "const [logo, setLogo] = useState<LogoData>({ url: LOGO_PADRAO, nome: "Logo padrão Fut7Pro" });"
- L94: "setSlugHint("Link disponivel.");" -> "setSlugHint("Link disponível.");"
- L97: "setSlugHint("Esse link ja esta em uso.");" -> "setSlugHint("Esse link já está em uso.");"
- L102: "setSlugHint("Nao foi possivel validar o link agora.");" -> "setSlugHint("Não foi possível validar o link agora.");"
- L116: "toast.error("Envie uma imagem PNG ou JPG de ate 1MB.");" -> "toast.error("Envie uma imagem PNG ou JPG de até 1MB.");"
- L135: "toast.error("Escolha um nome com link disponivel antes de salvar.");" -> "toast.error("Escolha um nome com link disponível antes de salvar.");"
- L140: "`O link publico do racha sera alterado para:\n${nextLink}\n\nDeseja continuar?`" -> "`O link público do racha será alterado para:\n${nextLink}\n\nDeseja continuar?`"
- L180: "toast("Novo link publico: " + nextLink);" -> "toast("Novo link público: " + nextLink);"
- L181: "toast("Se o painel nao atualizar, saia e entre novamente.");" -> "toast("Se o painel não atualizar, saia e entre novamente.");"
- L232: "Nome do Racha <span className="text-xs text-gray-400">(ate 18 caracteres)</span>" -> "Nome do Racha <span className="text-xs text-gray-400">(até 18 caracteres)</span>"
- L244: "Esse nome sera exibido no cabecalho e outras areas do site." -> "Esse nome será exibido no cabeçalho e outras áreas do site."
- L247: "Se nao quiser alterar o nome do racha, deixe o campo em branco e troque apenas a logo." -> "Se não quiser alterar o nome do racha, deixe o campo em branco e troque apenas a logo."
- L250: "Link publico atual: <span className="text-yellow-300">{currentLink}</span>" -> "Link público atual: <span className="text-yellow-300">{currentLink}</span>"
- L255: "Aviso: ao alterar o nome, o link publico do racha tambem muda." -> "Aviso: ao alterar o nome, o link público do racha também muda."
- L318: "Nome e logo ficam visiveis em todas as telas publicas e do painel." -> "Nome e logo ficam visíveis em todas as telas públicas e do painel."

### src/app/(admin)/admin/personalizacao/visual-temas/VisualTemasClient.tsx

- L110: "toast.error("Nao foi possivel identificar o racha. Refaca o login.");" -> "toast.error("Não foi possível identificar o racha. Refaça o login.");"
- L114: "toast("Tema ja esta aplicado.");" -> "toast("Tema já está aplicado.");"
- L185: "Todas as telas do painel e do site publico refletirao a identidade escolhida." -> "Todas as telas do painel e do site público refletirão a identidade escolhida."

### src/app/(public)/[slug]/atletas/[athleteSlug]/page.tsx

- L38: "if (!value) return "Nao informado";" -> "if (!value) return "Não informado";"
- L228: "content={`Perfil publico do atleta ${displayName} com estatisticas do racha.`}" -> "content={`Perfil público do atleta ${displayName} com estatísticas do racha.`}"
- L260: "Posicao: {formatPosition(athlete.position)}" -> "Posição: {formatPosition(athlete.position)}"
- L264: "Posicao secundaria: {formatPosition(athlete.positionSecondary)}" -> "Posição secundária: {formatPosition(athlete.positionSecondary)}"
- L268: "Status: {athlete.status || "Nao informado"}" -> "Status: {athlete.status || "Não informado"}"
- L271: "Mensalista: {athlete.mensalista ? "Ativo" : "Nao"}" -> "Mensalista: {athlete.mensalista ? "Ativo" : "Não"}"
- L274: "Nivel de Assiduidade: {nivelAssiduidade}" -> "Nível de Assiduidade: {nivelAssiduidade}"
- L281: "<span className="text-gray-400">Estatisticas:</span>" -> "<span className="text-gray-400">Estatísticas:</span>"
- L302: "{ label: "Assistencias", value: atletaRanking?.assistencias ?? 0 }," -> "{ label: "Assistências", value: atletaRanking?.assistencias ?? 0 },"
- L303: "{ label: "Campeao do Dia", value: campeaoDiaLabel }," -> "{ label: "Campeão do Dia", value: campeaoDiaLabel },"
- L304: "{ label: "Media Vitorias", value: mediaVitorias }," -> "{ label: "Média Vitórias", value: mediaVitorias },"
- L305: "{ label: "Pontuacao", value: atletaRanking?.pontos ?? 0 }," -> "{ label: "Pontuação", value: atletaRanking?.pontos ?? 0 },"
- L311: "item.label === "Pontuacao" ? "text-brand-soft" : """ -> "item.label === "Pontuação" ? "text-brand-soft" : """
- L331: "<div className="mt-6 text-sm text-red-300">Falha ao carregar estatisticas do atleta.</div>" -> "<div className="mt-6 text-sm text-red-300">Falha ao carregar estatísticas do atleta.</div>"

### src/app/(public)/[slug]/atletas/page.tsx

- L39: "<title>Perfis dos Atletas | Estatisticas e Conquistas | Fut7Pro</title>" -> "<title>Perfis dos Atletas | Estatísticas e Conquistas | Fut7Pro</title>"
- L42: "content="Conheca o perfil completo de todos os atletas do seu racha: estatisticas, conquistas, posicao em campo e evolucao ao longo das temporadas."" -> "content="Conheça o perfil completo de todos os atletas do seu racha: estatísticas, conquistas, posição em campo e evolução ao longo das temporadas.""
- L55: "<strong>perfil completo de cada jogador</strong> com estatisticas, conquistas, posicao em" -> "<strong>perfil completo de cada jogador</strong> com estatísticas, conquistas, posição em"
- L56: "campo, historico de partidas e evolucao por temporada." -> "campo, histórico de partidas e evolução por temporada."

### src/app/(public)/aguardando-aprovacao/AguardandoAprovacaoClient.tsx

- L16: "Aguardando aprovacao" -> "Aguardando aprovação"
- L23: "<h1 className="text-xl font-bold text-white">Solicitacao enviada</h1>" -> "<h1 className="text-xl font-bold text-white">Solicitação enviada</h1>"
- L25: "Seu cadastro esta em analise. O administrador precisa aprovar o acesso completo ao racha." -> "Seu cadastro está em análise. O administrador precisa aprovar o acesso completo ao racha."
- L28: "Quando a aprovacao for concluida, voce podera acessar o perfil completo e os rankings." -> "Quando a aprovação for concluída, você poderá acessar o perfil completo e os rankings."
- L42: "Ir para o site publico" -> "Ir para o site público"

### src/app/(public)/atletas/[slug]/historico/page.tsx

- L33: "<title>Historico | {athlete.firstName || "Atleta"} | Fut7Pro</title>" -> "<title>Histórico | {athlete.firstName || "Atleta"} | Fut7Pro</title>"
- L41: "<h1 className="text-2xl font-bold text-brand mb-2">Historico do atleta</h1>" -> "<h1 className="text-2xl font-bold text-brand mb-2">Histórico do atleta</h1>"
- L43: "Historico detalhado sera exibido quando as partidas e presencas estiverem publicadas" -> "Histórico detalhado será exibido quando as partidas e presenças estiverem publicadas"

### src/app/(public)/atletas/[slug]/page.tsx

- L38: "if (!value) return "Nao informado";" -> "if (!value) return "Não informado";"

### src/app/(public)/comunicacao/comunicados/page.tsx

- L32: ""Administracao"" -> ""Administração""

### src/app/(public)/grandes-torneios/page.tsx

- L156: "Nao foi possivel carregar os torneios agora." -> "Não foi possível carregar os torneios agora."
- L192: "`Edicao ${torneio.ano || "especial"} com os melhores jogadores do racha.`}" -> "`Edição ${torneio.ano || "especial"} com os melhores jogadores do racha.`}"
- L207: "alt={`Escudo do time campeao ${torneio.campeao || "A definir"}`}" -> "alt={`Escudo do time campeão ${torneio.campeao || "A definir"}`}"
- L215: "Time campeao" -> "Time campeão"

### src/app/(public)/os-campeoes/page.tsx

- L150: "const errorMessage = rankingAno.error || rankingTimesAno.error || "Erro ao carregar campeoes.";" -> "const errorMessage = rankingAno.error || rankingTimesAno.error || "Erro ao carregar campeões.";"
- L181: "titulo: "Campeao do Ano"," -> "titulo: "Campeão do Ano","
- L193: "valor: topAssist ? `${topAssist.assistencias} assistencias` : "Em processamento"," -> "valor: topAssist ? `${topAssist.assistencias} assistências` : "Em processamento","
- L240: "<span className="ml-4 text-lg text-textoSuave">Carregando campeoes...</span>" -> "<span className="ml-4 text-lg text-textoSuave">Carregando campeões...</span>"
- L250: "<h1 className="text-2xl font-bold text-red-400 mb-2">Erro ao carregar campeoes</h1>" -> "<h1 className="text-2xl font-bold text-red-400 mb-2">Erro ao carregar campeões</h1>"
- L260: "<title>Os Campeoes | Hall da Fama do Racha | Fut7Pro</title>" -> "<title>Os Campeões | Hall da Fama do Racha | Fut7Pro</title>"
- L273: "Os Campeoes do Racha - Melhores do Ano, Rankings e Campeoes por Quadrimestre" -> "Os Campeões do Racha - Melhores do Ano, Rankings e Campeões por Quadrimestre"
- L277: "<h2 className="text-3xl font-bold text-brand mb-2">Os Campeoes</h2>" -> "<h2 className="text-3xl font-bold text-brand mb-2">Os Campeões</h2>"
- L279: "Hall da Fama do racha, com os campeoes do ano e de cada quadrimestre, baseados em" -> "Hall da Fama do racha, com os campeões do ano e de cada quadrimestre, baseados em"
- L280: "desempenho real nos jogos, rankings e estatisticas oficiais." -> "desempenho real nos jogos, rankings e estatísticas oficiais."
- L312: "<h3 className="text-2xl font-bold text-brand text-center mb-6">Campeoes do Ano</h3>" -> "<h3 className="text-2xl font-bold text-brand text-center mb-6">Campeões do Ano</h3>"
- L322: "Melhores por Posicao no Ano" -> "Melhores por Posição no Ano"
- L333: "Campeoes por Quadrimestre" -> "Campeões por Quadrimestre"
- L377: "Como funciona a pagina Os Campeoes" -> "Como funciona a página Os Campeões"
- L382: "A pagina Os Campeoes funciona como o Hall da Fama oficial do racha, destacando" -> "A página Os Campeões funciona como o Hall da Fama oficial do racha, destacando"
- L384: "dados reais registrados no sistema. Todos os campeoes sao definidos" -> "dados reais registrados no sistema. Todos os campeões são definidos"
- L385: "automaticamente a partir dos rankings, estatisticas e resultados oficiais das" -> "automaticamente a partir dos rankings, estatísticas e resultados oficiais das"
- L386: "partidas, sem interferencia manual." -> "partidas, sem interferência manual."
- L392: "Voce pode selecionar o ano desejado para visualizar os campeoes daquele" -> "Você pode selecionar o ano desejado para visualizar os campeões daquele"
- L393: "periodo. Os anos disponiveis comecam a partir do ano de criacao do racha e" -> "período. Os anos disponíveis começam a partir do ano de criação do racha e"
- L394: "seguem de forma cronologica." -> "seguem de forma cronológica."
- L399: "<h4 className="text-brand-soft font-semibold mb-2">Campeoes do Ano</h4>" -> "<h4 className="text-brand-soft font-semibold mb-2">Campeões do Ano</h4>"
- L401: "Nesta secao sao exibidos os principais destaques da temporada:" -> "Nesta seção são exibidos os principais destaques da temporada:"
- L404: "<li>Melhor do Ano: atleta com maior pontuacao total no ano.</li>" -> "<li>Melhor do Ano: atleta com maior pontuação total no ano.</li>"
- L405: "<li>Artilheiro do Ano: atleta com maior numero de gols no ano.</li>" -> "<li>Artilheiro do Ano: atleta com maior número de gols no ano.</li>"
- L406: "<li>Maestro do Ano: atleta com maior numero de assistencias no ano.</li>" -> "<li>Maestro do Ano: atleta com maior número de assistências no ano.</li>"
- L407: "<li>Campeao do Ano: time com maior pontuacao acumulada no ano.</li>" -> "<li>Campeão do Ano: time com maior pontuação acumulada no ano.</li>"
- L410: "Ao clicar em qualquer card, voce e direcionado ao ranking correspondente" -> "Ao clicar em qualquer card, você é direcionado ao ranking correspondente"
- L411: "daquele ano. Quando o ano ainda nao foi finalizado, os cards exibem o selo" -> "daquele ano. Quando o ano ainda não foi finalizado, os cards exibem o selo"
- L412: ""Temporariamente", indicando que os resultados podem mudar ate o encerramento" -> ""Temporariamente", indicando que os resultados podem mudar até o encerramento"
- L419: "Melhores por Posicao no Ano" -> "Melhores por Posição no Ano"
- L422: "Abaixo dos campeoes principais estao os vencedores por posicao, considerando" -> "Abaixo dos campeões principais estão os vencedores por posição, considerando"
- L423: "apenas atletas da mesma funcao:" -> "apenas atletas da mesma função:"
- L432: "O criterio e sempre o mesmo: maior pontuacao dentro da posicao no ano" -> "O critério é sempre o mesmo: maior pontuação dentro da posição no ano"
- L433: "selecionado. Cada card leva ao ranking especifico daquela posicao." -> "selecionado. Cada card leva ao ranking específico daquela posição."
- L439: "Campeoes por Quadrimestre" -> "Campeões por Quadrimestre"
- L441: "<p className="mb-2">O ano e dividido em tres quadrimestres:</p>" -> "<p className="mb-2">O ano é dividido em três quadrimestres:</p>"
- L448: "Cada quadrimestre possui seus proprios campeoes, definidos apenas pelo" -> "Cada quadrimestre possui seus próprios campeões, definidos apenas pelo"
- L449: "desempenho dentro daquele periodo. Ao final de cada quadrimestre:" -> "desempenho dentro daquele período. Ao final de cada quadrimestre:"
- L452: "<li>Os rankings do periodo sao finalizados.</li>" -> "<li>Os rankings do período são finalizados.</li>"
- L453: "<li>Os campeoes recebem o selo de Campeao do Quadrimestre.</li>" -> "<li>Os campeões recebem o selo de Campeão do Quadrimestre.</li>"
- L455: "Os rankings do proximo quadrimestre reiniciam do zero, garantindo disputa" -> "Os rankings do próximo quadrimestre reiniciam do zero, garantindo disputa"
- L460: "Antes do inicio de um quadrimestre, os rankings aparecem com a mensagem:" -> "Antes do início de um quadrimestre, os rankings aparecem com a mensagem:"
- L461: ""Ranking liberado no inicio do quadrimestre."" -> ""Ranking liberado no início do quadrimestre.""
- L467: "Conquistas e Icones no Perfil" -> "Conquistas e Ícones no Perfil"
- L470: "Sempre que um atleta ou time conquista um titulo (anual ou quadrimestral), ele" -> "Sempre que um atleta ou time conquista um título (anual ou quadrimestral), ele"
- L471: "recebe um icone de premiacao virtual. Esses icones:" -> "recebe um ícone de premiação virtual. Esses ícones:"
- L474: "<li>Ficam visiveis no perfil do atleta.</li>" -> "<li>Ficam visíveis no perfil do atleta.</li>"
- L475: "<li>Sao permanentes.</li>" -> "<li>São permanentes.</li>"
- L477: "Sao organizados por importancia, dando mais destaque aos titulos mais raros" -> "São organizados por importância, dando mais destaque aos títulos mais raros"
- L478: "e dificeis de conquistar." -> "e difíceis de conquistar."
- L484: "<h4 className="text-brand-soft font-semibold mb-2">Observacao Importante</h4>" -> "<h4 className="text-brand-soft font-semibold mb-2">Observação Importante</h4>"
- L487: "data de criacao passam a ser considerados. Quadrimestres ja encerrados antes" -> "data de criação passam a ser considerados. Quadrimestres já encerrados antes"
- L488: "da criacao do racha nao terao campeoes." -> "da criação do racha não terão campeões."
- L540: "<Image src={icon} alt={`Icone ${titulo}`} width={28} height={28} />" -> "<Image src={icon} alt={`Ícone ${titulo}`} width={28} height={28} />"
- L647: "titulo: "Campeao do Quadrimestre"," -> "titulo: "Campeão do Quadrimestre","

### src/app/(public)/page.tsx

- L75: "criteria: "Mais gols no time campeao"," -> "criteria: "Mais gols no time campeão","
- L76: "badge: "Automatico"," -> "badge: "Automático","
- L82: "criteria: "Mais assistencias no time campeao"," -> "criteria: "Mais assistências no time campeão","
- L83: "badge: "Automatico"," -> "badge: "Automático","
- L86: "statLabel: "assistencias"," -> "statLabel: "assistências","
- L89: "criteria: "Escolha do admin (time campeao)"," -> "criteria: "Escolha do admin (time campeão)","
- L95: "criteria: "Goleiro do time campeao"," -> "criteria: "Goleiro do time campeão","
- L96: "badge: "Automatico"," -> "badge: "Automático","
- L98: "footerText: "Automatico"," -> "footerText: "Automático","
- L103: "atacante: "Mais gols no time campeao"," -> "atacante: "Mais gols no time campeão","
- L104: "meia: "Mais assistencias no time campeao"," -> "meia: "Mais assistências no time campeão","
- L105: "zagueiro: "Escolha do admin (time campeao)"," -> "zagueiro: "Escolha do admin (time campeão)","
- L106: "goleiro: "Goleiro do time campeao"," -> "goleiro: "Goleiro do time campeão","
- L108: "maestro: "Mais assistencias no dia (qualquer time)"," -> "maestro: "Mais assistências no dia (qualquer time)","
- L443: "? `${highlights.meia.assists} assistencias`" -> "? `${highlights.meia.assists} assistências`"
- L502: "? `${highlights.maestro.assists} assistencias`" -> "? `${highlights.maestro.assists} assistências`"
- L547: "Nao foi possivel carregar os destaques do dia." -> "Não foi possível carregar os destaques do dia."
- L582: "<Card title="Campeoes" description="Veja quem se destacou nos rachas." />" -> "<Card title="Campeões" description="Veja quem se destacou nos rachas." />"
- L591: "<Card title="Estatisticas" description="Acompanhe sua performance em tempo real." />" -> "<Card title="Estatísticas" description="Acompanhe sua performance em tempo real." />"
- L598: "description="Equipes equilibradas com base no historico."" -> "description="Equipes equilibradas com base no histórico.""
- L607: "description="Equipes equilibradas com base no historico."" -> "description="Equipes equilibradas com base no histórico.""

### src/app/(public)/partidas/detalhes/[id]/page.tsx

- L132: "<h1 className="text-2xl text-brand font-bold mb-4">Partida nao encontrada</h1>" -> "<h1 className="text-2xl text-brand font-bold mb-4">Partida não encontrada</h1>"
- L133: "<p className="text-textoSuave">Verifique o ID da partida ou volte ao historico.</p>" -> "<p className="text-textoSuave">Verifique o ID da partida ou volte ao histórico.</p>"
- L138: "Voltar ao historico" -> "Voltar ao histórico"
- L146: ": "Data nao informada";" -> ": "Data não informada";"
- L170: "<p className="text-lg font-semibold">{match.location || "Nao informado"}</p>" -> "<p className="text-lg font-semibold">{match.location || "Não informado"}</p>"
- L241: "<h2 className="text-lg font-bold text-brand mb-2">Maestro (assistencias)</h2>" -> "<h2 className="text-lg font-bold text-brand mb-2">Maestro (assistências)</h2>"
- L254: "{highlights.maestro.assistencias} assistencias" -> "{highlights.maestro.assistencias} assistências"
- L259: "<p className="text-sm text-neutral-400">Sem dados de assistencias.</p>" -> "<p className="text-sm text-neutral-400">Sem dados de assistências.</p>"
- L283: "<p className="text-neutral-400 text-sm">Jogadores nao informados.</p>" -> "<p className="text-neutral-400 text-sm">Jogadores não informados.</p>"
- L305: "<p className="text-neutral-400 text-sm">Jogadores nao informados.</p>" -> "<p className="text-neutral-400 text-sm">Jogadores não informados.</p>"
- L315: "Voltar ao historico" -> "Voltar ao histórico"
- L321: "Ver Time Campeao do Dia" -> "Ver Time Campeão do Dia"

### src/app/(public)/partidas/historico/page.tsx

- L10: "<title>Historico de Partidas | Fut7Pro</title>" -> "<title>Histórico de Partidas | Fut7Pro</title>"
- L13: "content="Veja o historico de partidas do seu racha, com datas, locais, placares e detalhes completos."" -> "content="Veja o histórico de partidas do seu racha, com datas, locais, placares e detalhes completos.""
- L23: "<h1 className="text-2xl md:text-3xl font-bold text-brand mb-2">Historico de Partidas</h1>" -> "<h1 className="text-2xl md:text-3xl font-bold text-brand mb-2">Histórico de Partidas</h1>"

### src/app/(public)/sobre-nos/aniversariantes/page.tsx

- L12: ""Marco"," -> ""Março","
- L62: "const seoTitle = "Aniversariantes do mes | Fut7Pro";" -> "const seoTitle = "Aniversariantes do mês | Fut7Pro";"
- L64: ""Veja quem sao os aniversariantes do mes no Fut7Pro. Parabens automatico pelo sistema no dia do aniversario!";" -> ""Veja quem são os aniversariantes do mês no Fut7Pro. Parabéns automático pelo sistema no dia do aniversário!";"
- L79: "Aniversariantes do Mes" -> "Aniversariantes do Mês"
- L123: "<span>Nenhum aniversariante neste mes ainda!</span>" -> "<span>Nenhum aniversariante neste mês ainda!</span>"
- L167: "Parabens, {aniv.nickname || aniv.name}!" -> "Parabéns, {aniv.nickname || aniv.name}!"
- L175: "As mensagens de parabens sao enviadas automaticamente para o aniversariante as 8h do" -> "As mensagens de parabéns são enviadas automaticamente para o aniversariante às 8h do"
- L176: "dia, sem exposicao de dados pessoais." -> "dia, sem exposição de dados pessoais."

### src/app/(public)/sobre-nos/estatuto/page.tsx

- L43: "alert("O PDF do estatuto ainda nao esta disponivel para este racha.");" -> "alert("O PDF do estatuto ainda não está disponível para este racha.");"
- L49: "<title>Estatuto | Sobre Nos | Fut7Pro</title>" -> "<title>Estatuto | Sobre Nós | Fut7Pro</title>"
- L52: "content="Conheca o estatuto oficial do racha: regras de pontuacao, multas, penalidades, prioridades e boas praticas definidas pelo admin."" -> "content="Conheça o estatuto oficial do racha: regras de pontuação, multas, penalidades, prioridades e boas práticas definidas pelo admin.""
- L66: "O Estatuto reune todas as regras, criterios e boas praticas que regem o funcionamento do" -> "O Estatuto reúne todas as regras, critérios e boas práticas que regem o funcionamento do"
- L67: "racha. O conteudo abaixo e carregado do painel do administrador e atualizado por tenant." -> "racha. O conteúdo abaixo é carregado do painel do administrador e atualizado por tenant."
- L80: "Nao foi possivel carregar o estatuto. Tente novamente em instantes." -> "Não foi possível carregar o estatuto. Tente novamente em instantes."
- L130: "Ultima atualizacao: {atualizadoEm || "—"}" -> "Última atualização: {atualizadoEm || "—"}"

### src/app/(public)/sobre-nos/nossa-historia/page.tsx

- L624: "tipo: "Historico"," -> "tipo: "Histórico","
- L728: "const shareData = { title: "Nossa Historia - Fut7Pro", url };" -> "const shareData = { title: "Nossa História - Fut7Pro", url };"
- L779: "<title>Nossa Historia | Sobre Nos | Fut7Pro</title>" -> "<title>Nossa História | Sobre Nós | Fut7Pro</title>"
- L782: "content="Linha do tempo, fotos, videos, curiosidades e depoimentos sobre a historia do racha. Conteudo dinamicado por tenant."" -> "content="Linha do tempo, fotos, vídeos, curiosidades e depoimentos sobre a história do racha. Conteúdo dinamicado por tenant.""
- L796: "<FaShareAlt /> Compartilhar Historia" -> "<FaShareAlt /> Compartilhar História"
- L858: "<h2 className="text-2xl font-bold text-brand-soft mb-4">Videos Historicos</h2>" -> "<h2 className="text-2xl font-bold text-brand-soft mb-4">Vídeos Históricos</h2>"
- L865: "const titulo = video.titulo || `Video ${idx + 1}`;" -> "const titulo = video.titulo || `Vídeo ${idx + 1}`;"
- L889: "alt={`Video do racha ${rachaNome}: ${titulo}`}" -> "alt={`Vídeo do racha ${rachaNome}: ${titulo}`}"
- L1049: "<FaMedal className="text-brand" /> Campeoes Historicos (Top 5 Pontuadores de todos os" -> "<FaMedal className="text-brand" /> Campeões Históricos (Top 5 Pontuadores de todos os"

### src/app/(public)/sobre-nos/nossos-parceiros/page.tsx

- L76: "const seoDescription = `Conheca os patrocinadores e apoiadores do ${brandName}.`;" -> "const seoDescription = `Conheça os patrocinadores e apoiadores do ${brandName}.`;"
- L101: "Valorize quem acredita na nossa equipe. Siga, prestigie e de preferencia aos nossos" -> "Valorize quem acredita na nossa equipe. Siga, prestigie e dê preferência aos nossos"
- L102: "parceiros, empresas e profissionais que apoiam o racha com descontos, patrocinios," -> "parceiros, empresas e profissionais que apoiam o racha com descontos, patrocínios,"
- L103: "produtos e servicos de qualidade." -> "produtos e serviços de qualidade."
- L110: "Nao foi possivel carregar os patrocinadores no momento." -> "Não foi possível carregar os patrocinadores no momento."
- L175: "Fale com a administracao e saiba como ser um parceiro." -> "Fale com a administração e saiba como ser um parceiro."

### src/app/(public)/sobre-nos/page.tsx

- L27: "title: "Nossa Historia"," -> "title: "Nossa História","
- L28: "desc: "Conheca nossa origem, missao e os principais marcos."," -> "desc: "Conheça nossa origem, missão e os principais marcos.","
- L40: "desc: "Veja quem faz aniversario no mes e acesse o perfil dos atletas."," -> "desc: "Veja quem faz aniversário no mês e acesse o perfil dos atletas.","
- L46: "desc: "Conheca nossos patrocinadores e apoiadores."," -> "desc: "Conheça nossos patrocinadores e apoiadores.","
- L60: "title: "Prestacao de Contas"," -> "title: "Prestação de Contas","
- L61: "desc: "Transparencia financeira: entradas e despesas do racha."," -> "desc: "Transparência financeira: entradas e despesas do racha.","
- L68: "<title>Sobre Nos | {racha?.nome || rachaConfig.nome}</title>" -> "<title>Sobre Nós | {racha?.nome || rachaConfig.nome}</title>"
- L71: "content="Saiba tudo sobre nosso futebol entre amigos: historia, missao, regras, aniversariantes, parceiros, administracao, prestacao de contas e muito mais."" -> "content="Saiba tudo sobre nosso futebol entre amigos: história, missão, regras, aniversariantes, parceiros, administração, prestação de contas e muito mais.""
- L80: "Sobre Nos" -> "Sobre Nós"
- L83: "Conheca mais sobre nosso futebol entre amigos: nossa historia, regras, aniversariantes," -> "Conheça mais sobre nosso futebol entre amigos: nossa história, regras, aniversariantes,"
- L84: "parceiros e todas as informacoes importantes do racha." -> "parceiros e todas as informações importantes do racha."

### src/app/(public)/sorteio-inteligente/page.tsx

- L48: "<title>Sorteio Inteligente | Painel de Administracao | Fut7Pro</title>" -> "<title>Sorteio Inteligente | Painel de Administração | Fut7Pro</title>"
- L51: "content="Monte times equilibrados no seu racha de futebol 7 com sorteio inteligente, ranking, posicao e estrelas."" -> "content="Monte times equilibrados no seu racha de futebol 7 com sorteio inteligente, ranking, posição e estrelas.""

### src/app/(superadmin)/superadmin/financeiro/[slug]/page.tsx

- L258: "content={`Detalhes financeiros e historico de pagamentos do racha ${tenant.name} na plataforma ${brandLabel}.`}" -> "content={`Detalhes financeiros e histórico de pagamentos do racha ${tenant.name} na plataforma ${brandLabel}.`}"
- L393: "<h2 className="text-xl font-bold text-white mb-3">Historico de Pagamentos</h2>" -> "<h2 className="text-xl font-bold text-white mb-3">Histórico de Pagamentos</h2>"
- L401: "<th className="px-3 py-2">Referencia</th>" -> "<th className="px-3 py-2">Referência</th>"
- L402: "<th className="px-3 py-2">Metodo</th>" -> "<th className="px-3 py-2">Método</th>"

### src/app/(superadmin)/superadmin/planos/page.tsx

- L22: "const intervalLabel = plan.interval === "year" ? "ano" : "mes";" -> "const intervalLabel = plan.interval === "year" ? "ano" : "mês";"
- L157: "throw new Error(body?.message || "Falha ao salvar catalogo de planos");" -> "throw new Error(body?.message || "Falha ao salvar catálogo de planos");"
- L162: "toast.success("Catalogo de planos atualizado");" -> "toast.success("Catálogo de planos atualizado");"
- L164: "toast.error(err?.message || "Erro ao salvar catalogo de planos");" -> "toast.error(err?.message || "Erro ao salvar catálogo de planos");"
- L173: "<title>{applyBrand("Planos & Precos | **BRAND** SuperAdmin")}</title>" -> "<title>{applyBrand("Planos & Preços | **BRAND** SuperAdmin")}</title>"
- L177: ""Edite planos, precos, limites e beneficios do **BRAND**. Tudo o que for salvo aqui aparece no painel dos rachas."" -> ""Edite planos, preços, limites e benefícios do **BRAND**. Tudo o que for salvo aqui aparece no painel dos rachas.""
- L184: "<h1 className="text-3xl md:text-4xl font-bold text-yellow-400">Planos & Precos</h1>" -> "<h1 className="text-3xl md:text-4xl font-bold text-yellow-400">Planos & Preços</h1>"
- L187: ""Edite textos, precos, limites, destaques e CTAs. As alteracoes sao aplicadas no painel dos rachas apos salvar."" -> ""Edite textos, preços, limites, destaques e CTAs. As alterações são aplicadas no painel dos rachas após salvar.""
- L195: "<span>Carregando catalogo...</span>" -> "<span>Carregando catálogo...</span>"
- L201: "Erro ao carregar catalogo. Tente novamente." -> "Erro ao carregar catálogo. Tente novamente."
- L220: "Subtitulo do banner" -> "Subtítulo do banner"
- L229: "Observacao do anual" -> "Observação do anual"
- L234: "placeholder="Ex: 2 meses gratis ja embutidos no valor anual"" -> "placeholder="Ex: 2 meses grátis já embutidos no valor anual""
- L238: "Dias de teste padrao" -> "Dias de teste padrão"
- L271: "Salvar alteracoes" -> "Salvar alterações"
- L518: "Salvar alteracoes" -> "Salvar alterações"

### src/app/admin/login/AdminLoginClient.tsx

- L11: "title: "Atualizacao em tempo real"," -> "title: "Atualização em tempo real","
- L12: "description: "Tudo que voce edita no painel aparece no site publico do racha."," -> "description: "Tudo que você edita no painel aparece no site público do racha.","
- L15: "title: "Multi-admin com seguranca"," -> "title: "Multi-admin com segurança","
- L16: "description: "Permissoes por perfil e logs de auditoria para cada acao."," -> "description: "Permissões por perfil e logs de auditoria para cada ação.","
- L20: "description: "Controle receitas, despesas e patrocinadores em um unico lugar."," -> "description: "Controle receitas, despesas e patrocinadores em um único lugar.","
- L107: "setErro("E-mail ou senha invalidos.");" -> "setErro("E-mail ou senha inválidos.");"
- L168: "Enviamos um link de confirmacao para {email}. Verifique sua caixa de entrada ou" -> "Enviamos um link de confirmação para {email}. Verifique sua caixa de entrada ou"
- L180: "Ir para confirmacao" -> "Ir para confirmação"
- L261: "Nao tem conta?{" "}" -> "Não tem conta?{" "}"
- L293: "Acesse o centro de comando do seu racha. Tudo que voce atualiza no painel reflete no" -> "Acesse o centro de comando do seu racha. Tudo que você atualiza no painel reflete no"
- L294: "site publico do racha com sincronizacao imediata." -> "site público do racha com sincronização imediata."
- L300: "Ver beneficios do painel" -> "Ver benefícios do painel"
- L350: "Este racha esta temporariamente bloqueado pelo Fut7Pro e, no momento, nao e possivel" -> "Este racha está temporariamente bloqueado pelo Fut7Pro e, no momento, não é possível"
- L361: "Se possivel, informe o nome do racha, o slug e o e-mail do administrador." -> "Se possível, informe o nome do racha, o slug e o e-mail do administrador."

### src/app/cadastrar-racha/confirmar-email/ConfirmarEmailClient.tsx

- L20: "setMessage("Informe o e-mail para reenviar a confirmacao.");" -> "setMessage("Informe o e-mail para reenviar a confirmação.");"
- L36: "setMessage(data?.message || "Nao foi possivel reenviar agora.");" -> "setMessage(data?.message || "Não foi possível reenviar agora.");"
- L53: "Confirmacao de e-mail" -> "Confirmação de e-mail"
- L59: "Enviamos um link de confirmacao para{" "}" -> "Enviamos um link de confirmação para{" "}"
- L98: "Ja confirmei" -> "Já confirmei"
- L104: "Nao encontrou o e-mail? Verifique tambem as pastas Spam, Lixo eletronico ou Promocoes." -> "Não encontrou o e-mail? Verifique também as pastas Spam, Lixo eletrônico ou Promoções."

### src/app/cadastrar-racha/page.tsx

- L46: "description: "Site publico exclusivo por racha via slug."," -> "description: "Site público exclusivo por racha via slug.","
- L49: "title: "Logo dinamica"," -> "title: "Logo dinâmica","
- L50: "description: "Aplicada no painel e no site publico."," -> "description: "Aplicada no painel e no site público.","
- L54: "description: "Presidente com posicao e apelido."," -> "description: "Presidente com posição e apelido.","
- L57: "title: "Slug publico"," -> "title: "Slug público","
- L68: "blurb: "Controle total do racha, com menos esforco e mais organizacao."," -> "blurb: "Controle total do racha, com menos esforço e mais organização.","
- L70: ""Sorteio inteligente e rankings automaticos"," -> ""Sorteio inteligente e rankings automáticos","
- L71: ""Financas e patrocinios organizados no site"," -> ""Finanças e patrocínios organizados no site","
- L83: "marketingNote: "Servicos de marketing comecam apos o primeiro pagamento."," -> "marketingNote: "Serviços de marketing começam após o primeiro pagamento.","
- L87: "blurb: "Controle total do racha, com menos esforco e mais organizacao."," -> "blurb: "Controle total do racha, com menos esforço e mais organização.","
- L89: ""Sorteio inteligente e rankings automaticos"," -> ""Sorteio inteligente e rankings automáticos","
- L90: ""Financas e patrocinios organizados no site"," -> ""Finanças e patrocínios organizados no site","
- L102: "marketingNote: "Servicos de marketing comecam apos o primeiro pagamento."," -> "marketingNote: "Serviços de marketing começam após o primeiro pagamento.","
- L447: "if (!adminPosicao) nextErrors.adminPosicao = "Selecione a posicao.";" -> "if (!adminPosicao) nextErrors.adminPosicao = "Selecione a posição.";"
- L453: "nextErrors.adminConfirmSenha = "As senhas nao conferem.";" -> "nextErrors.adminConfirmSenha = "As senhas não conferem.";"
- L955: "Link publico: https://app.fut7pro.com.br/{rachaSlug || "<slug>"}" -> "Link público: https://app.fut7pro.com.br/{rachaSlug || "<slug>"}"
- L1141: ""Servicos de marketing comecam apos o primeiro pagamento."}" -> ""Serviços de marketing começam após o primeiro pagamento."}"
- L1211: "Cupom nao encontrado. Voce pode continuar sem cupom." -> "Cupom não encontrado. Você pode continuar sem cupom."
- L1284: "Crie seu racha e complete seu perfil. Em minutos voce entra como presidente com painel" -> "Crie seu racha e complete seu perfil. Em minutos você entra como presidente com painel"
- L1285: "e site publico sincronizados." -> "e site público sincronizados."

### src/app/cadastrar-racha/verificar-email/VerificarEmailClient.tsx

- L109: "Ativacao do painel" -> "Ativação do painel"
- L115: "{status === "loading" && "Aguarde enquanto validamos seu link de confirmacao."}" -> "{status === "loading" && "Aguarde enquanto validamos seu link de confirmação."}"
- L165: "{resendStatus === "loading" ? "Enviando..." : "Reenviar confirmacao"}" -> "{resendStatus === "loading" ? "Enviando..." : "Reenviar confirmação"}"

### src/components/admin/BannerNotificacoes.tsx

- L125: "message: `Atencao: Seu racha esta agendado para um dia de feriado (${label}${" -> "message: `Atenção: Seu racha está agendado para um dia de feriado (${label}${"
- L127: "}). Confirme se o racha ira acontecer normalmente ou reagende.`," -> "}). Confirme se o racha irá acontecer normalmente ou reagende.`,"
- L134: "message: `Atencao: ${pendingInfo.count} ${" -> "message: `Atenção: ${pendingInfo.count} ${"
- L138: "} desde ${format(pendingInfo.oldestDate, "dd/MM/yyyy")}. Publique os resultados para atualizar rankings e historico.`," -> "} desde ${format(pendingInfo.oldestDate, "dd/MM/yyyy")}. Publique os resultados para atualizar rankings e histórico.`,"

### src/components/admin/BannerUpload.tsx

- L146: "Banner do Campeao do Dia" -> "Banner do Campeão do Dia"
- L196: "<span>Area do banner (16:9). Arraste para posicionar.</span>" -> "<span>Área do banner (16:9). Arraste para posicionar.</span>"
- L212: "alt="Banner do Time Campeao do Dia"" -> "alt="Banner do Time Campeão do Dia""
- L219: "Nao foi possivel carregar a imagem. Tente selecionar outra foto." -> "Não foi possível carregar a imagem. Tente selecionar outra foto."

### src/components/admin/CardsDestaquesDiaV2.tsx

- L442: "infoExtra={meia?.nome ? `${assistenciasMeia} assistencias` : ""}" -> "infoExtra={meia?.nome ? `${assistenciasMeia} assistências` : ""}"
- L467: "titulo="TIME CAMPEAO DO DIA"" -> "titulo="TIME CAMPEÃO DO DIA""
- L491: "infoExtra={maestro?.assists ? `${maestro.assists} assistencias` : ""}" -> "infoExtra={maestro?.assists ? `${maestro.assists} assistências` : ""}"

### src/components/admin/CardTimeCampeaoDoDia.tsx

- L32: "nomeTime: \_nomeTime = "Time Campeao do Dia"," -> "nomeTime: \_nomeTime = "Time Campeão do Dia","
- L78: "const titulo = "Time Campeao do Dia";" -> "const titulo = "Time Campeão do Dia";"
- L115: "? `Campeao definido em ${labelData ?? "data mais recente"}.`" -> "? `Campeão definido em ${labelData ?? "data mais recente"}.`"
- L121: "<FaUserEdit /> {campeao ? "Editar Campeao" : "Cadastrar Campeao"}" -> "<FaUserEdit /> {campeao ? "Editar Campeão" : "Cadastrar Campeão"}"

### src/components/admin/HistoricoPartidasAdmin.tsx

- L109: "if (!value) return "Data nao informada";" -> "if (!value) return "Data não informada";"
- L111: "if (Number.isNaN(date.getTime())) return "Data nao informada";" -> "if (Number.isNaN(date.getTime())) return "Data não informada";"
- L584: "return <p className="text-xs text-neutral-400">Sem gols ou assistencias ainda.</p>;" -> "return <p className="text-xs text-neutral-400">Sem gols ou assistências ainda.</p>;"
- L617: "{formatDate(match.date, true)} - {match.location || "Local nao informado"}" -> "{formatDate(match.date, true)} - {match.location || "Local não informado"}"
- L882: ""Local nao informado";" -> ""Local não informado";"
- L957: "return renderEmptyState("Carregando historico...");" -> "return renderEmptyState("Carregando histórico...");"
- L962: "`Falha ao carregar historico. ${error instanceof Error ? error.message : ""}`" -> "`Falha ao carregar histórico. ${error instanceof Error ? error.message : ""}`"
- L969: "{renderEmptyState("Dia nao encontrado ou sem partidas registradas.")}" -> "{renderEmptyState("Dia não encontrado ou sem partidas registradas.")}"
- L974: "Voltar para o historico" -> "Voltar para o histórico"
- L990: "<p className="text-xs uppercase tracking-widest text-neutral-400">Historico do dia</p>" -> "<p className="text-xs uppercase tracking-widest text-neutral-400">Histórico do dia</p>"
- L995: "{selectedDay.location || "Local nao informado"}" -> "{selectedDay.location || "Local não informado"}"
- L1012: "Ultima atualizacao: {selectedDay.lastUpdateLabel}" -> "Última atualização: {selectedDay.lastUpdateLabel}"
- L1022: "Voltar para o historico" -> "Voltar para o histórico"
- L1044: "<p className="text-xs text-neutral-400">Time campeao do dia</p>" -> "<p className="text-xs text-neutral-400">Time campeão do dia</p>"
- L1046: "{selectedDay.highlights.campeao || "Nao definido"}" -> "{selectedDay.highlights.campeao || "Não definido"}"
- L1052: "{selectedDay.highlights.artilheiro || "Nao definido"}" -> "{selectedDay.highlights.artilheiro || "Não definido"}"
- L1058: "{selectedDay.highlights.maestro || "Nao definido"}" -> "{selectedDay.highlights.maestro || "Não definido"}"
- L1088: "{match.location || "Local nao informado"}" -> "{match.location || "Local não informado"}"
- L1223: "Historico completo" -> "Histórico completo"
- L1297: "Ultima atualizacao: {day.lastUpdateLabel}" -> "Última atualização: {day.lastUpdateLabel}"
- L1323: "Time campeao do dia:{" "}" -> "Time campeão do dia:{" "}"
- L1325: "{day.highlights.campeao || "Nao definido"}" -> "{day.highlights.campeao || "Não definido"}"
- L1331: "{day.highlights.artilheiro || "Nao definido"}" -> "{day.highlights.artilheiro || "Não definido"}"
- L1337: "{day.highlights.maestro || "Nao definido"}" -> "{day.highlights.maestro || "Não definido"}"

### src/components/admin/ModalCadastroTorneio.tsx

- L213: ""Preencha todos os campos obrigatorios, envie o banner e a logo do time campeao e adicione pelo menos um campeao."" -> ""Preencha todos os campos obrigatórios, envie o banner e a logo do time campeão e adicione pelo menos um campeão.""
- L353: "<label className="text-gray-300 font-medium text-sm">Titulo do Campeonato _</label>" -> "<label className="text-gray-300 font-medium text-sm">Título do Campeonato _</label>"
- L367: "<label className="text-gray-300 font-medium text-sm">Descricao do Campeonato _</label>" -> "<label className="text-gray-300 font-medium text-sm">Descrição do Campeonato _</label>"
- L375: "placeholder="Ex: Edicao especial realizada em 2025 com os melhores jogadores do racha."" -> "placeholder="Ex: Edição especial realizada em 2025 com os melhores jogadores do racha.""
- L382: "<label className="text-gray-300 font-medium text-sm">Data inicio _</label>" -> "<label className="text-gray-300 font-medium text-sm">Data início _</label>"
- L404: "<label className="text-gray-300 font-medium text-sm">Time campeao (nome) _</label>" -> "<label className="text-gray-300 font-medium text-sm">Time campeão (nome) _</label>"
- L471: "<label className="text-gray-300 font-medium text-sm">Logo do Time Campeao _</label>" -> "<label className="text-gray-300 font-medium text-sm">Logo do Time Campeão _</label>"
- L502: "<label className="text-gray-300 font-medium text-sm">Quantidade de Campeoes _</label>" -> "<label className="text-gray-300 font-medium text-sm">Quantidade de Campeões _</label>"
- L516: "<label className="text-gray-300 font-medium text-sm">Premiacao Total (R$)</label>" -> "<label className="text-gray-300 font-medium text-sm">Premiação Total (R$)</label>"
- L530: "<label className="text-gray-300 font-medium text-sm">Premiacao MVP</label>" -> "<label className="text-gray-300 font-medium text-sm">Premiação MVP</label>"
- L537: "placeholder="Ex: Trofeu + Voucher"" -> "placeholder="Ex: Troféu + Voucher""
- L622: "<h3 className="text-lg font-bold text-yellow-400">Selecione o campeao</h3>" -> "<h3 className="text-lg font-bold text-yellow-400">Selecione o campeão</h3>"
- L682: "Ajuste o Banner (proporcao 3:1)" -> "Ajuste o Banner (proporção 3:1)"

### src/components/admin/ModalRegrasDestaques.tsx

- L21: "<span className="font-bold text-yellow-300">Time Campeao do Dia:</span>" -> "<span className="font-bold text-yellow-300">Time Campeão do Dia:</span>"
- L22: "Somatoria de pontos nas partidas finalizadas (3 vitoria, 1 empate, 0 derrota)." -> "Somatória de pontos nas partidas finalizadas (3 vitória, 1 empate, 0 derrota)."
- L26: "Atacante do Time Campeao do Dia com mais gols. Desempate: mais assistencias, depois a" -> "Atacante do Time Campeão do Dia com mais gols. Desempate: mais assistências, depois a"
- L31: "Meia do Time Campeao do Dia com mais assistencias. Desempate: mais gols, depois a" -> "Meia do Time Campeão do Dia com mais assistências. Desempate: mais gols, depois a"
- L36: "Goleiro do Time Campeao do Dia." -> "Goleiro do Time Campeão do Dia."
- L40: "Escolha manual entre os zagueiros do Time Campeao do Dia (o sistema nao calcula" -> "Escolha manual entre os zagueiros do Time Campeão do Dia (o sistema não calcula"
- L49: "Jogador de qualquer time com mais assistencias no dia." -> "Jogador de qualquer time com mais assistências no dia."
- L53: "Nos cards de posicao do Time Campeao do Dia existe a opcao "Jogador nao compareceu ao" -> "Nos cards de posição do Time Campeão do Dia existe a opção "Jogador não compareceu ao"
- L54: "racha". Ao marcar, o sistema exibe o BOT correspondente e nao contabiliza rankings ou" -> "racha". Ao marcar, o sistema exibe o BOT correspondente e não contabiliza rankings ou"
- L55: "estatisticas do dia." -> "estatísticas do dia."

### src/components/admin/ResultadosDoDiaAdmin.tsx

- L22: "not_started: "Nao realizado"," -> "not_started: "Não realizado","
- L98: "if (!value) return "Data nao informada";" -> "if (!value) return "Data não informada";"
- L100: "if (Number.isNaN(date.getTime())) return "Data nao informada";" -> "if (Number.isNaN(date.getTime())) return "Data não informada";"
- L506: "<option value={NO_ASSIST_ID}>Sem assistencia</option>" -> "<option value={NO_ASSIST_ID}>Sem assistência</option>"
- L539: "<label className="block text-xs text-neutral-400 mb-2">Descricao (opcional)</label>" -> "<label className="block text-xs text-neutral-400 mb-2">Descrição (opcional)</label>"
- L838: "const confirmed = window.confirm("Desbloquear para correcao?");" -> "const confirmed = window.confirm("Desbloquear para correção?");"
- L863: "event.assistId === NO_ASSIST_ID ? "Sem assistencia" : assist?.name || "Assistencia";" -> "event.assistId === NO_ASSIST_ID ? "Sem assistência" : assist?.name || "Assistência";"
- L909: "{formatDate(match.date, true)} - {match.location || "Local nao informado"}" -> "{formatDate(match.date, true)} - {match.location || "Local não informado"}"
- L921: "<option value="not_started">Nao realizado</option>" -> "<option value="not_started">Não realizado</option>"
- L932: "Desbloquear para correcao" -> "Desbloquear para correção"
- L960: "Desfazer ultimo gol" -> "Desfazer último gol"
- L1086: "Ao finalizar, o resultado entra nos rankings, estatisticas e historico publico." -> "Ao finalizar, o resultado entra nos rankings, estatísticas e histórico público."
- L1089: "<li>- A edicao fica bloqueada (pode desbloquear para correcao).</li>" -> "<li>- A edição fica bloqueada (pode desbloquear para correção).</li>"
- L1090: "<li>- Vitorias, empates e derrotas sao calculados automaticamente.</li>" -> "<li>- Vitórias, empates e derrotas são calculados automaticamente.</li>"
- L1243: "activeLabel: "Rodadas da sessao"," -> "activeLabel: "Rodadas da sessão","
- L1416: "rankings e historico." -> "rankings e histórico."
- L1434: "<span>Veja o Time Campeao do Dia e os destaques individuais da rodada.</span>" -> "<span>Veja o Time Campeão do Dia e os destaques individuais da rodada.</span>"
- L1440: "Abrir Time Campeao do Dia" -> "Abrir Time Campeão do Dia"
- L1452: "Lance placares e gols em tempo real. Ao finalizar, rankings e perfis sao atualizados" -> "Lance placares e gols em tempo real. Ao finalizar, rankings e perfis são atualizados"
- L1637: "<p>Tem certeza que deseja deletar esta rodada? Essa acao nao pode ser desfeita.</p>" -> "<p>Tem certeza que deseja deletar esta rodada? Essa ação não pode ser desfeita.</p>"

### src/components/cards/GamesOfTheDayMobileModal.tsx

- L23: "Como sao escolhidos os destaques do dia?" -> "Como são escolhidos os destaques do dia?"
- L28: "do <b>time campeao</b>, aquele que fez mais gols." -> "do <b>time campeão</b>, aquele que fez mais gols."
- L32: "<b>time campeao</b>, quem deu mais assistencias." -> "<b>time campeão</b>, quem deu mais assistências."
- L36: "os zagueiros do <b>time campeao</b> do dia (o sistema nao calcula desarmes)." -> "os zagueiros do <b>time campeão</b> do dia (o sistema não calcula desarmes)."
- L40: "<b>time campeao</b> do dia." -> "<b>time campeão</b> do dia."
- L47: "qualquer time/posicao com mais gols na rodada." -> "qualquer time/posição com mais gols na rodada."
- L51: "time/posicao com mais assistencias no dia." -> "time/posição com mais assistências no dia."
- L55: "<span className="text-brand-strong font-bold">Obs:</span> Esses criterios valorizam quem" -> "<span className="text-brand-strong font-bold">Obs:</span> Esses critérios valorizam quem"
- L56: "ajudou o time a ser campeao, mesmo que nao seja o maior artilheiro ou assistente geral do" -> "ajudou o time a ser campeão, mesmo que não seja o maior artilheiro ou assistente geral do"

### src/components/cards/QuadrimestreGrid.tsx

- L35: ""Campeao do Quadrimestre"," -> ""Campeão do Quadrimestre","
- L42: ""Campeao"," -> ""Campeão","
- L88: "CAMPEOES DO QUADRIMESTRE" -> "CAMPEÕES DO QUADRIMESTRE"
- L93: "Ranking liberado no inicio do quadrimestre." -> "Ranking liberado no início do quadrimestre."
- L106: "alt="Icone do premio"" -> "alt="Ícone do prêmio""
- L130: "campeao" -> "campeão"
- L141: "<li className="text-center text-gray-600 py-8">Nenhum campeao registrado</li>" -> "<li className="text-center text-gray-600 py-8">Nenhum campeão registrado</li>"

### src/components/layout/Footer.tsx

- L48: "{ id: "premiacao", label: "Sistema de Premiacao", href: publicHref("/os-campeoes") }," -> "{ id: "premiacao", label: "Sistema de Premiação", href: publicHref("/os-campeoes") },"
- L57: "{ id: "privacidade", label: "Politica de Privacidade", href: publicHref("/privacidade") }," -> "{ id: "privacidade", label: "Política de Privacidade", href: publicHref("/privacidade") },"
- L204: "<p className="text-gray-300 mb-3">{campoEndereco || "Endereco nao informado"}</p>" -> "<p className="text-gray-300 mb-3">{campoEndereco || "Endereço não informado"}</p>"
- L218: "<p className="text-brand font-bold mb-2">Siga - nos</p>" -> "<p className="text-brand font-bold mb-2">Siga-nos</p>"

### src/components/layout/Sidebar.tsx

- L14: "const BADGE_AUTOMATICO = "Automatico";" -> "const BADGE_AUTOMATICO = "Automático";"
- L17: "maestro: "Mais assistencias no dia (qualquer time)"," -> "maestro: "Mais assistências no dia (qualquer time)","
- L123: "footerLabel="assistencias"" -> "footerLabel="assistências""
- L255: "alt={`Icone ${title}`}" -> "alt={`Ícone ${title}`}"
- L307: "alt={`Icone ${title}`}" -> "alt={`Ícone ${title}`}"

### src/components/modals/DestaquesRegrasModal.tsx

- L54: "<span className="font-semibold text-brand-soft">Time Campeao do Dia:</span>{" "}" -> "<span className="font-semibold text-brand-soft">Time Campeão do Dia:</span>{" "}"
- L55: "somatoria de pontos nas partidas finalizadas (3 vitoria, 1 empate, 0 derrota)." -> "somatória de pontos nas partidas finalizadas (3 vitória, 1 empate, 0 derrota)."
- L59: "do Time Campeao do Dia com mais gols. Desempate: mais assistencias, depois a" -> "do Time Campeão do Dia com mais gols. Desempate: mais assistências, depois a"
- L64: "Campeao do Dia com mais assistencias. Desempate: mais gols, depois a primeira" -> "Campeão do Dia com mais assistências. Desempate: mais gols, depois a primeira"
- L69: "Time Campeao do Dia." -> "Time Campeão do Dia."
- L73: "manual entre os zagueiros do Time Campeao do Dia (o sistema nao calcula desarmes)." -> "manual entre os zagueiros do Time Campeão do Dia (o sistema não calcula desarmes)."
- L81: "qualquer time com mais assistencias no dia." -> "qualquer time com mais assistências no dia."

### src/components/modals/ThemeSavedModal.tsx

- L78: "Seu racha agora esta em <span className="text-brand font-semibold">{themeName}</span>, no" -> "Seu racha agora está em <span className="text-brand font-semibold">{themeName}</span>, no"
- L79: "admin e no site publico." -> "admin e no site público."

### src/components/superadmin/ModalDetalhesRacha.tsx

- L100: "<b>Ativo:</b> {ativo ? "Sim" : "Nao"}" -> "<b>Ativo:</b> {ativo ? "Sim" : "Não"}"
- L134: "<FaHistory /> Historico resumido:" -> "<FaHistory /> Histórico resumido:"

### src/components/superadmin/ModalNovaNotificacao.tsx

- L263: "<label className="text-xs text-zinc-400">Titulo</label>" -> "<label className="text-xs text-zinc-400">Título</label>"
- L266: "placeholder="Titulo da campanha"" -> "placeholder="Título da campanha""

### src/components/superadmin/ModalNovoAdmin.tsx

- L171: "newErrors.adminPosicao = "Selecione a posicao do presidente.";" -> "newErrors.adminPosicao = "Selecione a posição do presidente.";"
- L177: "newErrors.adminEmail = "Email invalido.";" -> "newErrors.adminEmail = "Email inválido.";"
- L185: "newErrors.rachaSlug = "Slug invalido: use minusculas, numeros e hifens (3-50).";" -> "newErrors.rachaSlug = "Slug inválido: use minúsculas, números e hífens (3-50).";"
- L199: "newErrors.existingTenantId = "Ja existe presidente ativo para este racha.";" -> "newErrors.existingTenantId = "Já existe presidente ativo para este racha.";"
- L261: "Fluxo operacional para onboarding assistido, migracoes e trocas de presidencia." -> "Fluxo operacional para onboarding assistido, migrações e trocas de presidência."
- L282: "<div className="text-xs text-gray-400">Cria tenant e ja cadastra o presidente.</div>" -> "<div className="text-xs text-gray-400">Cria tenant e já cadastra o presidente.</div>"
- L294: "<div className="text-xs text-gray-400">Vincula presidente a um tenant ja criado.</div>" -> "<div className="text-xs text-gray-400">Vincula presidente a um tenant já criado.</div>"
- L320: "Este racha ja possui presidente ativo. Marque "Permitir copresidencia" para" -> "Este racha já possui presidente ativo. Marque "Permitir copresidência" para"
- L331: "<span>Permitir copresidencia (mais de um ADMIN ativo)</span>" -> "<span>Permitir copresidência (mais de um ADMIN ativo)</span>"
- L367: "URL publica: https://app.fut7pro.com.br/{rachaSlug || "<slug>"}" -> "URL pública: https://app.fut7pro.com.br/{rachaSlug || "<slug>"}"
- L435: "<label className="block text-sm font-medium text-gray-300 mb-2">Posicao _</label>" -> "<label className="block text-sm font-medium text-gray-300 mb-2">Posição _</label>"
- L470: "Senha temporaria sera gerada automaticamente. O fluxo de convite por e-mail com token" -> "Senha temporária será gerada automaticamente. O fluxo de convite por e-mail com token"
- L482: "Senha temporaria para {result.adminEmail || "presidente"}:" -> "Senha temporária para {result.adminEmail || "presidente"}:"
