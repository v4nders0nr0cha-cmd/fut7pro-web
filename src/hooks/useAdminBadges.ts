"use client";
import useSWR from "swr";
import { useAdminNotifications } from "./useAdminNotifications";
import { useRacha } from "@/context/RachaContext";
import { ENTRY_REQUEST_COUNT_URL, MONTHLY_REQUEST_COUNT_URL } from "@/lib/admin-request-badges";

// Tipos dos badges por item do menu
type Badges = {
  dashboard: number;
  notificacoes: number;
  mensagens: number;
  solicitacoes: number | null;
  perfil: number;
};

const emptyBadges: Badges = {
  dashboard: 0,
  notificacoes: 0,
  mensagens: 0,
  solicitacoes: null,
  perfil: 0,
};

const fetcher = async ([url]: [string, string]) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Não foi possível carregar as solicitações.");
  return res.json();
};

export function useAdminBadges() {
  const { tenantSlug } = useRacha();
  const { unreadCount: notificationsCount } = useAdminNotifications({
    includeList: false,
    refreshInterval: 60000,
  });

  const { data: entryData, error: entryError } = useSWR<{ count?: number }>(
    tenantSlug ? [ENTRY_REQUEST_COUNT_URL, tenantSlug] : null,
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
      refreshWhenHidden: false,
      dedupingInterval: 10000,
    }
  );

  const { data: monthlyData, error: monthlyError } = useSWR<{ total?: number }>(
    tenantSlug ? [MONTHLY_REQUEST_COUNT_URL, tenantSlug] : null,
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
      refreshWhenHidden: false,
      dedupingInterval: 10000,
    }
  );

  const solicitacoes =
    !entryError &&
    !monthlyError &&
    typeof entryData?.count === "number" &&
    typeof monthlyData?.total === "number"
      ? entryData.count + monthlyData.total
      : null;
  const badges: Badges = {
    ...emptyBadges,
    notificacoes: notificationsCount,
    solicitacoes,
  };
  return {
    badges,
    monthlyPending:
      !monthlyError && typeof monthlyData?.total === "number" ? monthlyData.total : null,
    monthlyLoading: !monthlyError && !monthlyData,
  };
}
