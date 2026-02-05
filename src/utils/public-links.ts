const PUBLIC_ROUTE_SEGMENTS = new Set([
  "atletas",
  "aguardando-aprovacao",
  "comunicacao",
  "contato",
  "estatisticas",
  "grandes-torneios",
  "entrar",
  "login",
  "os-campeoes",
  "partidas",
  "perfil",
  "privacidade",
  "register",
  "sobre-nos",
  "sorteio-inteligente",
  "termos",
]);

const SYSTEM_SEGMENTS = new Set([
  "admin",
  "superadmin",
  "superadmin-auth",
  "api",
  "auth",
  "public",
  "images",
  "img",
  "static",
  "assets",
  "favicon",
  "robots",
  "sitemap",
  "manifest",
  "_next",
  "health",
  "revalidate",
  "app",
  "www",
  "cadastrar-racha",
]);

const NON_SLUG_SEGMENTS = new Set([...PUBLIC_ROUTE_SEGMENTS, ...SYSTEM_SEGMENTS]);

function splitHref(href: string) {
  const hashIndex = href.indexOf("#");
  const queryIndex = href.indexOf("?");
  const cutIndex =
    hashIndex === -1 ? queryIndex : queryIndex === -1 ? hashIndex : Math.min(hashIndex, queryIndex);

  if (cutIndex === -1) return { path: href, suffix: "" };
  return { path: href.slice(0, cutIndex), suffix: href.slice(cutIndex) };
}

function isExternalHref(href: string) {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("data:") ||
    href.startsWith("blob:")
  );
}

export function resolvePublicTenantSlug(pathname?: string | null) {
  if (!pathname) return null;
  const cleanPath = pathname.split(/[?#]/)[0] || "";
  const trimmed = cleanPath.replace(/^\/+|\/+$/g, "");
  if (!trimmed) return null;

  const firstSegment = trimmed.split("/")[0];
  if (!firstSegment) return null;
  if (firstSegment.startsWith("_") || firstSegment.includes(".")) return null;

  const normalized = firstSegment.toLowerCase();
  if (NON_SLUG_SEGMENTS.has(normalized)) return null;

  return normalized;
}

export function buildPublicHref(href: string, slug?: string | null) {
  if (!href) return href;
  if (isExternalHref(href) || href.startsWith("#") || href.startsWith("?")) return href;
  if (!href.startsWith("/")) return href;

  const safeSlug = slug?.trim();
  if (!safeSlug) return href;

  const { path, suffix } = splitHref(href);
  if (!path || path === "/") return `/${safeSlug}${suffix}`;

  const trimmed = path.replace(/^\/+/, "");
  const firstSegment = trimmed.split("/")[0]?.toLowerCase() || "";

  if (
    !firstSegment ||
    firstSegment.startsWith("_") ||
    firstSegment.includes(".") ||
    SYSTEM_SEGMENTS.has(firstSegment)
  ) {
    return href;
  }

  if (firstSegment === safeSlug.toLowerCase()) return href;

  if (!PUBLIC_ROUTE_SEGMENTS.has(firstSegment)) {
    return href;
  }

  return `/${safeSlug}${path}${suffix}`;
}
