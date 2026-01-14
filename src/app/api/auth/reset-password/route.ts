import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const normalizeBase = (url: string) => url.replace(/\/+$/, "");

export async function POST(req: NextRequest) {
  let payload: { token?: string; password?: string };

  try {
    payload = (await req.json()) as { token?: string; password?: string };
  } catch {
    return Response.json({ ok: false, message: "Token invalido." }, { status: 400 });
  }

  const token = String(payload?.token || "").trim();
  const password = String(payload?.password || "");
  if (!token || !password) {
    return Response.json({ ok: false, message: "Dados invalidos." }, { status: 400 });
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
        { ok: false, message: data?.message || "Nao foi possivel redefinir a senha." },
        { status: res.status || 400 }
      );
    }

    return Response.json(data || { ok: true });
  } catch {
    return Response.json({ ok: false, message: "Falha ao redefinir a senha." }, { status: 500 });
  }
}
