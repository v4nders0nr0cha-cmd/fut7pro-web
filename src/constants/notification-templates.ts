import type { NotificationTemplate } from "@/types/notification-template";
import type { NotificationChannel } from "@/types/notificacao";

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  EMAIL: "E-mail",
  PUSH: "Push",
  WHATSAPP: "WhatsApp",
};

export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: "payment-confirmed",
    name: "Pagamento confirmado",
    description: "Confirmação automática enviada após aprovar um pagamento de mensalidade/planos.",
    category: "financeiro",
    type: "SISTEMA",
    defaultChannels: ["EMAIL", "PUSH"],
    tokens: [
      { key: "nomeResponsavel", label: "Nome do responsável", example: "Bruno" },
      { key: "valor", label: "Valor pago", example: "R$ 180,00" },
      { key: "competencia", label: "Competência", example: "Nov/2025" },
    ],
    email: {
      subject: "Pagamento confirmado - {{competencia}}",
      body: "Olá {{nomeResponsavel}},\n\nRecebemos o pagamento de {{valor}} referente a {{competencia}}. Obrigado por manter o racha organizado! Qualquer dúvida, responda este e-mail.\n\nTime Fut7Pro",
    },
    push: {
      title: "Pagamento confirmado",
      body: "{{nomeResponsavel}}, seu pagamento de {{valor}} foi confirmado.",
    },
  },
  {
    id: "invoice-reminder-7",
    name: "Lembrete de fatura (7 dias)",
    description: "Lembrete amigável avisando que a fatura vence em 7 dias.",
    category: "financeiro",
    type: "ALERTA",
    defaultChannels: ["EMAIL", "WHATSAPP"],
    tokens: [
      { key: "nomeResponsavel", label: "Nome do responsável", example: "Fernanda" },
      { key: "valor", label: "Valor da fatura", example: "R$ 220,00" },
      { key: "dataVencimento", label: "Data de vencimento", example: "12/11/2025" },
      { key: "linkPagamento", label: "Link de pagamento", example: "https://pagamento.fut7.pro" },
    ],
    email: {
      subject: "Faltam 7 dias para o vencimento",
      body: "Olá {{nomeResponsavel}},\n\nLembrando que a fatura de {{valor}} vence em {{dataVencimento}}. Você pode pagar usando o link: {{linkPagamento}}.\n\nObrigado!",
    },
    whatsapp: {
      message:
        "⚠️ Olá {{nomeResponsavel}}! Sua fatura de {{valor}} vence em {{dataVencimento}}. Pague aqui: {{linkPagamento}}",
    },
  },
  {
    id: "invoice-reminder-1",
    name: "Lembrete de fatura (1 dia)",
    description: "Aviso urgente enviado um dia antes do vencimento.",
    category: "financeiro",
    type: "ALERTA",
    defaultChannels: ["EMAIL", "WHATSAPP"],
    tokens: [
      { key: "nomeResponsavel", label: "Nome do responsável", example: "Marcos" },
      { key: "valor", label: "Valor da fatura", example: "R$ 220,00" },
      { key: "dataVencimento", label: "Data de vencimento", example: "12/11/2025" },
      { key: "linkPagamento", label: "Link de pagamento", example: "https://pagamento.fut7.pro" },
    ],
    email: {
      subject: "Sua fatura vence amanhã",
      body: "Olá {{nomeResponsavel}},\n\nSua fatura de {{valor}} vence amanhã ({{dataVencimento}}). Clique em {{linkPagamento}} para evitar bloqueios.\n\nValeu!",
    },
    whatsapp: {
      message:
        "⏰ Última chamada, {{nomeResponsavel}}! Sua fatura de {{valor}} vence amanhã ({{dataVencimento}}). Link: {{linkPagamento}}",
    },
  },
  {
    id: "trial-ending-3-days",
    name: "Trial termina em 3 dias",
    description: "Notificação automática para presidents em período de teste.",
    category: "engajamento",
    type: "SISTEMA",
    defaultChannels: ["EMAIL", "PUSH"],
    tokens: [
      { key: "nomeResponsavel", label: "Nome do responsável", example: "Juliana" },
      { key: "rachaNome", label: "Nome do racha", example: "Resenha FC" },
      {
        key: "linkUpgrade",
        label: "Link de upgrade",
        example: "https://app.fut7pro.com.br/upgrade",
      },
    ],
    email: {
      subject: "Seu trial do Fut7Pro termina em 3 dias",
      body: "Olá {{nomeResponsavel}},\n\nSeu período de teste do Fut7Pro para o racha {{rachaNome}} termina em 3 dias. Aproveite todos os recursos liberando um plano. Faça upgrade: {{linkUpgrade}}.",
    },
    push: {
      title: "Seu trial está acabando",
      body: "{{nomeResponsavel}}, faltam 3 dias para o fim do trial. Garanta o Fut7Pro agora.",
    },
  },
  {
    id: "sponsor-expiring",
    name: "Patrocínio prestes a expirar",
    description: "Aviso sobre patrocinador que expira em até 30 dias.",
    category: "patrocinio",
    type: "ALERTA",
    defaultChannels: ["PUSH", "EMAIL"],
    tokens: [
      { key: "nomeResponsavel", label: "Nome do responsável", example: "Diego" },
      { key: "patrocinador", label: "Nome do patrocinador", example: "Loja Fut7" },
      { key: "dataFim", label: "Data final", example: "30/11/2025" },
    ],
    email: {
      subject: "Patrocínio {{patrocinador}} expira em breve",
      body: "Oi {{nomeResponsavel}},\n\nO patrocínio {{patrocinador}} termina em {{dataFim}}. Renove ou cadastre um novo patrocinador para manter o caixa saudável.\n\nTime Fut7Pro",
    },
    push: {
      title: "Patrocínio perto do fim",
      body: "{{patrocinador}} expira em {{dataFim}}. Valide com o parceiro!",
    },
  },
  {
    id: "sponsor-roi-critical",
    name: "ROI de patrocinador em risco",
    description:
      "Alerta o time comercial/marketing quando um patrocinador entrega poucos cliques por real investido.",
    category: "patrocinio",
    type: "ALERTA",
    defaultChannels: ["EMAIL", "PUSH"],
    tokens: [
      { key: "nomeResponsavel", label: "Nome do responsável", example: "Livia" },
      { key: "patrocinador", label: "Nome do patrocinador", example: "Barbearia Arena" },
      { key: "roi", label: "ROI atual (cliques por R$)", example: "0,65" },
      { key: "cpc", label: "CPC médio", example: "R$ 8,40" },
      {
        key: "linkDashboard",
        label: "Link do dashboard de patrocinadores",
        example: "https://app.fut7pro.com.br/admin/financeiro/patrocinadores",
      },
    ],
    email: {
      subject: "ROI de {{patrocinador}} em alerta",
      body: "Olá {{nomeResponsavel}},\n\nDetectamos ROI de {{patrocinador}} em {{roi}} cliques/R$ e CPC médio de {{cpc}}. Revise o contrato e alinhe uma ação com Marketing. Dashboard: {{linkDashboard}}.\n\nTime Fut7Pro",
    },
    push: {
      title: "ROI crítico de {{patrocinador}}",
      body: "{{roi}} cliques/R$ e CPC {{cpc}}. Acione Marketing!",
    },
  },
  {
    id: "system-release",
    name: "Atualização importante do sistema",
    description: "Comunicado oficial sobre manutenções ou novas features.",
    category: "sistema",
    type: "SISTEMA",
    defaultChannels: ["EMAIL", "PUSH"],
    tokens: [
      { key: "nomeResponsavel", label: "Nome do responsável", example: "Equipe Fut7Pro" },
      {
        key: "titulo",
        label: "Título do comunicado",
        example: "Nova versão do sorteio inteligente",
      },
      {
        key: "linkDetalhes",
        label: "Link para o changelog",
        example: "https://status.fut7pro.com.br",
      },
    ],
    email: {
      subject: "{{titulo}} - Novidades Fut7Pro",
      body: "Olá {{nomeResponsavel}},\n\nTemos novidades importantes: {{titulo}}. Leia a íntegra em {{linkDetalhes}}.\n\nQualquer dúvida estamos por aqui!",
    },
    push: {
      title: "Atualização Fut7Pro",
      body: "{{titulo}} já disponível. Veja detalhes em {{linkDetalhes}}",
    },
  },
  {
    id: "invoice-overdue",
    name: "Fatura em atraso",
    description: "Cobrança automática enviada quando a fatura está vencida.",
    category: "financeiro",
    type: "ALERTA",
    defaultChannels: ["EMAIL", "WHATSAPP"],
    tokens: [
      { key: "nomeResponsavel", label: "Nome do responsável", example: "Bruno" },
      { key: "diasAtraso", label: "Dias em atraso", example: "3" },
      { key: "valor", label: "Valor devido", example: "R$ 210,00" },
      { key: "linkPagamento", label: "Link de pagamento", example: "https://pagamento.fut7.pro" },
    ],
    email: {
      subject: "Sua fatura está {{diasAtraso}} dia(s) em atraso",
      body: "Olá {{nomeResponsavel}},\n\nIdentificamos {{diasAtraso}} dia(s) de atraso no pagamento de {{valor}}. Regularize o quanto antes em {{linkPagamento}} para evitar bloqueios no painel.\n\nEquipe Fut7Pro",
    },
    whatsapp: {
      message:
        "🚨 {{nomeResponsavel}}, sua fatura de {{valor}} está {{diasAtraso}} dia(s) em atraso. Regularize em {{linkPagamento}}.",
    },
  },
  {
    id: "trial-activated",
    name: "Confirmação de trial",
    description: "Mensagem de boas-vindas quando o trial é ativado.",
    category: "engajamento",
    type: "SISTEMA",
    defaultChannels: ["EMAIL", "PUSH"],
    tokens: [
      { key: "nomeResponsavel", label: "Nome do responsável", example: "Paula" },
      { key: "rachaNome", label: "Nome do racha", example: "Quinta dos Amigos" },
      { key: "diasTrial", label: "Duração", example: "14 dias" },
    ],
    email: {
      subject: "Bem-vindo ao trial do Fut7Pro",
      body: "Olá {{nomeResponsavel}},\n\nSeu trial de {{diasTrial}} para o racha {{rachaNome}} foi ativado. Explore o sorteio inteligente, rankings e prestações de contas. Conte conosco!",
    },
    push: {
      title: "Trial ativado",
      body: "{{nomeResponsavel}}, o trial do Fut7Pro está ativo. Bora profissionalizar o racha!",
    },
  },
  {
    id: "trial-ending-1-day",
    name: "Trial termina amanhã",
    description: "Aviso enviado um dia antes do término do teste.",
    category: "engajamento",
    type: "ALERTA",
    defaultChannels: ["EMAIL", "PUSH"],
    tokens: [
      { key: "nomeResponsavel", label: "Nome do responsável", example: "Lucas" },
      {
        key: "linkUpgrade",
        label: "Link de upgrade",
        example: "https://app.fut7pro.com.br/upgrade",
      },
    ],
    email: {
      subject: "Seu trial do Fut7Pro termina amanhã",
      body: "Ei {{nomeResponsavel}},\n\nSeu período de teste termina amanhã. Garanta o Fut7Pro com todos os recursos clicando em {{linkUpgrade}}.",
    },
    push: {
      title: "Último dia de trial",
      body: "Seu trial acaba amanhã. Faça upgrade e continue com o Fut7Pro.",
    },
  },
  {
    id: "trial-ended-offer",
    name: "Oferta pós trial",
    description: "Oferta automática após o término do período de teste.",
    category: "engajamento",
    type: "SISTEMA",
    defaultChannels: ["EMAIL", "PUSH"],
    tokens: [
      { key: "nomeResponsavel", label: "Nome do responsável", example: "Renata" },
      { key: "cupom", label: "Cupom de desconto", example: "FUT72025" },
      {
        key: "linkUpgrade",
        label: "Link de upgrade",
        example: "https://app.fut7pro.com.br/upgrade",
      },
    ],
    email: {
      subject: "Seu trial terminou - aqui vai um incentivo",
      body: "Olá {{nomeResponsavel}},\n\nSeu trial acabou, mas o Fut7Pro não precisa acabar. Use o cupom {{cupom}} e finalize seu plano em {{linkUpgrade}}.",
    },
    push: {
      title: "Cupom liberado",
      body: "Use {{cupom}} para continuar com o Fut7Pro. Link: {{linkUpgrade}}",
    },
  },
  {
    id: "welcome-president",
    name: "Boas-vindas ao presidente",
    description: "Mensagem enviada quando um novo racha é criado.",
    category: "engajamento",
    type: "SISTEMA",
    defaultChannels: ["EMAIL", "PUSH"],
    tokens: [
      { key: "nomeResponsavel", label: "Nome do responsável", example: "Mariana" },
      { key: "rachaNome", label: "Nome do racha", example: "Galera do Sábado" },
      {
        key: "linkOnboarding",
        label: "Link de onboarding",
        example: "https://app.fut7pro.com.br/onboarding",
      },
    ],
    email: {
      subject: "Bem-vindo ao Fut7Pro!",
      body: "Olá {{nomeResponsavel}},\n\nParabéns por criar o racha {{rachaNome}} no Fut7Pro. Siga o passo a passo em {{linkOnboarding}} para configurar tudo.",
    },
    push: {
      title: "Conta criada com sucesso",
      body: "{{nomeResponsavel}}, seu racha já está no ar. Bora configurar?",
    },
  },
  {
    id: "security-sensitive-change",
    name: "Alteração de dados sensíveis",
    description: "Alerta enviado ao modificar senha, e-mail ou dados críticos.",
    category: "sistema",
    type: "ALERTA",
    defaultChannels: ["EMAIL"],
    tokens: [
      { key: "nomeResponsavel", label: "Nome do responsável", example: "Gustavo" },
      { key: "dadoAlterado", label: "Dado alterado", example: "senha" },
    ],
    email: {
      subject: "Confirmamos a alteração do seu {{dadoAlterado}}",
      body: "Olá {{nomeResponsavel}},\n\nRegistramos a alteração do seu {{dadoAlterado}}. Se não foi você, entre em contato imediatamente.",
    },
  },
  {
    id: "security-login-alert",
    name: "Login suspeito",
    description: "Alerta de segurança para acesso em dispositivo não reconhecido.",
    category: "sistema",
    type: "ALERTA",
    defaultChannels: ["EMAIL"],
    tokens: [
      { key: "nomeResponsavel", label: "Nome do responsável", example: "Miguel" },
      { key: "localidade", label: "Local do acesso", example: "São Paulo / SP" },
      { key: "data", label: "Data/Hora", example: "05/11 23:45" },
    ],
    email: {
      subject: "Detectamos um login em {{localidade}}",
      body: "Olá {{nomeResponsavel}},\n\nPercebemos um login em {{localidade}} ({{data}}). Se não reconhece, troque sua senha imediatamente.",
    },
  },
  {
    id: "feature-release",
    name: "Novas funcionalidades essenciais",
    description: "Aviso sobre funcionalidades importantes liberadas no SaaS.",
    category: "sistema",
    type: "SISTEMA",
    defaultChannels: ["EMAIL", "PUSH"],
    tokens: [
      { key: "titulo", label: "Título da novidade", example: "Novo dashboard financeiro" },
      { key: "linkDetalhes", label: "Link para detalhes", example: "https://blog.fut7pro.com.br" },
    ],
    email: {
      subject: "{{titulo}} já disponível",
      body: "Olá,\n\nAcabamos de liberar {{titulo}}. Leia tudo sobre a novidade em {{linkDetalhes}}.",
    },
    push: {
      title: "Novidade no Fut7Pro",
      body: "{{titulo}} disponível! Veja mais em {{linkDetalhes}}",
    },
  },
  {
    id: "official-communication",
    name: "Comunicado oficial",
    description: "Mensagens institucionais enviadas para todos os presidentes.",
    category: "sistema",
    type: "SISTEMA",
    defaultChannels: ["EMAIL", "PUSH"],
    tokens: [
      { key: "titulo", label: "Título do comunicado", example: "Nova política antifraude" },
      {
        key: "resumo",
        label: "Resumo do comunicado",
        example: "Reforçamos o processo de validação",
      },
      { key: "linkDetalhes", label: "Link completo", example: "https://status.fut7pro.com.br" },
    ],
    email: {
      subject: "[Comunicado] {{titulo}}",
      body: "Prezados,\n\n{{resumo}}. Leia o comunicado completo em {{linkDetalhes}}.\n\nAtenciosamente,\nTime Fut7Pro",
    },
    push: {
      title: "Comunicado Fut7Pro",
      body: "{{titulo}} - veja detalhes em {{linkDetalhes}}",
    },
  },
];
