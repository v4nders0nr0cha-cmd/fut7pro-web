import { resolvePublicTenantSlug } from "@/utils/public-links";

function normalizePathname(candidate?: string | null): string | null {
  if (!candidate) return null;
  const trimmed = candidate.trim();
  if (!trimmed) return null;

  let pathname = trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      pathname = new URL(trimmed).pathname;
    } catch {
      return null;
    }
  }

  const clean = pathname.split(/[?#]/)[0] || "";
  if (!clean.startsWith("/")) return null;

  const compact = clean.replace(/\/{2,}/g, "/");
  if (compact === "/") return compact;

  return compact.replace(/\/+$/, "") || "/";
}

export function resolveCanonicalPathForPublicSlug(
  slug: string,
  candidates: Array<string | null | undefined>
) {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) return "/";

  for (const candidate of candidates) {
    const pathname = normalizePathname(candidate);
    if (!pathname) continue;

    const pathSlug = resolvePublicTenantSlug(pathname);
    if (!pathSlug || pathSlug !== normalizedSlug) continue;

    return pathname;
  }

  return `/${normalizedSlug}`;
}
