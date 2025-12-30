import useSWR from "swr";
import type { FooterConfig, FooterConfigResponse } from "@/types/footer";

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json()) as Promise<FooterConfigResponse>;

export function useFooterConfigPublic(slug?: string) {
  const { data, error, mutate, isLoading } = useSWR(
    slug ? `/api/public/${slug}/footer` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
    }
  );

  return {
    footer: data?.data as FooterConfig | undefined,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useFooterConfigAdmin() {
  const { data, error, mutate, isLoading } = useSWR(`/api/admin/footer`, fetcher, {
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
