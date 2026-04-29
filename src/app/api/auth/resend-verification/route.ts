import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import { getHumanAuthErrorMessage } from "@/utils/public-auth-errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const normalizeBase = (url: string) => url.replace(/\/+$/, "");

export async function POST(req: NextRequest) {
  let payload: { email?: string };

  try {
    payload = (await req.json()) as { email?: string };
  } catch {
    return Response.json({ ok: false, message: "Informe um e-mail válido." }, { status: 400 });
  }

  const email = String(payload?.email || "")
    .trim()
    .toLowerCase();
  if (!email) {
    return Response.json({ ok: false, message: "Informe um e-mail válido." }, { status: 400 });
  }

  const baseUrl = normalizeBase(getApiBase());

  try {
    const res = await fetch(`${baseUrl}/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      return Response.json(
        {
          ok: false,
          message: getHumanAuthErrorMessage(
            data,
            "Não foi possível reenviar o e-mail agora. Tente novamente em instantes."
          ),
        },
        { status: res.status || 400 }
      );
    }

    return Response.json(data);
  } catch {
    return Response.json(
      {
        ok: false,
        message:
          "Não foi possível reenviar o e-mail agora. Verifique sua internet e tente novamente.",
      },
      { status: 500 }
    );
  }
}
