import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import { getHumanAuthErrorMessage } from "@/utils/public-auth-errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const normalizeBase = (url: string) => url.replace(/\/+$/, "");

export async function POST(req: NextRequest) {
  let payload: { token?: string };

  try {
    payload = (await req.json()) as { token?: string };
  } catch {
    return Response.json(
      { ok: false, message: "Este link não é mais válido. Solicite um novo link para continuar." },
      { status: 400 }
    );
  }

  const token = String(payload?.token || "").trim();
  if (!token) {
    return Response.json(
      { ok: false, message: "Este link não é mais válido. Solicite um novo link para continuar." },
      { status: 400 }
    );
  }

  const baseUrl = normalizeBase(getApiBase());

  try {
    const res = await fetch(`${baseUrl}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      const rawMessage = data?.message || data?.error || "";
      return Response.json(
        {
          ok: false,
          message: getHumanAuthErrorMessage(
            rawMessage,
            "Não foi possível confirmar seu e-mail agora. Solicite um novo link para continuar."
          ),
        },
        { status: res.status || 400 }
      );
    }

    return Response.json(data);
  } catch {
    return Response.json(
      { ok: false, message: "Não foi possível confirmar seu e-mail agora. Tente novamente." },
      { status: 500 }
    );
  }
}
