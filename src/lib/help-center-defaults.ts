import type { HelpCenterConfig, HelpCenterTopic } from "@/types/help-center";

export const OFFICIAL_YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@Fut7Pro_app";

export const DEFAULT_HELP_CENTER_TOPICS: HelpCenterTopic[] = [
  {
    id: "primeiros-passos-acesso",
    categoria: "Primeiros passos",
    titulo: "Primeiro acesso do administrador",
    destaque: true,
    ordem: 1,
    conteudo:
      "1. Faça login com o e-mail aprovado como administrador.\n2. Se você administra mais de um racha, selecione o racha ativo no Hub (/admin/selecionar-racha).\n3. Confirme no topo do painel se o nome e o escudo do racha estão corretos.\n4. Antes de operar, valide em Administração > Administradores se os cargos estão corretos (Presidente, Vice, Diretor de Futebol e Diretor Financeiro).\n5. Configure os dados básicos em Personalização > Identidade Visual para alinhar marca, nome e logo do racha.",
    tags: ["login", "hub", "racha ativo", "primeiro acesso"],
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
    titulo: "Configurar dias e horários do racha",
    destaque: true,
    ordem: 10,
    conteudo:
      "1. Acesse Partidas > Próximos Rachas ou a área de agenda do racha.\n2. Defina dia da semana, horário e local padrão.\n3. Salve e revise a agenda para confirmar recorrência.\n4. Quando houver feriado ou alteração pontual, ajuste apenas a ocorrência necessária para não quebrar o calendário mensal.",
    tags: ["agenda", "dias", "horários"],
  },
  {
    id: "partidas-criar-resultado",
    categoria: "Partidas",
    titulo: "Criar partida e registrar resultado completo",
    destaque: true,
    ordem: 11,
    conteudo:
      "1. Crie a partida na data correta.\n2. Defina participantes e confirme presença (titular, substituto ou ausente).\n3. Após o jogo, abra o histórico e lance placar, gols, assistências, cartões e destaques.\n4. Valide os nomes antes de salvar, porque esses dados impactam rankings, conquistas e perfis dos atletas.\n5. Se precisar corrigir, edite a partida no histórico e confirme novamente os totais.",
    tags: ["histórico", "resultado", "gols", "assistências"],
  },
  {
    id: "partidas-sorteio-inteligente",
    categoria: "Partidas",
    titulo: "Sorteio Inteligente com equilíbrio real",
    destaque: true,
    ordem: 12,
    conteudo:
      "1. Em Partidas > Sorteio Inteligente, selecione apenas atletas aptos para jogar.\n2. Confira se as posições estão preenchidas (goleiro, zagueiro, meia, atacante).\n3. Gere os times e revise o balanceamento por ranking, estrelas e assiduidade.\n4. Ajuste manualmente apenas quando houver necessidade específica (lesão, chegada atrasada, limitação física).\n5. Salve o sorteio final para manter rastreabilidade do dia.",
    tags: ["sorteio", "balanceamento", "times"],
  },
  {
    id: "partidas-times-do-dia",
    categoria: "Partidas",
    titulo: "Times do Dia e Time Campeão do Dia",
    destaque: true,
    ordem: 13,
    conteudo:
      "Times do Dia: mostra escalações e organização da rodada.\nTime Campeão do Dia: registra o destaque final com foto e atletas campeões.\nBoas práticas:\n- Publique somente após conferir placar e elenco final.\n- Evite duplicar publicação no mesmo dia.\n- Se houver erro na foto ou atletas, edite imediatamente para não afetar perfis e mural público.",
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
      "1. Abra Comunicação > Solicitações ou o atalho no topo do painel.\n2. Revise nome, posição e contexto do pedido.\n3. Aprovando: o atleta passa a acessar o ambiente do racha.\n4. Rejeitando: informe motivo claro para evitar novo pedido sem correção.\n5. Mantenha o fluxo diário para não acumular pendências no onboarding de atletas.",
    tags: ["solicitações", "aprovação", "entrada"],
  },
  {
    id: "jogadores-mensalistas",
    categoria: "Jogadores",
    titulo: "Mensalistas e controle de adimplência",
    destaque: true,
    ordem: 22,
    conteudo:
      "Use Jogadores > Mensalistas (e Financeiro > Mensalistas) para controlar competências pagas e pendentes.\n- Marque pagamento por mês/competência.\n- Evite lançar pagamento em atleta errado: confirme nome e período.\n- Utilize os filtros por situação para cobrança ativa.\n- Com dados em dia, os relatórios financeiros ficam confiáveis para prestação de contas.",
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
    titulo: "Identidade visual do racha",
    destaque: true,
    ordem: 50,
    conteudo:
      "1. Em Personalização > Identidade Visual, atualize nome, escudo, slogan e descrição.\n2. Use arquivos de imagem leves e legíveis em mobile.\n3. Depois de salvar, valide no botão Ver o Site se o resultado ficou correto em desktop e celular.\n4. Evite textos muito longos no cabeçalho para não quebrar layout.",
    tags: ["identidade visual", "logo", "branding"],
  },
  {
    id: "personalizacao-paginas",
    categoria: "Personalização",
    titulo: "Editar páginas públicas (Sobre nós, Estatuto, Contatos)",
    destaque: false,
    ordem: 51,
    conteudo:
      "Use Personalização > Editar Páginas para manter o site público atualizado.\n- Sobre nós: história, timeline e conteúdo institucional.\n- Estatuto: regras oficiais do racha.\n- Contatos: canais de comunicação atualizados.\nSempre revise ortografia e coerência antes de publicar.",
    tags: ["sobre nós", "estatuto", "contatos"],
  },
  {
    id: "personalizacao-footer-redes",
    categoria: "Personalização",
    titulo: "Rodapé e redes sociais",
    destaque: false,
    ordem: 52,
    conteudo:
      "1. Em Personalização > Footer e Redes Sociais, ajuste links oficiais do racha.\n2. Evite links quebrados ou sem https.\n3. Mantenha somente canais ativos para evitar frustração do atleta.\n4. Após salvar, confira no site público se os ícones abriram corretamente.",
    tags: ["footer", "redes sociais", "links"],
  },
  {
    id: "administracao-administradores",
    categoria: "Administração",
    titulo: "Gerenciar administradores com segurança",
    destaque: true,
    ordem: 60,
    conteudo:
      "1. Acesse Administração > Administradores.\n2. Convide apenas pessoas responsáveis pela operação do racha.\n3. Defina função adequada (Presidente, Vice, Diretor de Futebol, Diretor Financeiro).\n4. Revogue acessos de quem saiu da gestão imediatamente.\n5. Sempre revise permissões após mudanças de equipe.",
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
    titulo: "Transferência de propriedade do racha",
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
    titulo: "Enquetes para decisões do racha",
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
      "A página de Sugestões é rastreável por status.\n- Atleta envia no site do racha.\n- Admin marca como lida e pode encaminhar para o Fut7Pro.\n- SuperAdmin avalia e responde.\nAcompanhe status como Encaminhada, Em avaliação, Planejada, Concluída ou Rejeitada.",
    tags: ["sugestões", "feedback", "fut7pro"],
  },
  {
    id: "comunicacao-notificacoes",
    categoria: "Comunicação",
    titulo: "Notificações do painel admin",
    destaque: true,
    ordem: 73,
    conteudo:
      "Notificações do Admin são diferentes das notificações do site público.\nNo painel Admin:\n1. Acompanhe badge no cabeçalho.\n2. Abra Comunicação > Notificações para ver lista completa.\n3. Marque como lida ou ler todas.\n4. Use o link da notificação para abrir o item relacionado (ex.: sugestão específica).",
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
      "Abra chamado quando houver: erro de sistema, dúvida operacional bloqueante, divergência de dados ou sugestão técnica.\nPara acelerar atendimento, inclua:\n- O que aconteceu\n- Onde aconteceu (módulo/rota)\n- Impacto no racha\n- Passo a passo para reproduzir",
    tags: ["suporte", "chamado", "incidente"],
  },
  {
    id: "configuracoes-assinatura",
    categoria: "Configurações e plano",
    titulo: "Status da assinatura e bloqueios",
    destaque: true,
    ordem: 80,
    conteudo:
      "Se houver bloqueio de assinatura, alguns módulos podem ficar restritos.\nVerifique em Admin > Status da assinatura:\n1. Situação atual (trial, ativo, vencido etc.)\n2. Prazo de regularização\n3. Próxima cobrança\nApós regularizar, atualizações podem levar alguns minutos para refletir.",
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
      "1. Confirme e-mail e senha.\n2. Use recuperação de senha em /admin/esqueci-senha.\n3. Verifique se sua conta ainda possui vínculo de administrador no racha.\n4. Se o problema persistir, abra chamado no suporte informando e-mail e horário do erro.",
    tags: ["acesso", "login", "senha"],
  },
  {
    id: "faq-dados-nao-atualizam",
    categoria: "Dúvidas frequentes",
    titulo: "Atualizei no painel e não refletiu no site",
    destaque: true,
    ordem: 101,
    conteudo:
      "Em geral a atualização é rápida, mas pode levar alguns minutos de cache.\nChecklist:\n- Confirme se você salvou sem erro.\n- Recarregue a página pública.\n- Verifique se o racha ativo é o correto.\n- Se continuar sem refletir, abra suporte com print da edição e URL pública.",
    tags: ["cache", "publicação", "site público"],
  },
  {
    id: "faq-quem-ve-o-que",
    categoria: "Dúvidas frequentes",
    titulo: "Quem vê cada informação no Fut7Pro",
    destaque: false,
    ordem: 102,
    conteudo:
      "- Público: páginas do racha e dados liberados para visitantes/atletas.\n- Admin do racha: gestão operacional e dados internos do tenant.\n- SuperAdmin Fut7Pro: visão global da plataforma.\nEsse isolamento protege dados e evita vazamento entre rachas.",
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
