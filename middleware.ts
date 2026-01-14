import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
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
      if (!token || token.role !== "SUPERADMIN") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
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
