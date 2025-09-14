import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Não mexa em headers de cache das APIs
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  // Aplicar X-Robots-Tag apenas em rotas privadas (não em APIs públicas)
  if (pathname.startsWith("/admin") || pathname.startsWith("/superadmin")) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  // Cache para páginas (não-API) - só se não for API
  res.headers.set("Cache-Control", "public, max-age=0, must-revalidate");

  return res;
}

// reduz custo: não roda em _next/static, imagens, favicon, robots, sitemap
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
