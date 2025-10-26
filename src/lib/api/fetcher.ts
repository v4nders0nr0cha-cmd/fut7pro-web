import { getBrowserApiBase, getServerApiBase } from "@/config/env";

type ApiFetchOptions = RequestInit & {
  accessToken?: string;
  tenantSlug?: string;
};

export async function apiFetch<T = unknown>(
  path: string,
  { accessToken, tenantSlug, headers, ...rest }: ApiFetchOptions = {}
): Promise<T> {
  const base = typeof window === "undefined" ? getServerApiBase() : getBrowserApiBase();
  if (!base) {
    throw new Error("API base URL não definido. Configure NEXT_PUBLIC_API_URL e API_URL.");
  }
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const h = new Headers(headers ?? {});
  h.set("Accept", "application/json");
  if (!h.has("Content-Type") && rest.body && !(rest.body instanceof FormData)) {
    h.set("Content-Type", "application/json");
  }
  if (accessToken) h.set("Authorization", `Bearer ${accessToken}`);
  if (tenantSlug) h.set("x-tenant-slug", tenantSlug);

  const res = await fetch(url, { ...rest, headers: h, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    try {
      const json = text ? JSON.parse(text) : null;
      throw new Error(json?.message || json?.error || res.statusText);
    } catch {
      throw new Error(text || res.statusText);
    }
  }
  // tenta JSON, senao retorna vazio
  try {
    return (await res.json()) as T;
  } catch {
    return undefined as unknown as T;
  }
}
