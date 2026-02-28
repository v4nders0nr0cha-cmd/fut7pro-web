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
  const challengeToken = req.cookies.get(SUPERADMIN_MFA_CHALLENGE_COOKIE)?.value || "";
  if (!challengeToken) {
    return NextResponse.json({ message: "Operacao nao autorizada." }, { status: 401 });
  }

  const body = JSON.stringify({ challengeToken });
  const { response, body: backendBody } = await proxyBackend(
    `${getApiBase()}/auth/superadmin/mfa/setup/start`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    }
  );

  const responseBody =
    typeof backendBody === "object"
      ? JSON.stringify(backendBody)
      : String(backendBody ?? "Operacao nao autorizada.");
  const res = new NextResponse(responseBody, {
    status: response.status,
    headers: {
      "Content-Type":
        typeof backendBody === "object" ? "application/json" : "text/plain; charset=utf-8",
    },
  });

  if (response.ok) {
    res.cookies.set(SUPERADMIN_MFA_CHALLENGE_COOKIE, challengeToken, buildChallengeCookieOptions());
  } else {
    res.cookies.delete(SUPERADMIN_MFA_CHALLENGE_COOKIE);
  }

  return res;
}
