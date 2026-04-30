import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const normalizeBase = (url: string) => url.replace(/\/+$/, "");

function humanResetError(message?: string | null) {
  const raw = String(message || "").trim();
  const normalized = raw.toLowerCase();

  if (
    normalized.includes("token") &&
    (normalized.includes("expirado") || normalized.includes("invalido"))
  ) {
    return "Este link de redefinição expirou. Solicite um novo link para criar uma nova senha.";
  }
  if (
    normalized.includes("bad request") ||
    normalized.includes("senha") ||
    normalized.includes("password")
  ) {
    return "A senha precisa ter entre 10 e 72 caracteres, com letra maiúscula, letra minúscula, número e caractere especial.";
  }
  return "Não foi possível redefinir sua senha agora. Tente novamente em alguns instantes ou solicite um novo link.";
}

export async function POST(req: NextRequest) {
  let payload: { token?: string; password?: string };

  try {
    payload = (await req.json()) as { token?: string; password?: string };
  } catch {
    return Response.json(
      {
        ok: false,
        message:
          "Este link de redefinição expirou. Solicite um novo link para criar uma nova senha.",
      },
      { status: 400 }
    );
  }

  const token = String(payload?.token || "").trim();
  const password = String(payload?.password || "");
  if (!token || !password) {
    return Response.json(
      {
        ok: false,
        message:
          "Este link de redefinição expirou. Solicite um novo link para criar uma nova senha.",
      },
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
      return Response.json(
        { ok: false, message: humanResetError(data?.message || data?.error) },
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
