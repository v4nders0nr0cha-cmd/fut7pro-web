// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { safeCallbackUrl } from "@/lib/url";

/** Verifica existência do cookie de sessão do NextAuth (http/https). */
function hasNextAuthSession(req: NextRequest): boolean {
  return Boolean(
    req.cookies.get("__Secure-next-auth.session-token")?.value ||
      req.cookies.get("next-auth.session-token")?.value
  );
}

/** Extrai o slug do tenant a partir de /rachas/:slug */
function extractTenantSlug(pathname: string): string | null {
  const m = pathname.match(/^\/rachas\/([^\/\?#]+)/i);
  return m ? decodeURIComponent(m[1]) : null;
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 0) Nunca tocar em APIs
  if (pathname.startsWith("/api")) return NextResponse.next();

  // Flags de área/admin e páginas de login (evita loop)
  const isAdmin = pathname.startsWith("/admin");
  const isSuper = pathname.startsWith("/superadmin");
  const isAdminLogin = /^\/admin\/login(?:\/|$)?/.test(pathname);
  const isAdminRegister = /^\/admin\/register(?:\/|$)?/.test(pathname);
  const isAdminRecover = /^\/admin\/recuperar(?:\/|$)?/.test(pathname);
  const isSuperLogin = /^\/superadmin\/login(?:\/|$)?/.test(pathname);

  // 1) Guard de autenticação (NÃO proteger as próprias páginas de login)
  const needAdminGuard = isAdmin && !isAdminLogin && !isAdminRegister && !isAdminRecover;
  const needSuperGuard = isSuper && !isSuperLogin;

  if ((needAdminGuard || needSuperGuard) && !hasNextAuthSession(req)) {
    const fallbackPath = needSuperGuard ? "/superadmin" : "/admin";
    const loginPath = needSuperGuard ? "/superadmin/login" : "/admin/login";

    // callback alvo sanitizado (mesma origem ou relativo)
    const rawTarget = `${pathname}${search}`;
    const callbackTarget = safeCallbackUrl(rawTarget, fallbackPath, req.nextUrl.origin);

    const loginUrl = new URL(loginPath, req.url);
    // anexa callback apenas uma vez e somente se diferente do fallback
    if (!loginUrl.searchParams.has("callbackUrl") && callbackTarget !== fallbackPath) {
      loginUrl.searchParams.set("callbackUrl", callbackTarget);
    }
    return NextResponse.redirect(loginUrl);
  }

  const res = NextResponse.next();

  // 2) Persistir tenantSlug ao navegar em /rachas/:slug
  const slug = extractTenantSlug(pathname);
  if (slug) {
    res.cookies.set("tenantSlug", slug, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: req.nextUrl.protocol === "https:",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });
  }

  // 3) SEO e cache para páginas (não-API)
  if (isAdmin || isSuper) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  res.headers.set("Cache-Control", "public, max-age=0, must-revalidate");

  return res;
}

// Reduz custo: não roda em estáticos, imagens, favicon, robots, sitemap e APIs
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api).*)"],
};
