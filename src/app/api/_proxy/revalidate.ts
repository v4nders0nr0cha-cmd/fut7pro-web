const REVALIDATE_TOKEN = process.env.PUBLIC_REVALIDATE_TOKEN || "";
let warnedMissingToken = false;
let warnedApiHost = false;

function normalizeUrl(raw?: string | null) {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProtocol = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/$/, "");
}

function looksLikeApiHost(url: string) {
  const normalized = url.toLowerCase();
  if (normalized.includes("api.fut7pro.com.br")) return true;
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.toLowerCase();
  if (apiBase && normalized.startsWith(apiBase)) return true;
  return normalized.includes("api.");
}

function getBaseUrl() {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.APP_URL,
    process.env.VERCEL_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL,
  ]
    .map(normalizeUrl)
    .filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (looksLikeApiHost(candidate)) {
      if (!warnedApiHost) {
        console.warn(
          "APP_URL/NEXT_PUBLIC_APP_URL apontam para o backend; ajuste o host do app para evitar 401 no revalidate"
        );
        warnedApiHost = true;
      }
      continue;
    }
    return candidate;
  }

  const port = process.env.PORT || "3000";
  return `http://localhost:${port}`;
}

export function buildTorneioPaths(slug?: string | null, torneioSlug?: string | null) {
  if (!slug) return [];
  const base = `/${slug}/grandes-torneios`;
  const paths = [base];
  if (torneioSlug) {
    paths.push(`${base}/${torneioSlug}`);
  }
  return paths;
}

export function buildSorteioPaths(slug?: string | null) {
  if (!slug) return [];
  return [`/${slug}/partidas`, `/${slug}/partidas/historico`, `/${slug}/partidas/times-do-dia`];
}

export function buildEstatutoPaths(slug?: string | null) {
  if (!slug) return ["/sobre-nos/estatuto"];
  return [`/${slug}/sobre-nos/estatuto`, "/sobre-nos/estatuto"];
}

export function buildContatosPaths(slug?: string | null) {
  if (!slug) return ["/sobre-nos/contatos"];
  return [`/${slug}/sobre-nos/contatos`, "/sobre-nos/contatos"];
}

export function buildSponsorPaths(slug?: string | null) {
  if (!slug) return [];
  return [`/${slug}/sobre-nos`, `/${slug}/sobre-nos/nossos-parceiros`];
}

export async function triggerPublicRevalidate(slug?: string | null, paths: string[] = []) {
  if (!slug) return;

  const target = `${getBaseUrl()}/api/revalidate/public`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (REVALIDATE_TOKEN) {
    headers["x-revalidate-token"] = REVALIDATE_TOKEN;
  } else if (!warnedMissingToken && process.env.NODE_ENV === "production") {
    console.warn(
      "PUBLIC_REVALIDATE_TOKEN ausente; /api/revalidate/public fica sem protecao e pode responder 401 em staging/prod"
    );
    warnedMissingToken = true;
  }

  try {
    const res = await fetch(target, {
      method: "POST",
      headers,
      body: JSON.stringify({ slug, paths }),
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("Revalidate publico falhou", { status: res.status, body, target, slug, paths });
    }
  } catch (error) {
    console.error("Falha ao disparar revalidate publico", error);
  }
}
