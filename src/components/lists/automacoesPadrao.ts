// src/components/lists/automacoesPadrao.ts
import {
  NOTIFICATION_TEMPLATES,
  NOTIFICATION_CHANNEL_LABELS,
} from "@/constants/notification-templates";
import type { NotificationChannel } from "@/types/notificacao";
import type { AutomacaoNotificacao } from "@/types/automacao";
import type { NotificationTemplate } from "@/types/notification-template";

const templateIndex = NOTIFICATION_TEMPLATES.reduce<Record<string, NotificationTemplate>>(
  (acc, template) => {
    acc[template.id] = template;
    return acc;
  },
  {}
);

function labelsForChannels(channels?: NotificationChannel[]) {
  if (!channels?.length) return [];
  return channels.map((channel) => NOTIFICATION_CHANNEL_LABELS[channel]);
}

function ensureChannels(templateId: string) {
  const template = templateIndex[templateId];
  return {
    channels: template?.defaultChannels,
    labels: labelsForChannels(template?.defaultChannels),
    categoria: template?.category,
  };
}

export const automacoesPadrao: AutomacaoNotificacao[] = [
  (() => {
    const meta = ensureChannels("payment-confirmed");
    return {
      id: "1",
      nome: "Confirmação de pagamento",
      descricao: "Mensagem automática ao aprovar um pagamento.",
      gatilho: "Pagamento aprovado",
      canal: meta.labels,
      channels: meta.channels,
      templateId: "payment-confirmed",
      categoria: meta.categoria,
      obrigatoria: true,
      status: "ativo",
    };
  })(),
  (() => {
    const meta = ensureChannels("invoice-reminder-7");
    return {
      id: "2",
      nome: "Lembrete de vencimento (7 dias)",
      descricao: "Lembrete enviado 7 dias antes do vencimento da fatura.",
      gatilho: "7 dias antes do vencimento",
      canal: meta.labels,
      channels: meta.channels,
      templateId: "invoice-reminder-7",
      categoria: meta.categoria,
      obrigatoria: true,
      status: "ativo",
    };
  })(),
  (() => {
    const meta = ensureChannels("invoice-reminder-1");
    return {
      id: "3",
      nome: "Lembrete de vencimento (1 dia)",
      descricao: "Lembrete enviado 1 dia antes do vencimento da fatura.",
      gatilho: "1 dia antes do vencimento",
      canal: meta.labels,
      channels: meta.channels,
      templateId: "invoice-reminder-1",
      categoria: meta.categoria,
      obrigatoria: true,
      status: "ativo",
    };
  })(),
  (() => {
    const meta = ensureChannels("invoice-overdue");
    return {
      id: "4",
      nome: "Aviso de inadimplência",
      descricao: "Aviso automático quando a fatura está em atraso.",
      gatilho: "Fatura vencida",
      canal: meta.labels,
      channels: meta.channels,
      templateId: "invoice-overdue",
      categoria: meta.categoria,
      obrigatoria: true,
      status: "ativo",
    };
  })(),
  (() => {
    const meta = ensureChannels("trial-activated");
    return {
      id: "5",
      nome: "Confirmação de ativação do trial",
      descricao: "Confirmação automática ao ativar período de teste.",
      gatilho: "Ativação do trial",
      canal: meta.labels,
      channels: meta.channels,
      templateId: "trial-activated",
      categoria: meta.categoria,
      obrigatoria: true,
      status: "ativo",
    };
  })(),
  (() => {
    const meta = ensureChannels("trial-ending-3-days");
    return {
      id: "6",
      nome: "Aviso de término do trial (3 dias)",
      descricao: "Alerta de que o período de teste está acabando em 3 dias.",
      gatilho: "3 dias antes do fim do trial",
      canal: meta.labels,
      channels: meta.channels,
      templateId: "trial-ending-3-days",
      categoria: meta.categoria,
      obrigatoria: true,
      status: "ativo",
    };
  })(),
  (() => {
    const meta = ensureChannels("trial-ending-1-day");
    return {
      id: "7",
      nome: "Aviso de término do trial (1 dia)",
      descricao: "Alerta de que o período de teste está acabando em 1 dia.",
      gatilho: "1 dia antes do fim do trial",
      canal: meta.labels,
      channels: meta.channels,
      templateId: "trial-ending-1-day",
      categoria: meta.categoria,
      obrigatoria: true,
      status: "ativo",
    };
  })(),
  (() => {
    const meta = ensureChannels("trial-ended-offer");
    return {
      id: "8",
      nome: "Oferta após término do trial",
      descricao: "Oferta automática para converter usuário de teste em cliente.",
      gatilho: "Após término do trial",
      canal: meta.labels,
      channels: meta.channels,
      templateId: "trial-ended-offer",
      categoria: meta.categoria,
      obrigatoria: true,
      status: "ativo",
    };
  })(),
  (() => {
    const meta = ensureChannels("welcome-president");
    return {
      id: "9",
      nome: "Boas-vindas ao presidente",
      descricao: "Mensagem automática de boas-vindas ao criar conta de racha.",
      gatilho: "Conta criada",
      canal: meta.labels,
      channels: meta.channels,
      templateId: "welcome-president",
      categoria: meta.categoria,
      obrigatoria: true,
      status: "ativo",
    };
  })(),
  (() => {
    const meta = ensureChannels("security-sensitive-change");
    return {
      id: "10",
      nome: "Alerta de alteração de dados sensíveis",
      descricao: "Aviso automático ao alterar dados críticos (e-mail, senha).",
      gatilho: "Alteração de dados sensíveis",
      canal: meta.labels,
      channels: meta.channels,
      templateId: "security-sensitive-change",
      categoria: meta.categoria,
      obrigatoria: true,
      status: "ativo",
    };
  })(),
  (() => {
    const meta = ensureChannels("security-login-alert");
    return {
      id: "11",
      nome: "Alerta de login suspeito",
      descricao: "Aviso automático em caso de login em dispositivo não reconhecido.",
      gatilho: "Login suspeito",
      canal: meta.labels,
      channels: meta.channels,
      templateId: "security-login-alert",
      categoria: meta.categoria,
      obrigatoria: true,
      status: "ativo",
    };
  })(),
  (() => {
    const meta = ensureChannels("system-release");
    return {
      id: "12",
      nome: "Notificação de atualização importante",
      descricao: "Comunicado de atualizações críticas e manutenções.",
      gatilho: "Atualização do sistema",
      canal: meta.labels,
      channels: meta.channels,
      templateId: "system-release",
      categoria: meta.categoria,
      obrigatoria: true,
      status: "ativo",
    };
  })(),
  (() => {
    const meta = ensureChannels("feature-release");
    return {
      id: "13",
      nome: "Novas funcionalidades essenciais",
      descricao: "Aviso automático sobre funções essenciais liberadas.",
      gatilho: "Nova funcionalidade",
      canal: meta.labels,
      channels: meta.channels,
      templateId: "feature-release",
      categoria: meta.categoria,
      obrigatoria: true,
      status: "ativo",
    };
  })(),
  (() => {
    const meta = ensureChannels("official-communication");
    return {
      id: "14",
      nome: "Comunicados oficiais",
      descricao: "Comunicados institucionais importantes do Fut7Pro.",
      gatilho: "Comunicado institucional",
      canal: meta.labels,
      channels: meta.channels,
      templateId: "official-communication",
      categoria: meta.categoria,
      obrigatoria: true,
      status: "ativo",
    };
  })(),
  (() => {
    const meta = ensureChannels("sponsor-roi-critical");
    return {
      id: "15",
      nome: "ROI crítico de patrocinador",
      descricao:
        "Notifica marketing/comercial quando ROI ou CPC de um patrocinador fica fora da meta.",
      gatilho: "ROI < 0,75 cliques/R$ ou CPC > R$ 10",
      canal: meta.labels,
      channels: meta.channels,
      templateId: "sponsor-roi-critical",
      categoria: meta.categoria,
      obrigatoria: false,
      status: "ativo",
    };
  })(),
];
