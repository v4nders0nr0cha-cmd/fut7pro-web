import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { buildWebCsp, WEB_SECURITY_HEADERS } from "./src/lib/security/csp";

const ADMIN_AUTH_PUBLIC_PATHS = ["/admin/login", "/admin/register"];
const SUPERADMIN_AUTH_PUBLIC_PATHS = [
  "/superadmin/login",
  "/superadmin/mfa",
  "/superadmin/recuperar-senha",
];

function createNonce() {
  return btoa(crypto.randomUUID()).replace(/=+$/g, "");
}

function applySecurityHeaders(response: NextResponse, csp: string) {
  response.headers.set("Content-Security-Policy", csp);
  for (const { key, value } of WEB_SECURITY_HEADERS) {
    response.headers.set(key, value);
  }
  return response;
}

function isAdminAuthPublicPath(pathname: string) {
  return ADMIN_AUTH_PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isSuperAdminAuthPublicPath(pathname: string) {
  return SUPERADMIN_AUTH_PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function isUserProtectedPath(pathname: string) {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return true;
  if (pathname === "/perfil" || pathname.startsWith("/perfil/")) return true;
  if (pathname === "/minha-conta" || pathname.startsWith("/minha-conta/")) return true;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return !isAdminAuthPublicPath(pathname);
  return false;
}

async function resolveSuperAdminToken(req: NextRequest) {
  const preferredCookie = `next-auth.session-token-superadmin${
    process.env.NODE_ENV === "development" ? "-dev" : ""
  }`;
  const cookieNames = [
    preferredCookie,
    "next-auth.session-token-superadmin",
    "next-auth.session-token-superadmin-dev",
    "__Secure-next-auth.session-token-superadmin",
  ];

  for (const cookieName of cookieNames) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName,
    });
    if (token) return token as any;
  }

  return null;
}

export default withAuth(
  async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const nonce = createNonce();
    const csp = buildWebCsp({ nonce });
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-nonce", nonce);

    const secureNext = () =>
      applySecurityHeaders(
        NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        }),
        csp
      );

    const secureRedirect = (destination: URL) =>
      applySecurityHeaders(NextResponse.redirect(destination), csp);

    // @ts-ignore
    const token = req.nextauth.token as any;

    if (isAdminAuthPublicPath(pathname) || pathname.startsWith("/cadastrar-racha")) {
      return secureNext();
    }

    if (pathname.startsWith("/admin") && token && token.role !== "SUPERADMIN") {
      if (!token.emailVerified) {
        const redirectUrl = new URL("/cadastrar-racha/confirmar-email", req.url);
        if (token.email) {
          redirectUrl.searchParams.set("email", token.email);
        }
        if (token.tenantSlug) {
          redirectUrl.searchParams.set("slug", token.tenantSlug);
        }
        return secureRedirect(redirectUrl);
      }
    }

    if (pathname.startsWith("/superadmin")) {
      const isPublicAuthPath = isSuperAdminAuthPublicPath(pathname);
      const superAdminToken = await resolveSuperAdminToken(req);
      const role = String((superAdminToken as any)?.role || "").toUpperCase();
      const hasAccessToken = Boolean((superAdminToken as any)?.accessToken);
      const tokenError = String((superAdminToken as any)?.error || "").trim();
      const isSuperAdmin = role === "SUPERADMIN" && hasAccessToken && !tokenError;

      if (isPublicAuthPath) {
        if (isSuperAdmin) {
          return secureRedirect(new URL("/superadmin/dashboard", req.url));
        }
        return secureNext();
      }

      if (!isSuperAdmin) {
        const redirectUrl = new URL("/superadmin/login", req.url);
        if (pathname !== "/superadmin/login") {
          redirectUrl.searchParams.set("callbackUrl", pathname);
        }
        return secureRedirect(redirectUrl);
      }
    }

    return secureNext();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (path.startsWith("/superadmin")) {
          // A protecao de superadmin e feita dentro do middleware com cookie dedicado.
          return true;
        }
        if (path.startsWith("/cadastrar-racha")) {
          return true;
        }
        if (isAdminAuthPublicPath(path)) {
          return true;
        }
        if (isUserProtectedPath(path)) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|sitemaps|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map|txt|xml|woff|woff2)$).*)",
  ],
};
