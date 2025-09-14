import { NextResponse } from "next/server";

export function middleware(req: Request) {
  const { pathname } = new URL(req.url);
  const res = NextResponse.next();

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/superadmin") ||
    pathname.startsWith("/api")
  ) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return res;
}

// reduz custo: não roda em _next/static, imagens, favicon, robots, sitemap
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
