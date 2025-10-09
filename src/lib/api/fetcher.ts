const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
if (!API_BASE) {
  // Evita erro silencioso em build
  // eslint-disable-next-line no-console
  console.warn("NEXT_PUBLIC_API_URL nao definido.");
}

type ApiFetchOptions = RequestInit & {
  accessToken?: string;
  tenantSlug?: string;
};

export async function apiFetch<T = unknown>(
  path: string,
  { accessToken, tenantSlug, headers, ...rest }: ApiFetchOptions = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
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
