import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import { getHumanAuthErrorMessage } from "@/utils/public-auth-errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const normalizeBase = (url: string) => url.replace(/\/+$/, "");

export async function POST(req: NextRequest) {
  let payload: { token?: string; password?: string };

  try {
    payload = (await req.json()) as { token?: string; password?: string };
  } catch {
    return Response.json(
      {
        ok: false,
        message: "Não foi possível concluir a solicitação. Confira os dados e tente novamente.",
      },
      { status: 400 }
    );
  }

  const token = String(payload?.token || "").trim();
  const password = String(payload?.password || "");
  if (!token || !password) {
    return Response.json(
      { ok: false, message: "Este link não é mais válido. Solicite um novo link para continuar." },
      { status: 400 }
    );
  }

  const baseUrl = normalizeBase(getApiBase());

  try {
    const res = await fetch(`${baseUrl}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const rawMessage = data?.message || data?.error || "";
      return Response.json(
        {
          ok: false,
          message: getHumanAuthErrorMessage(
            rawMessage,
            "Não foi possível redefinir sua senha agora. Tente novamente em alguns instantes ou solicite um novo link."
          ),
        },
        { status: res.status || 400 }
      );
    }

    return Response.json(data || { ok: true });
  } catch {
    return Response.json(
      {
        ok: false,
        message:
          "Não foi possível redefinir sua senha agora. Tente novamente em alguns instantes ou solicite um novo link.",
      },
      { status: 500 }
    );
  }
}
