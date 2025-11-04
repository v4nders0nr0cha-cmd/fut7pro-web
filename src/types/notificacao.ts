export type NotificationType = "ALERTA" | "SISTEMA" | "PERSONALIZADA";

export interface Notification {
  id: string;
  tenantId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateNotificationInput {
  title: string;
  message: string;
  type: NotificationType;
  tenantId?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateNotificationInput {
  title?: string;
  message?: string;
  type?: NotificationType;
  isRead?: boolean;
  metadata?: Record<string, unknown>;
  tenantId?: string;
}

export type Notificacao = Notification;
export type NotificacaoTipo = NotificationType;
