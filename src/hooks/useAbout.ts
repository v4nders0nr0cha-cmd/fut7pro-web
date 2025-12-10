import useSWR from "swr";
import type { AboutResponse, AboutData } from "@/types/about";

const fetcher = (url: string) => fetch(url).then((res) => res.json()) as Promise<AboutResponse>;

export function useAboutPublic(slug?: string) {
  const { data, error, mutate, isLoading } = useSWR(
    slug ? `/api/public/${slug}/about` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
    }
  );

  return {
    about: data?.data as AboutData | undefined,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useAboutAdmin() {
  const { data, error, mutate, isLoading } = useSWR(`/api/admin/about`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 30000,
  });

  const update = async (next: AboutData) => {
    const res = await fetch(`/api/admin/about`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: next }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body?.message || "Erro ao salvar");
    mutate(body, false);
    return body.data as AboutData;
  };

  return {
    about: data?.data as AboutData | undefined,
    isLoading,
    isError: error,
    mutate,
    update,
  };
}
