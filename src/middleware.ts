import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolvePublicTenantSlug } from "@/utils/public-links";

const ACTIVE_TENANT_COOKIE = "fut7pro_active_tenant";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Não mexa em headers de cache das APIs
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(req.headers);
  const publicSlug = resolvePublicTenantSlug(pathname);
  if (publicSlug) {
    requestHeaders.set("x-public-tenant-slug", publicSlug);
  }

  const adminMatch = pathname.match(/^\/([^/]+)\/admin(\/.*)?$/);
  const adminSlug = adminMatch && publicSlug ? publicSlug : null;
  const adminSuffix = adminMatch?.[2] || "";

  const res = adminSlug
    ? NextResponse.rewrite(new URL(`/admin${adminSuffix}`, req.url), {
        request: {
          headers: requestHeaders,
        },
      })
    : NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

  if (adminSlug) {
    res.cookies.set(ACTIVE_TENANT_COOKIE, adminSlug, {
      path: "/",
      sameSite: "lax",
    });
  }

  // Aplicar X-Robots-Tag apenas em rotas privadas (não em APIs públicas)
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/superadmin") ||
    (adminSlug && adminMatch)
  ) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  // Cache para páginas (não-API) - só se não for API
  res.headers.set("Cache-Control", "public, max-age=0, must-revalidate");

  return res;
}

// reduz custo: não roda em _next/static, imagens, favicon, robots, sitemap
// IMPORTANTE: excluir APIs para não interferir nos headers de cache
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api).*)"],
};
