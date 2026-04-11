const PUBLIC_PATH_HEADER_CANDIDATES = [
  "x-fut7pro-pathname",
  "x-forwarded-uri",
  "x-next-url",
  "x-pathname",
  "x-matched-path",
  "x-nextjs-matched-path",
  "x-invoke-path",
] as const;

function normalizePathnameCandidate(value?: string | null): string | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  let pathname = trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      pathname = new URL(trimmed).pathname;
    } catch {
      pathname = trimmed;
    }
  }

  const withoutQuery = pathname.split("?")[0]?.split("#")[0] ?? "";
  const normalized = withoutQuery
    .trim()
    .replace(/\/{2,}/g, "/")
    .replace(/\/+$/, "");

  if (!normalized) return "/";
  return normalized.startsWith("/") ? normalized.toLowerCase() : `/${normalized.toLowerCase()}`;
}

function resolvePathnameFromHeaders(hdrs: { get(name: string): string | null }): string | null {
  for (const headerName of PUBLIC_PATH_HEADER_CANDIDATES) {
    const candidate = normalizePathnameCandidate(hdrs.get(headerName));
    if (candidate) return candidate;
  }
  return null;
}

function isPrestacaoDeContasPathForSlug(pathname: string | null, slug: string): boolean {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) return false;
  const normalizedPathname = normalizePathnameCandidate(pathname);
  if (!normalizedPathname) return false;
  return normalizedPathname === `/${normalizedSlug}/sobre-nos/prestacao-de-contas`;
}

export {
  isPrestacaoDeContasPathForSlug,
  normalizePathnameCandidate,
  resolvePathnameFromHeaders,
  PUBLIC_PATH_HEADER_CANDIDATES,
};
