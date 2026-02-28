import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
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

const SUPERADMIN_PUBLIC_AUTH_PATHS = [
  "/superadmin/login",
  "/superadmin/mfa",
  "/superadmin/recuperar-senha",
];

const SUPERADMIN_SESSION_COOKIE_NAMES = [
  "next-auth.session-token-superadmin",
  "__Secure-next-auth.session-token-superadmin",
  "next-auth.session-token-superadmin-dev",
  "__Secure-next-auth.session-token-superadmin-dev",
];

function isLegacySuperAdminPath(pathname: string) {
  return SUPERADMIN_LEGACY_PATHS.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isSuperAdminPublicAuthPath(pathname: string) {
  return SUPERADMIN_PUBLIC_AUTH_PATHS.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function shouldProtectSuperAdminPath(pathname: string) {
  return pathname.startsWith("/superadmin") && !isSuperAdminPublicAuthPath(pathname);
}

async function resolveSuperAdminToken(req: NextRequest) {
  for (const cookieName of SUPERADMIN_SESSION_COOKIE_NAMES) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName,
    });
    if (token) {
      return token;
    }
  }

  return getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
}

export async function middleware(req: NextRequest) {
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

  if (shouldProtectSuperAdminPath(pathname)) {
    const token = await resolveSuperAdminToken(req);
    const role = String((token as { role?: string } | null)?.role || "").toUpperCase();

    if (!token || role !== "SUPERADMIN") {
      const loginUrl = new URL("/superadmin/login", req.url);
      const nextPath = `${pathname}${req.nextUrl.search || ""}`;
      if (nextPath && nextPath !== "/superadmin/login") {
        loginUrl.searchParams.set("next", nextPath);
      }
      return NextResponse.redirect(loginUrl);
    }
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
