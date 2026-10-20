import type { HelpCenterConfig, HelpCenterTopic } from "@/types/help-center";
import { FUT7PRO_SOCIALS } from "@/config/fut7pro-socials";

export const OFFICIAL_YOUTUBE_CHANNEL_URL = FUT7PRO_SOCIALS.youtube.url;

export const DEFAULT_HELP_CENTER_TOPICS: HelpCenterTopic[] = [
  {
    id: "primeiros-passos-acesso",
    categoria: "Primeiros passos",
    titulo: "Primeiro acesso do administrador",
    destaque: true,
    ordem: 1,
    conteudo:
      "1. Entre com a conta que tem acesso administrativo ao grupo.\n2. Se você administra mais de um grupo, escolha no Hub aquele que deseja gerenciar.\n3. Confira o nome e a logo do grupo no topo do painel.\n4. Em Administração > Administradores, confira os cargos e convites da equipe.\n5. Em Personalização > Identidade Visual, ajuste o nome e a logo do grupo, se necessário.",
    tags: ["login", "hub", "grupo ativo", "primeiro acesso"],
  },
  {
    id: "dashboard-visao-geral",
    categoria: "Dashboard",
    titulo: "Como usar o Dashboard sem perder alertas importantes",
    destaque: true,
    ordem: 2,
    conteudo:
      "O Dashboard é o centro de controle diário.\n- Verifique cartões de alertas e pendências no topo antes de qualquer ação.\n- Use os atalhos para abrir rapidamente Partidas, Jogadores, Financeiro e Comunicação.\n- Priorize avisos de assinatura, solicitações pendentes e mensagens não lidas.\n- Sempre confirme se o ciclo atual (mês/temporada) está correto antes de lançar dados financeiros ou encerrar campeões.",
    tags: ["dashboard", "alertas", "rotina"],
  },
  {
    id: "partidas-dias-horarios",
    categoria: "Partidas",
    titulo: "Configurar dias e horários do grupo",
    destaque: true,
    ordem: 10,
    conteudo:
      "1. Acesse Partidas > Dias e Horários para consultar os próximos encontros.\n2. Se precisar cadastrar ou remover um horário recorrente, use a opção de gerenciamento nessa página.\n3. Na tela de gerenciamento, escolha o dia da semana e o horário, depois selecione Adicionar.\n4. Confira a agenda atualizada. O sistema sinaliza quando a próxima data coincide com um feriado.",
    tags: ["agenda", "dias", "horários"],
  },
  {
    id: "partidas-criar-resultado",
    categoria: "Partidas",
    titulo: "Preparar partidas e registrar resultados",
    destaque: true,
    ordem: 11,
    conteudo:
      "1. Em Partidas > Gerenciar Times, cadastre pelo menos dois times oficiais ativos. Esse cadastro é obrigatório.\n2. Em Partidas > Criar Partidas, escolha Sorteio Inteligente ou Partida Clássica para organizar o jogo.\n3. Em Partidas > Partidas e Resultados, acompanhe a rodada e registre os resultados dos confrontos.\n4. Confira os times, atletas e placares antes de concluir. Os resultados alimentam o histórico e os rankings.\n5. Se precisar corrigir um resultado, use a opção de edição no histórico.",
    tags: ["histórico", "resultado", "gols", "assistências"],
  },
  {
    id: "partidas-sorteio-inteligente",
    categoria: "Partidas",
    titulo: "Sorteio Inteligente com equilíbrio real",
    destaque: true,
    ordem: 12,
    conteudo:
      "1. Cadastre os times oficiais em Partidas > Gerenciar Times antes de criar a rodada.\n2. Em Partidas > Criar Partidas, escolha Sorteio Inteligente.\n3. Selecione os times e atletas disponíveis e confira as posições cadastradas.\n4. Gere o sorteio e revise a composição dos Times do Dia antes de continuar.\n5. Acompanhe os confrontos e resultados em Partidas > Partidas e Resultados.",
    tags: ["sorteio", "balanceamento", "times"],
  },
  {
    id: "partidas-times-do-dia",
    categoria: "Partidas",
    titulo: "Times do Dia e Time Campeão do Dia",
    destaque: true,
    ordem: 13,
    conteudo:
      "Os times oficiais são cadastrados em Partidas > Gerenciar Times. Os Times do Dia mostram as escalações organizadas para cada rodada ou sorteio.\nDepois de concluir os resultados da rodada, acesse Partidas > Time Campeão do Dia para registrar o time vencedor e os destaques.\nAntes de publicar, confira o placar e o elenco. Se houver erro, use as opções de correção disponíveis na página.",
    tags: ["times do dia", "campeão", "publicação"],
  },
  {
    id: "jogadores-cadastro",
    categoria: "Jogadores",
    titulo: "Cadastro, edição e status dos jogadores",
    destaque: true,
    ordem: 20,
    conteudo:
      "1. Acesse Jogadores > Listar/Cadastrar.\n2. Cadastre nome, posição principal e dados essenciais.\n3. Defina o status de participação para manter sorteio e relatórios corretos.\n4. Em caso de saída do atleta, não apague histórico sem necessidade; prefira desativar status para preservar estatísticas.",
    tags: ["jogadores", "cadastro", "status"],
  },
  {
    id: "jogadores-solicitacoes",
    categoria: "Jogadores",
    titulo: "Aprovar ou rejeitar solicitações de entrada",
    destaque: true,
    ordem: 21,
    conteudo:
      "1. Acesse Jogadores > Listar/Cadastrar e localize Solicitações pendentes.\n2. Confira os dados do pedido antes de aprovar ou rejeitar.\n3. Ao aprovar, o atleta passa a integrar o grupo.\n4. Ao rejeitar, informe um motivo claro.\n5. Revise as solicitações pendentes regularmente.",
    tags: ["solicitações", "aprovação", "entrada"],
  },
  {
    id: "jogadores-mensalistas",
    categoria: "Jogadores",
    titulo: "Mensalistas e controle de adimplência",
    destaque: true,
    ordem: 22,
    conteudo:
      "Use Jogadores > Gestão de Mensalistas para configurar os atletas mensalistas e Financeiro > Cobrança de Mensalistas para acompanhar os pagamentos.\n- Confira o atleta e a competência antes de registrar um pagamento.\n- Use os filtros de pagamentos confirmados e pendentes para acompanhar a cobrança.\n- Os pagamentos registrados também aparecem na Prestação de Contas.",
    tags: ["mensalistas", "adimplência", "competência"],
  },
  {
    id: "conquistas-os-campeoes",
    categoria: "Conquistas",
    titulo: "Encerrar temporada e atualizar Os Campeões",
    destaque: true,
    ordem: 30,
    conteudo:
      "1. Valide se todas as partidas do período estão lançadas.\n2. Acesse Conquistas > Os Campeões e finalize a temporada quando necessário.\n3. O sistema calcula rankings anuais/quadrimestrais com base no histórico consolidado.\n4. Após fechar, revise os perfis dos atletas e o mural público para confirmar atualização correta.",
    tags: ["campeões", "temporada", "encerramento"],
  },
  {
    id: "conquistas-grandes-torneios",
    categoria: "Conquistas",
    titulo: "Gestão de Grandes Torneios",
    destaque: false,
    ordem: 31,
    conteudo:
      "Em Conquistas > Grandes Torneios:\n- Cadastre nome, ano, status e descrição do torneio.\n- Defina campeões e jogadores campeões com atenção aos nomes e posições.\n- Publique somente quando a lista final estiver validada.\n- Use destaque no site com critério para não conflitar com torneios antigos.",
    tags: ["torneios", "publicação", "campeões"],
  },
  {
    id: "financeiro-prestacao-de-contas",
    categoria: "Financeiro",
    titulo: "Lançar entradas e saídas corretamente",
    destaque: true,
    ordem: 40,
    conteudo:
      "1. Vá em Financeiro > Prestação de Contas.\n2. No novo lançamento, escolha tipo (entrada/saída), categoria, valor e data.\n3. Sempre escreva descrição clara (ex.: mensalidade fevereiro, aluguel campo, arbitragem).\n4. Ao corrigir um lançamento, preserve histórico com justificativa para auditoria interna.\n5. Gere exportações PDF/CSV para transparência com os atletas.",
    tags: ["financeiro", "entradas", "saídas", "prestação de contas"],
  },
  {
    id: "financeiro-patrocinadores",
    categoria: "Financeiro",
    titulo: "Cadastrar patrocinadores e acompanhar retorno",
    destaque: true,
    ordem: 41,
    conteudo:
      "No módulo Financeiro > Patrocinadores:\n- Cadastre marca, plano, vigência e mídia vinculada.\n- Atualize logo e links com UTM quando necessário.\n- Acompanhe entregas e status para evitar patrocinador expirado sem ação.\n- Confirme visibilidade no site público do racha após salvar.",
    tags: ["patrocinadores", "receita", "mídia"],
  },
  {
    id: "personalizacao-identidade",
    categoria: "Personalização",
    titulo: "Identidade visual do grupo",
    destaque: true,
    ordem: 50,
    conteudo:
      "1. Em Personalização > Identidade Visual, confira o nome e a logo do grupo.\n2. Se precisar, atualize o nome ou envie uma nova logo.\n3. Salve as alterações e abra o site público para conferir o resultado.\n4. Lembre-se de que a mudança do nome pode alterar o endereço público do grupo.",
    tags: ["identidade visual", "logo", "branding"],
  },
  {
    id: "personalizacao-paginas",
    categoria: "Personalização",
    titulo: "Editar páginas públicas (Nossa História, Estatuto, Contatos)",
    destaque: false,
    ordem: 51,
    conteudo:
      "Use Personalização > Páginas do Sobre Nós para atualizar o conteúdo público do grupo.\n- Nossa História: conte como a comunidade começou e registre seus momentos importantes.\n- Estatuto: mantenha as regras do grupo atualizadas.\n- Contatos: confira os canais de comunicação.\nRevise as informações antes de publicar.",
    tags: ["sobre nós", "estatuto", "contatos"],
  },
  {
    id: "personalizacao-footer-redes",
    categoria: "Personalização",
    titulo: "Rodapé e redes sociais",
    destaque: false,
    ordem: 52,
    conteudo:
      "1. Use Personalização > Rodapé/Footer para ajustar as informações do rodapé.\n2. Use Personalização > Redes Sociais para atualizar os canais oficiais do grupo.\n3. Depois de salvar, abra o site público e confira os links e ícones.\n4. Mantenha somente canais ativos e endereços válidos.",
    tags: ["footer", "redes sociais", "links"],
  },
  {
    id: "administracao-administradores",
    categoria: "Administração",
    titulo: "Gerenciar administradores com segurança",
    destaque: true,
    ordem: 60,
    conteudo:
      "1. Acesse Administração > Administradores.\n2. Confira quem ocupa cada cargo na gestão do grupo.\n3. O Presidente pode enviar ou cancelar convites para os cargos administrativos. O acesso só é concedido após o aceite.\n4. Quando a equipe mudar, revise os ocupantes e consulte Administração > Permissões.",
    tags: ["administradores", "rbac", "segurança"],
  },
  {
    id: "administracao-logs",
    categoria: "Administração",
    titulo: "Auditoria e logs do painel",
    destaque: true,
    ordem: 61,
    conteudo:
      "Em Administração > Logs você rastreia ações críticas.\nUse este fluxo para investigar inconsistências:\n1. Filtre por data aproximada do evento.\n2. Identifique usuário, ação e módulo afetado.\n3. Cruze com alteração observada no painel.\n4. Se necessário, abra chamado no suporte com evidências (data/hora e tela).",
    tags: ["logs", "auditoria", "rastreabilidade"],
  },
  {
    id: "administracao-transferencia",
    categoria: "Administração",
    titulo: "Transferência de propriedade do grupo",
    destaque: false,
    ordem: 62,
    conteudo:
      "1. Garanta que o novo responsável já possui conta ativa.\n2. Execute a transferência em Administração > Transferir Propriedade.\n3. Confirme se os papéis foram atualizados após concluir.\n4. Registre internamente a data da mudança para evitar dúvidas futuras.",
    tags: ["propriedade", "presidente", "transferência"],
  },
  {
    id: "comunicacao-comunicados",
    categoria: "Comunicação",
    titulo: "Publicar comunicados que realmente engajam",
    destaque: true,
    ordem: 70,
    conteudo:
      "1. Crie comunicados com título objetivo e mensagem curta.\n2. Defina período de exibição para não poluir o mural.\n3. Marque severidade correta (informativo, alerta, regra, financeiro).\n4. Arquive comunicados antigos para manter o feed limpo.",
    tags: ["comunicados", "mural", "engajamento"],
  },
  {
    id: "comunicacao-enquetes",
    categoria: "Comunicação",
    titulo: "Enquetes para decisões do grupo",
    destaque: true,
    ordem: 71,
    conteudo:
      "Em Comunicação > Enquetes:\n- Crie pergunta objetiva.\n- Defina opções claras e sem sobreposição.\n- Configure período de votação.\n- Publique e acompanhe resultado.\nBoas práticas: evite enquetes longas e publique somente quando a decisão depender de voto.",
    tags: ["enquetes", "votação", "decisão"],
  },
  {
    id: "comunicacao-sugestoes",
    categoria: "Comunicação",
    titulo: "Fluxo de sugestões (Atleta > Admin > Fut7Pro)",
    destaque: true,
    ordem: 72,
    conteudo:
      "A página de Sugestões mostra o andamento das ideias enviadas pelos atletas do grupo.\n- O atleta envia uma sugestão pelo site público.\n- A equipe administrativa pode marcar como lida e encaminhar para o Fut7Pro.\n- A equipe Fut7Pro avalia e atualiza o andamento.\nAcompanhe os status exibidos na página, como Encaminhada, Em avaliação, Planejada, Concluída ou Rejeitada.",
    tags: ["sugestões", "feedback", "fut7pro"],
  },
  {
    id: "comunicacao-notificacoes",
    categoria: "Comunicação",
    titulo: "Notificações do painel admin",
    destaque: true,
    ordem: 73,
    conteudo:
      "As notificações do painel administrativo são diferentes das notificações do site público.\n1. Acompanhe os avisos no cabeçalho.\n2. Abra Comunicação > Notificações para ver a lista completa.\n3. Marque uma notificação como lida ou use Marcar todas como lidas.\n4. Quando houver um link, abra o item relacionado para consultar os detalhes.",
    tags: ["notificações", "badge", "admin"],
  },
  {
    id: "comunicacao-mensagens",
    categoria: "Comunicação",
    titulo: "Mensagens para atletas: regras de uso",
    destaque: false,
    ordem: 74,
    conteudo:
      "A área de mensagens no site público é focada em recebimento de comunicações do administrador.\nUse comunicados e notificações para envio oficial de informações.\nMantenha textos diretos, com data, horário e ação esperada do atleta.",
    tags: ["mensagens", "atletas", "comunicação"],
  },
  {
    id: "comunicacao-suporte",
    categoria: "Comunicação",
    titulo: "Quando abrir chamado em Suporte",
    destaque: true,
    ordem: 75,
    conteudo:
      "Abra um chamado em Comunicação > Suporte quando encontrar um erro, uma dúvida que impeça o uso do painel ou uma divergência de dados.\nPara facilitar o atendimento, informe:\n- O que aconteceu\n- Em qual tela aconteceu\n- Como isso afeta o grupo\n- Quais passos permitem reproduzir o problema",
    tags: ["suporte", "chamado", "incidente"],
  },
  {
    id: "configuracoes-assinatura",
    categoria: "Configurações e plano",
    titulo: "Status da assinatura e bloqueios",
    destaque: true,
    ordem: 80,
    conteudo:
      "Acesse Financeiro > Planos & Limites para acompanhar a assinatura do grupo.\n- Confira o plano atual, o status financeiro e o status de acesso.\n- Veja o período do plano e a data do próximo vencimento.\n- Use Ver faturas para consultar as cobranças disponíveis.\n- Se houver pagamento pendente, siga as orientações de regularização exibidas nessa página.",
    tags: ["assinatura", "plano", "bloqueio"],
  },
  {
    id: "configuracoes-seguranca",
    categoria: "Configurações e plano",
    titulo: "Boas práticas de segurança para administradores",
    destaque: false,
    ordem: 81,
    conteudo:
      "- Use senhas fortes e exclusivas.\n- Não compartilhe credenciais entre membros da diretoria.\n- Revogue acessos antigos imediatamente.\n- Evite logins em dispositivos públicos.\n- Em caso de suspeita de acesso indevido, altere senha e revise logs.",
    tags: ["segurança", "senha", "acesso"],
  },
  {
    id: "boas-praticas-operacao-diaria",
    categoria: "Boas práticas",
    titulo: "Checklist diário de operação do racha",
    destaque: true,
    ordem: 90,
    conteudo:
      "Antes da rodada: confirmar agenda, participantes e pendências.\nApós a rodada: lançar resultado, validar estatísticas e publicar destaques.\nSemanalmente: revisar financeiro, patrocinadores, solicitações pendentes e comunicados.\nMensalmente: exportar prestação de contas e revisar qualidade dos dados.",
    tags: ["checklist", "rotina", "governança"],
  },
  {
    id: "boas-praticas-erros-comuns",
    categoria: "Boas práticas",
    titulo: "Erros comuns que geram retrabalho",
    destaque: false,
    ordem: 91,
    conteudo:
      "1. Lançar partida com atletas errados e esquecer de corrigir no histórico.\n2. Duplicar lançamentos financeiros no mesmo dia.\n3. Publicar campeões antes de conferir dados finais da partida.\n4. Manter administradores sem uso ainda com acesso ativo.\n5. Ignorar notificações e solicitações por muitos dias.",
    tags: ["erros comuns", "retrabalho", "qualidade de dados"],
  },
  {
    id: "boas-praticas-suporte-eficiente",
    categoria: "Boas práticas",
    titulo: "Como reduzir chamados de suporte no seu racha",
    destaque: false,
    ordem: 92,
    conteudo:
      "- Padronize o processo da equipe admin com um responsável por módulo.\n- Atualize a Central de Ajuda interna com dúvidas recorrentes da diretoria.\n- Use comunicados claros para reduzir dúvidas dos atletas.\n- Revise configurações do painel após mudanças de gestão.\n- Escalone para suporte apenas quando houver bloqueio real ou bug.",
    tags: ["suporte", "eficiência", "processo"],
  },
  {
    id: "faq-recuperacao-acesso",
    categoria: "Dúvidas frequentes",
    titulo: "Não consigo acessar o painel admin",
    destaque: true,
    ordem: 100,
    conteudo:
      "1. Confira o e-mail e a senha usados no login.\n2. Se esqueceu a senha, use Esqueci minha senha na página de login administrativo.\n3. Se o acesso ao painel não aparecer, confirme com a equipe do grupo se você ainda ocupa um cargo administrativo.\n4. Se o problema continuar, procure o suporte e informe o e-mail e o horário do erro.",
    tags: ["acesso", "login", "senha"],
  },
  {
    id: "faq-dados-nao-atualizam",
    categoria: "Dúvidas frequentes",
    titulo: "Atualizei no painel e não refletiu no site",
    destaque: true,
    ordem: 101,
    conteudo:
      "Se uma alteração não aparecer no site público:\n- Confira se ela foi salva sem erro.\n- Recarregue a página pública.\n- Confirme que você está administrando o grupo correto.\n- Se o problema continuar, procure o suporte com uma captura da tela editada e o endereço da página pública.",
    tags: ["cache", "publicação", "site público"],
  },
  {
    id: "faq-quem-ve-o-que",
    categoria: "Dúvidas frequentes",
    titulo: "Quem vê cada informação no Fut7Pro",
    destaque: false,
    ordem: 102,
    conteudo:
      "- Visitantes e atletas: informações disponíveis nas páginas públicas do grupo.\n- Administração do grupo: recursos do painel conforme o cargo e as permissões.\n- Equipe Fut7Pro: administração global da plataforma.\nO acesso a dados internos depende das permissões de cada área.",
    tags: ["multi-tenant", "permissões", "privacidade"],
  },
];

export const DEFAULT_HELP_CENTER_CONFIG: HelpCenterConfig = {
  youtubeChannelUrl: OFFICIAL_YOUTUBE_CHANNEL_URL,
  youtubeChannelLabel: "Canal oficial Fut7Pro",
  showVideos: false,
  topics: DEFAULT_HELP_CENTER_TOPICS,
  videos: [],
};
