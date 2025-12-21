"use client";

import useSWR from "swr";
import { useApiState } from "@/hooks/useApiState";
import type {
  NotificationCampaign,
  NotificationCampaignPreview,
  NotificationCampaignRecipient,
} from "@/types/notification-campaign";

type CampaignFilters = {
  search?: string;
  status?: string;
  destination?: string;
  category?: string;
};

type CampaignPreviewPayload = {
  destination: string;
  newTenantDays?: number;
};

type CampaignCreatePayload = {
  title: string;
  message: string;
  category?: string;
  destination: string;
  priority?: string;
  channels?: string[];
  badge?: boolean;
  ctaLabel?: string;
  ctaUrl?: string;
  expiresAt?: string;
  newTenantDays?: number;
};

type CampaignTestPayload = {
  tenantId?: string;
  tenantSlug?: string;
  title?: string;
  message?: string;
  category?: string;
  channels?: string[];
  badge?: boolean;
  ctaLabel?: string;
  ctaUrl?: string;
  expiresAt?: string;
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erro ao carregar campanhas");
  }
  return response.json();
};

const buildKey = (filters: CampaignFilters) => {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.destination) params.set("destination", filters.destination);
  if (filters.category) params.set("category", filters.category);
  const query = params.toString();
  return `/api/superadmin/notificacoes${query ? `?${query}` : ""}`;
};

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  const text = await response.text();
  let body: any = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message = body?.message || body?.error || response.statusText;
    throw new Error(message || "Erro desconhecido");
  }

  return body as T;
};

export function useSuperAdminNotificationCampaigns(filters: CampaignFilters = {}) {
  const apiState = useApiState();

  const { data, error, isLoading, mutate } = useSWR<NotificationCampaign[]>(
    buildKey(filters),
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const previewCampaign = async (payload: CampaignPreviewPayload) => {
    return apiState.handleAsync(async () => {
      return await requestJson<NotificationCampaignPreview>(
        "/api/superadmin/notificacoes/preview",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
    });
  };

  const createCampaign = async (payload: CampaignCreatePayload) => {
    return apiState.handleAsync(async () => {
      const result = await requestJson<NotificationCampaign>("/api/superadmin/notificacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await mutate();
      return result;
    });
  };

  const sendTestCampaign = async (payload: CampaignTestPayload) => {
    return apiState.handleAsync(async () => {
      return await requestJson<{ ok: boolean }>("/api/superadmin/notificacoes/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    });
  };

  const getCampaign = async (id: string) => {
    return apiState.handleAsync(async () => {
      return await requestJson<NotificationCampaign>(`/api/superadmin/notificacoes/${id}`, {
        method: "GET",
      });
    });
  };

  const getRecipients = async (id: string) => {
    return apiState.handleAsync(async () => {
      return await requestJson<{
        totalTenants: number;
        recipients: NotificationCampaignRecipient[];
      }>(`/api/superadmin/notificacoes/${id}/recipients`, { method: "GET" });
    });
  };

  const resendCampaign = async (id: string) => {
    return apiState.handleAsync(async () => {
      const result = await requestJson<{ ok: boolean }>(
        `/api/superadmin/notificacoes/${id}/resend`,
        {
          method: "POST",
        }
      );
      await mutate();
      return result;
    });
  };

  const cancelCampaign = async (id: string) => {
    return apiState.handleAsync(async () => {
      const result = await requestJson<NotificationCampaign>(
        `/api/superadmin/notificacoes/${id}/cancel`,
        {
          method: "POST",
        }
      );
      await mutate();
      return result;
    });
  };

  return {
    campaigns: data || [],
    isLoading: isLoading || apiState.isLoading,
    isError: !!error || apiState.isError,
    error: apiState.error || (error instanceof Error ? error.message : null),
    previewCampaign,
    createCampaign,
    sendTestCampaign,
    getCampaign,
    getRecipients,
    resendCampaign,
    cancelCampaign,
    mutate,
    reset: apiState.reset,
  };
}
