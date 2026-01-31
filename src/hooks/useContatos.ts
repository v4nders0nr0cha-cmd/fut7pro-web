import useSWR from "swr";
import type { ContatosConfig, ContatosConfigResponse } from "@/types/contatos";

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json()) as Promise<ContatosConfigResponse>;

type ContatosHookOptions = {
  enabled?: boolean;
};

export function useContatosPublic(slug?: string, options: ContatosHookOptions = {}) {
  const enabled = options.enabled ?? true;
  const key = enabled && slug ? `/api/public/${slug}/contatos` : null;
  const { data, error, mutate, isLoading } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 30000,
  });

  return {
    contatos: data?.data as ContatosConfig | undefined,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useContatosAdmin(options: ContatosHookOptions = {}) {
  const enabled = options.enabled ?? true;
  const key = enabled ? `/api/admin/contatos` : null;
  const { data, error, mutate, isLoading } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 30000,
  });

  const update = async (next: ContatosConfig) => {
    const res = await fetch(`/api/admin/contatos`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: next }),
    });
    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.message || "Erro ao salvar");
    }
    mutate(body, false);
    return body.data as ContatosConfig;
  };

  return {
    contatos: data?.data as ContatosConfig | undefined,
    isLoading,
    isError: error,
    mutate,
    update,
  };
}
