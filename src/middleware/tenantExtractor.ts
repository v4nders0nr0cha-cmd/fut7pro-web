// src/middleware/tenantExtractor.ts
import { NextRequest, NextResponse } from "next/server";

export function extractTenantFromPath(pathname: string): string | null {
  // Padrões de rota que contêm tenant slug
  const tenantPatterns = [
    /^\/rachas\/([^\/]+)/,  // /rachas/{slug}
    /^\/([^\/]+)\//,        // /{slug}/ (para subdomínios)
  ];

  for (const pattern of tenantPatterns) {
    const match = pathname.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function shouldIgnorePath(pathname: string): boolean {
  // Rotas que devem ser ignoradas na extração de tenant
  const ignorePatterns = [
    /^\/api\/auth/,           // Rotas de autenticação
    /^\/api\/health/,         // Health check
    /^\/api\/superadmin/,     // Rotas de superadmin
    /^\/_next/,               // Next.js internals
    /^\/favicon\.ico/,        // Favicon
    /^\/robots\.txt/,         // Robots.txt
    /^\/sitemap\.xml/,        // Sitemap
    /^\/manifest\.json/,      // Manifest
    /^\/unauthorized/,        // Página de não autorizado
    /^\/login/,               // Página de login
    /^\/register/,            // Página de registro
    /^\/$/,                   // Página inicial
  ];

  return ignorePatterns.some(pattern => pattern.test(pathname));
}

export function addTenantHeader(request: NextRequest): NextResponse {
  const pathname = request.nextUrl.pathname;
  
  // Se deve ignorar o path, não adicionar header
  if (shouldIgnorePath(pathname)) {
    return NextResponse.next();
  }

  // Extrair tenant slug do path
  const tenantSlug = extractTenantFromPath(pathname);
  
  if (tenantSlug) {
    // Criar response com header do tenant
    const response = NextResponse.next();
    response.headers.set('x-tenant-slug', tenantSlug);
    return response;
  }

  return NextResponse.next();
}
