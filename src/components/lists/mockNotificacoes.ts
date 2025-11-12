import type { Notification } from "@/types/notificacao";

export const mockNotificacoes: Notification[] = [
  {
    id: "notif-1",
    tenantId: "mock-tenant",
    type: "SISTEMA",
    title: "Atualizacao no Fut7Pro",
    message: "Aplicamos melhorias no painel admin e correcoes nos relatorios.",
    createdAt: "2025-06-15T09:00:00Z",
    isRead: false,
  },
  {
    id: "notif-2",
    tenantId: "mock-tenant",
    type: "ALERTA",
    title: "Cobranca automatica mensal",
    message: "Lembrete: a fatura do plano Fut7Pro vence em 3 dias.",
    createdAt: "2025-06-10T10:00:00Z",
    isRead: true,
  },
  {
    id: "notif-3",
    tenantId: "mock-tenant",
    type: "PERSONALIZADA",
    title: "Boas-vindas ao novo presidente",
    message: "Lucas Rocha assumiu como administrador do Racha Falcoes.",
    createdAt: "2025-06-08T08:30:00Z",
    isRead: false,
  },
  {
    id: "notif-4",
    tenantId: "mock-tenant",
    type: "PERSONALIZADA",
    title: "Recorde de assiduidade!",
    message: "Parabens! O seu racha bateu recorde de presenca no ultimo mes.",
    createdAt: "2025-06-05T11:20:00Z",
    isRead: true,
  },
  {
    id: "notif-5",
    tenantId: "mock-tenant",
    type: "PERSONALIZADA",
    title: "Semana do Futebol: Planos com 10% OFF",
    message: "Aproveite a campanha especial para indicar novos rachas.",
    createdAt: "2025-06-01T13:00:00Z",
    isRead: false,
  },
];
