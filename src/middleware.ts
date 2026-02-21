import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolvePublicTenantSlug } from "@/utils/public-links";
import { isSuperAdminLegacyEnabled } from "@/lib/feature-flags";

const SUPERADMIN_LEGACY_PATHS = [
  "/superadmin/automacoes",
  "/superadmin/logs",
  "/superadmin/marketing",
  "/superadmin/monitoramento",
  "/superadmin/metricas/localizacao",
  "/superadmin/integracoes",
  "/superadmin/comunicacao/ajuda",
  "/superadmin/comunicacao/sugestoes",
];

function isLegacySuperAdminPath(pathname: string) {
  return SUPERADMIN_LEGACY_PATHS.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isSuperAdminLegacyEnabled() && isLegacySuperAdminPath(pathname)) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  // Não mexa em headers de cache das APIs
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const adminMatch = pathname.match(/^\/([^/]+)\/admin(\/.*)?$/);
  if (adminMatch) {
    const redirectUrl = new URL("/admin/selecionar-racha", req.url);
    redirectUrl.search = req.nextUrl.search;
    return NextResponse.redirect(redirectUrl, 308);
  }

  const requestHeaders = new Headers(req.headers);
  const publicSlug = resolvePublicTenantSlug(pathname);
  if (publicSlug) {
    requestHeaders.set("x-public-tenant-slug", publicSlug);
  }

  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Aplicar X-Robots-Tag apenas em rotas privadas (não em APIs públicas)
  if (pathname.startsWith("/admin") || pathname.startsWith("/superadmin") || adminMatch) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  // Cache para páginas (não-API) - só se não for API
  res.headers.set("Cache-Control", "public, max-age=0, must-revalidate");

  return res;
}

// reduz custo: não roda em _next/static, imagens, favicon, robots, sitemap
// IMPORTANTE: excluir APIs para não interferir nos headers de cache
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|sitemaps|api).*)"],
};
