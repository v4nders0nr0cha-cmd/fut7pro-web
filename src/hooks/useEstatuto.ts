"use client";

import useSWR from "swr";
import type { EstatutoData, EstatutoResponse } from "@/types/estatuto";

const fetcher = async (url: string): Promise<EstatutoResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Falha ao carregar estatuto");
  }
  return res.json();
};

export function useEstatutoPublic(slug?: string) {
  const { data, error, mutate, isLoading } = useSWR<EstatutoResponse>(
    slug ? `/api/public/${slug}/estatuto` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    estatuto: data?.data as EstatutoData | undefined,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useEstatutoAdmin() {
  const { data, error, mutate, isLoading } = useSWR<EstatutoResponse>(
    "/api/admin/estatuto",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const update = async (payload: EstatutoData) => {
    const res = await fetch("/api/admin/estatuto", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: payload }),
    });

    const body = await res.json();
    if (!res.ok) {
      const message = body?.message || body?.error || "Erro ao salvar o estatuto";
      throw new Error(message);
    }

    mutate(body, false);
    return body?.data as EstatutoData;
  };

  return {
    estatuto: data?.data as EstatutoData | undefined,
    isLoading,
    isError: error,
    mutate,
    update,
  };
}
