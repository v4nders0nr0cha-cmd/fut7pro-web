import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;
  const needsAuth = p.startsWith("/admin") || p.startsWith("/superadmin");
  if (!needsAuth) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = new URL(`/login?callbackUrl=${encodeURIComponent(p)}`, req.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/superadmin/:path*"] };
