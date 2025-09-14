import { NextResponse } from "next/server";

export function middleware(req: Request) {
  const { pathname } = new URL(req.url);
  const res = NextResponse.next();

  // Aplicar X-Robots-Tag apenas em rotas privadas (não em APIs públicas)
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/superadmin") ||
    (pathname.startsWith("/api") && !pathname.startsWith("/api/public"))
  ) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return res;
}

// reduz custo: não roda em _next/static, imagens, favicon, robots, sitemap
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
