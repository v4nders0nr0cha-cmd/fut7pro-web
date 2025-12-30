"use client";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";

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
  const { unreadCount } = useNotifications({
    enabled: isAuthenticated && enabled,
    refreshInterval: 30000,
  });

  return { badge: unreadCount, badgeMensagem: 0, badgeSugestoes: 0 };
}
