import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUPERADMIN_AUTH_PUBLIC_PATHS = [
  "/superadmin/login",
  "/superadmin/mfa",
  "/superadmin/recuperar-senha",
];

function isSuperAdminAuthPublicPath(pathname: string) {
  return SUPERADMIN_AUTH_PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
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
    // @ts-ignore
    const token = req.nextauth.token as any;

    if (
      pathname.startsWith("/admin/login") ||
      pathname.startsWith("/admin/register") ||
      pathname.startsWith("/cadastrar-racha")
    ) {
      return NextResponse.next();
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
        return NextResponse.redirect(redirectUrl);
      }
    }

    if (pathname.startsWith("/superadmin")) {
      const isPublicAuthPath = isSuperAdminAuthPublicPath(pathname);
      const superAdminToken = await resolveSuperAdminToken(req);
      const isSuperAdmin =
        String((superAdminToken as any)?.role || "").toUpperCase() === "SUPERADMIN";

      if (isPublicAuthPath) {
        if (isSuperAdmin) {
          return NextResponse.redirect(new URL("/superadmin/dashboard", req.url));
        }
        return NextResponse.next();
      }

      if (!isSuperAdmin) {
        const redirectUrl = new URL("/superadmin/login", req.url);
        if (pathname !== "/superadmin/login") {
          redirectUrl.searchParams.set("callbackUrl", pathname);
        }
        return NextResponse.redirect(redirectUrl);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (path.startsWith("/superadmin")) {
          // A protecao de superadmin e feita dentro do middleware com cookie dedicado.
          return true;
        }
        if (
          path.startsWith("/admin/login") ||
          path.startsWith("/admin/register") ||
          path.startsWith("/cadastrar-racha")
        ) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/perfil", "/minha-conta", "/admin/:path*", "/superadmin/:path*"],
};
