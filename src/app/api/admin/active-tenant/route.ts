import { NextResponse } from "next/server";

const ACTIVE_TENANT_COOKIE = "fut7pro_active_tenant";

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ACTIVE_TENANT_COOKIE, "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
