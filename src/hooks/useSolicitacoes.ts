import useSWR from "swr";
import { useApiState } from "./useApiState";
import type { AthleteRequest, AthleteRequestStatus } from "@/types/solicitacao";

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: { "Cache-Control": "no-store" },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = body.error ?? body.message ?? "Falha ao carregar solicitações";
    throw new Error(message);
  }

  return response.json() as Promise<AthleteRequest[] | { count: number }>;
};

export function useSolicitacoes(status?: AthleteRequestStatus | "TODAS") {
  const apiState = useApiState();
  const searchParams = new URLSearchParams();
  if (status && status !== "TODAS") {
    searchParams.set("status", status);
  }

  const key = `/api/admin/solicitacoes${searchParams.toString() ? `?${searchParams}` : ""}`;
  const swr = useSWR<AthleteRequest[]>(key, async (url) => {
    const data = await fetcher(url);
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  });

  const approve = async (id: string) => {
    if (!id) {
      throw new Error("Solicitação inválida.");
    }

    apiState.setLoading(true);
    try {
      const response = await fetch(`/api/admin/solicitacoes/${id}/approve`, {
        method: "PUT",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          errorData.error ?? errorData.message ?? "Erro ao aprovar solicitação. Tente novamente.";
        throw new Error(message);
      }

      await swr.mutate();
      apiState.setSuccess(true);
      return response.json().catch(() => ({}));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao aprovar solicitação. Tente novamente.";
      apiState.setError(message);
      throw new Error(message);
    }
  };

  const reject = async (id: string) => {
    if (!id) {
      throw new Error("Solicitação inválida.");
    }

    apiState.setLoading(true);
    try {
      const response = await fetch(`/api/admin/solicitacoes/${id}/reject`, {
        method: "PUT",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          errorData.error ?? errorData.message ?? "Erro ao rejeitar solicitação. Tente novamente.";
        throw new Error(message);
      }

      await swr.mutate();
      apiState.setSuccess(true);
      return response.json().catch(() => ({}));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao rejeitar solicitação. Tente novamente.";
      apiState.setError(message);
      throw new Error(message);
    }
  };

  const exportCsv = async (statusFilter?: AthleteRequestStatus) => {
    const params = new URLSearchParams();
    if (statusFilter) {
      params.set("status", statusFilter);
    }

    const response = await fetch(
      `/api/admin/solicitacoes/export/csv${params.toString() ? `?${params}` : ""}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ?? errorData.message ?? "Erro ao exportar CSV de solicitações"
      );
    }

    return response.text();
  };

  return {
    solicitacoes: swr.data ?? [],
    isLoading: swr.isLoading || apiState.isLoading,
    isError: !!swr.error || apiState.isError,
    error: swr.error ?? apiState.error,
    mutate: swr.mutate,
    approve,
    reject,
    exportCsv,
    resetState: apiState.reset,
  };
}

export function useSolicitacoesCount(status: AthleteRequestStatus = "PENDENTE") {
  const params = new URLSearchParams({ status, count: "1" });
  return useSWR<{ count: number }>(`/api/admin/solicitacoes?${params}`, async (url) => {
    const data = await fetcher(url);
    if (!Array.isArray(data)) {
      return data;
    }
    return { count: data.length };
  });
}
