export type NotificationType = "ALERTA" | "SISTEMA" | "PERSONALIZADA";

export type NotificationChannel = "EMAIL" | "PUSH" | "WHATSAPP";

export interface NotificationMetadata {
  templateId?: string;
  channels?: NotificationChannel[];
  email?: {
    subject?: string;
    body?: string;
  };
  push?: {
    title?: string;
    body?: string;
  };
  whatsapp?: {
    message?: string;
  };
  tokens?: Record<string, string>;
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  tenantId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
  metadata?: NotificationMetadata;
}

export interface CreateNotificationInput {
  title: string;
  message: string;
  type: NotificationType;
  tenantId?: string;
  metadata?: NotificationMetadata;
}

export interface UpdateNotificationInput {
  title?: string;
  message?: string;
  type?: NotificationType;
  isRead?: boolean;
  metadata?: NotificationMetadata;
  tenantId?: string;
}

export type Notificacao = Notification;
export type NotificacaoTipo = NotificationType;

export interface NotificationAnalyticsTotals {
  sent: number;
  read: number;
  unread: number;
  manual: number;
  automations: number;
  channels: {
    email: number;
    push: number;
    whatsapp: number;
    badge: number;
  };
}

export interface NotificationAnalytics {
  period: {
    start: string;
    end: string;
    days: number;
  };
  totals: NotificationAnalyticsTotals;
  types: Array<{ type: NotificationType; count: number }>;
  audiences: Array<{ label: string; count: number }>;
  trend: Array<{ bucket: string; sent: number; read: number }>;
  latest: Array<{
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    channels: NotificationChannel[] | null;
    isRead: boolean;
    createdAt: string;
    templateId?: string | null;
    automationId?: string | null;
  }>;
  sampleSize: number;
}
