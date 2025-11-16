// src/types/automacao.ts
import type { NotificationChannel } from "@/types/notificacao";

export interface AutomacaoNotificacao {
  id: string;
  nome: string;
  descricao: string;
  gatilho: string;
  canal: string[];
  obrigatoria: boolean;
  status: "ativo" | "inativo";
  channels?: NotificationChannel[];
  templateId?: string;
  categoria?: "financeiro" | "engajamento" | "sistema" | "patrocinio";
}
