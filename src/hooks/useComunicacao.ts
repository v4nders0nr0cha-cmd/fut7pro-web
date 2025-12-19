"use client";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";

// Tipagem explícita para retorno do hook (amplia para todos os badges)
type ComunicacaoBadge = {
  badge: number; // Notificações (avisos, enquetes, etc)
  badgeMensagem: number; // Mensagens recebidas do admin
  badgeSugestoes: number; // Resposta do admin para sugestões
};

export function useComunicacao(): ComunicacaoBadge {
  const { isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications({ enabled: isAuthenticated });

  return { badge: unreadCount, badgeMensagem: 0, badgeSugestoes: 0 };
}
