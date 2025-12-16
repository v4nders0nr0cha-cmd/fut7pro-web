// middleware.ts

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    // @ts-ignore
    const token = req.nextauth.token as any; // Token tipado por NextAuth

    // Liberar páginas públicas de autenticação/cadastro do admin
    if (pathname.startsWith("/admin/login") || pathname.startsWith("/admin/register")) {
      return NextResponse.next();
    }

    // Bloquear acesso à área /superadmin para quem não for SUPERADMIN
    if (pathname.startsWith("/superadmin")) {
      if (!token || token.role !== "SUPERADMIN") {
        // Redireciona para login ou página de acesso negado
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }
    // Você pode expandir para outras roles se quiser!
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Admin login/register são públicos
        if (path.startsWith("/admin/login") || path.startsWith("/admin/register")) {
          return true;
        }
        return !!token; // Demais rotas exigem token
      },
    },
  }
);

// Agora, protege todas rotas de painel, inclusive o superadmin:
export const config = {
  matcher: ["/dashboard/:path*", "/perfil", "/minha-conta", "/admin/:path*", "/superadmin/:path*"],
};
