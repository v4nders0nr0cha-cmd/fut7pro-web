import useSWR from "swr";
import type { FooterConfig, FooterConfigResponse } from "@/types/footer";

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json()) as Promise<FooterConfigResponse>;

type FooterHookOptions = {
  enabled?: boolean;
};

export function useFooterConfigPublic(slug?: string, options: FooterHookOptions = {}) {
  const enabled = options.enabled ?? true;
  const key = enabled && slug ? `/api/public/${slug}/footer` : null;
  const { data, error, mutate, isLoading } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 30000,
  });

  return {
    footer: data?.data as FooterConfig | undefined,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useFooterConfigAdmin(options: FooterHookOptions = {}) {
  const enabled = options.enabled ?? true;
  const key = enabled ? `/api/admin/footer` : null;
  const { data, error, mutate, isLoading } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 30000,
  });

  const update = async (next: FooterConfig) => {
    const res = await fetch(`/api/admin/footer`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: next }),
    });
    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.message || "Erro ao salvar");
    }
    mutate(body, false);
    return body.data as FooterConfig;
  };

  return {
    footer: data?.data as FooterConfig | undefined,
    isLoading,
    isError: error,
    mutate,
    update,
  };
}
