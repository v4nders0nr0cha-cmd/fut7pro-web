import type { NotificationType, NotificationChannel } from "@/types/notificacao";

export interface NotificationTemplateToken {
  key: string;
  label: string;
  example: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  category: "financeiro" | "engajamento" | "sistema" | "patrocinio";
  type: NotificationType;
  defaultChannels: NotificationChannel[];
  tokens: NotificationTemplateToken[];
  email?: {
    subject: string;
    body: string;
  };
  push?: {
    title: string;
    body: string;
  };
  whatsapp?: {
    message: string;
  };
}

export interface NotificationTemplateGroup {
  category: NotificationTemplate["category"];
  templates: NotificationTemplate[];
}
