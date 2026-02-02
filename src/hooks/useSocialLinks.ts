import useSWR from "swr";
import type { SocialLinksConfig, SocialLinksResponse } from "@/types/social-links";

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json()) as Promise<SocialLinksResponse>;

type SocialLinksHookOptions = {
  enabled?: boolean;
};

export function useSocialLinksPublic(slug?: string, options: SocialLinksHookOptions = {}) {
  const enabled = options.enabled ?? true;
  const key = enabled && slug ? `/api/public/${slug}/redes-sociais` : null;
  const { data, error, mutate, isLoading } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 30000,
  });

  return {
    socialLinks: data?.data as SocialLinksConfig | undefined,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useSocialLinksAdmin(options: SocialLinksHookOptions = {}) {
  const enabled = options.enabled ?? true;
  const key = enabled ? `/api/admin/redes-sociais` : null;
  const { data, error, mutate, isLoading } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 30000,
  });

  const update = async (next: SocialLinksConfig) => {
    const res = await fetch(`/api/admin/redes-sociais`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: next }),
    });
    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.message || "Erro ao salvar");
    }
    mutate(body, false);
    return body.data as SocialLinksConfig;
  };

  return {
    socialLinks: data?.data as SocialLinksConfig | undefined,
    isLoading,
    isError: error,
    mutate,
    update,
  };
}
