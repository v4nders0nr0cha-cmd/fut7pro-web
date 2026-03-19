import useSWR from "swr";
import type { AboutResponse, AboutData } from "@/types/about";

const ABOUT_TIMEOUT_MS = 12000;

const fetcher = async (url: string): Promise<AboutResponse> => {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), ABOUT_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });
    const text = await res.text();
    let body: unknown = text;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    if (!res.ok) {
      const message =
        (body as { message?: string; error?: string } | null)?.message ||
        (body as { message?: string; error?: string } | null)?.error ||
        (typeof body === "string" ? body : "") ||
        "Falha ao carregar dados do racha";
      throw new Error(message);
    }

    return (body as AboutResponse) ?? ({} as AboutResponse);
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") {
      throw new Error("Tempo limite ao carregar dados do racha.");
    }
    throw cause;
  } finally {
    globalThis.clearTimeout(timeout);
  }
};

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

export function useAboutAdmin(options?: { enabled?: boolean }) {
  const enabled = options?.enabled !== false;
  const { data, error, mutate, isLoading } = useSWR(enabled ? `/api/admin/about` : null, fetcher, {
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
