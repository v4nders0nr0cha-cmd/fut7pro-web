export type NotificationType =
  | "system"
  | "superadmin"
  | "mensagem"
  | "pendencia"
  | "financeiro"
  | "alerta"
  | "novidade"
  | "contato"
  | "outros";

export interface Notification {
  id: string;
  rachaSlug: string;
  type: NotificationType;
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  prioridade?: "normal" | "alta";
  remetente?: string; // ex: "SuperAdmin", "Usuário", "Sistema"
  assunto?: string;
  referenciaId?: string; // id relacionado (ex: id da mensagem)
  metadata?: Record<string, unknown>; // dados adicionais específicos do tipo
}

// Interface para criação de notificações
export interface CreateNotificationDto {
  rachaSlug: string;
  type: NotificationType;
  titulo: string;
  mensagem: string;
  prioridade?: "normal" | "alta";
  remetente?: string;
  assunto?: string;
  referenciaId?: string;
  metadata?: Record<string, unknown>;
}

// Interface para atualização de notificações
export interface UpdateNotificationDto {
  lida?: boolean;
  titulo?: string;
  mensagem?: string;
  prioridade?: "normal" | "alta";
  metadata?: Record<string, unknown>;
}
