"use client";
import { useAuth } from "@/hooks/useAuth";
import { usePublicUnreadCount } from "@/hooks/usePublicUnreadCount";

// Tipagem explícita para retorno do hook (amplia para todos os badges)
type ComunicacaoBadge = {
  badge: number; // Notificações (avisos, enquetes, etc)
  badgeMensagem: number; // Mensagens recebidas do admin
  badgeSugestoes: number; // Resposta do admin para sugestões
};

type UseComunicacaoOptions = {
  enabled?: boolean;
};

export function useComunicacao(options: UseComunicacaoOptions = {}): ComunicacaoBadge {
  const { isAuthenticated } = useAuth();
  const enabled = options.enabled ?? true;
  const { unreadCount } = usePublicUnreadCount(isAuthenticated && enabled, 30000);

  return { badge: unreadCount, badgeMensagem: 0, badgeSugestoes: 0 };
}
