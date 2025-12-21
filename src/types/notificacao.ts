export type NotificationType =
  | "system"
  | "superadmin"
  | "mensagem"
  | "pendencia"
  | "financeiro"
  | "alerta"
  | "novidade"
  | "contato"
  | "outros"
  | "ALERTA"
  | "SISTEMA"
  | "PERSONALIZADA"
  | string;

export interface Notification {
  id: string;
  title?: string;
  message?: string;
  rachaSlug: string;
  type: NotificationType;
  channels?: string[];
  isRead?: boolean;
  createdAt?: string;
  updatedAt?: string;
  templateId?: string | null;
  automationId?: string | null;
  campaignId?: string | null;
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  prioridade?: "normal" | "alta";
  expiresAt?: string;
  cta?: { label?: string; url?: string };
  remetente?: string; // ex: "SuperAdmin", "Usuário", "Sistema"
  assunto?: string;
  referenciaId?: string; // id relacionado (ex: id da mensagem)
  metadata?: Record<string, unknown>; // dados adicionais específicos do tipo
  // aliases legados para compatibilidade com telas antigas
  tipo?: string; // alias para type/categoria
  destino?: string;
  status?: string;
  enviadoPor?: string;
}

// Aliases em português para compatibilidade
export type NotificacaoTipo = NotificationType;
export type Notificacao = Notification;

// Interface para criação de notificações
export interface CreateNotificationDto {
  rachaSlug: string;
  type: NotificationType;
  titulo: string;
  mensagem: string;
  title?: string;
  message?: string;
  channels?: string[];
  templateId?: string;
  automationId?: string;
  prioridade?: "normal" | "alta";
  remetente?: string;
  assunto?: string;
  referenciaId?: string;
  metadata?: Record<string, unknown>;
  isRead?: boolean;
}

// Interface para atualização de notificações
export interface UpdateNotificationDto {
  lida?: boolean;
  titulo?: string;
  mensagem?: string;
  isRead?: boolean;
  title?: string;
  message?: string;
  prioridade?: "normal" | "alta";
  metadata?: Record<string, unknown>;
}
