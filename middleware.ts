import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ADMIN_PREFIXES = [
  "/admin",
  "/superadmin",
  "/api/admin",
  "/api/superadmin",
  "/api/auth",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const headers = new Headers(req.headers);

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first && !ADMIN_PREFIXES.some((p) => pathname.startsWith(p))) {
    headers.set("x-tenant-slug", first);
  }

  const res = NextResponse.next({ request: { headers } });

  if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p))) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

