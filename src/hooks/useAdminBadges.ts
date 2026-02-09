"use client";
import useSWR from "swr";
import { useAdminNotifications } from "./useAdminNotifications";

// Tipos dos badges por item do menu
type Badges = {
  dashboard: number;
  notificacoes: number;
  mensagens: number;
  solicitacoes: number;
  perfil: number;
};

const emptyBadges: Badges = {
  dashboard: 0,
  notificacoes: 0,
  mensagens: 0,
  solicitacoes: 0,
  perfil: 0,
};

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return null;
  }
  return res.json();
};

export function useAdminBadges() {
  const { unreadCount: notificationsCount } = useAdminNotifications({
    includeList: false,
    refreshInterval: 30000,
  });

  const { data } = useSWR<{ count?: number }>(
    "/api/admin/solicitacoes?status=PENDENTE&count=1",
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: false,
    }
  );

  const solicitacoes = typeof data?.count === "number" ? data.count : 0;
  const badges: Badges = {
    ...emptyBadges,
    notificacoes: notificationsCount,
    solicitacoes,
  };
  return { badges };
}
