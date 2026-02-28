import { NextRequest, NextResponse } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import { proxyBackend } from "@/app/api/_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const SUPERADMIN_MFA_CHALLENGE_COOKIE = "superadmin_mfa_setup_challenge";

function buildChallengeCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 5 * 60,
  };
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  const { response, body: backendBody } = await proxyBackend(
    `${getApiBase()}/auth/superadmin/mfa/setup/challenge`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    }
  );

  if (!response.ok || typeof backendBody !== "object" || backendBody === null) {
    return NextResponse.json(
      { message: "Nao foi possivel iniciar a configuracao segura do MFA." },
      { status: response.status || 401 }
    );
  }

  const challengeToken = String((backendBody as { challengeToken?: unknown }).challengeToken || "");
  if (!challengeToken) {
    return NextResponse.json(
      { message: "Nao foi possivel iniciar a configuracao segura do MFA." },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set(SUPERADMIN_MFA_CHALLENGE_COOKIE, challengeToken, buildChallengeCookieOptions());
  return res;
}
