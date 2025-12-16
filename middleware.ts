import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    // @ts-ignore
    const token = req.nextauth.token as any;

    // Páginas públicas de autenticação/cadastro do admin
    if (
      pathname.startsWith("/admin/login") ||
      pathname.startsWith("/admin/register") ||
      pathname.startsWith("/cadastrar-racha")
    ) {
      return NextResponse.next();
    }

    // Bloquear /superadmin para quem não for SUPERADMIN
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
