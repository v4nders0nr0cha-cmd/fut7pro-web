// middleware.ts

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { addTenantHeader, extractTenantFromPath } from "./src/middleware/tenantExtractor";

export default withAuth(
  function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    // @ts-ignore
    const token = req.nextauth.token as any; // Token tipado por NextAuth

    // Extrair tenant do path e adicionar header
    const response = addTenantHeader(req);

    // Bloquear acesso à área /superadmin para quem não for SUPERADMIN
    if (pathname.startsWith("/superadmin")) {
      if (!token || token.role !== "SUPERADMIN") {
        // Redireciona para login ou página de acesso negado
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Verificar acesso a rotas de tenant
    if (pathname.startsWith("/rachas/")) {
      const tenantSlug = extractTenantFromPath(pathname);

      if (tenantSlug) {
        // Verificar se o usuário tem acesso ao tenant
        if (token && token.tenantSlug !== tenantSlug) {
          // Se o usuário está logado mas não tem acesso ao tenant, redirecionar
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
      }
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Rotas públicas que não precisam de autenticação
        const publicRoutes = [
          "/",
          "/login",
          "/register",
          "/rachas",
          "/rachas/[slug]",
          "/unauthorized",
        ];

        const isPublicRoute = publicRoutes.some((route) => {
          if (route.includes("[slug]")) {
            return pathname.startsWith("/rachas/") && pathname.split("/").length === 3;
          }
          return pathname === route;
        });

        if (isPublicRoute) {
          return true;
        }

        // Para rotas protegidas, verificar se há token
        return !!token;
      },
    },
  }
);

// Agora, protege todas rotas de painel, inclusive o superadmin:
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/perfil",
    "/minha-conta",
    "/admin/:path*",
    "/superadmin/:path*",
    "/rachas/:path*",
  ],
};
