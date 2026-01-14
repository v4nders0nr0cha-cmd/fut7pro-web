import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const normalizeBase = (url: string) => url.replace(/\/+$/, "");

export async function POST(req: NextRequest) {
  let payload: { token?: string };

  try {
    payload = (await req.json()) as { token?: string };
  } catch {
    return Response.json({ ok: false, message: "Token invalido." }, { status: 400 });
  }

  const token = String(payload?.token || "").trim();
  if (!token) {
    return Response.json({ ok: false, message: "Token invalido." }, { status: 400 });
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
      return Response.json(
        { ok: false, message: data?.message || "Token expirado ou invalido." },
        { status: res.status || 400 }
      );
    }

    return Response.json(data);
  } catch {
    return Response.json({ ok: false, message: "Falha ao validar o token." }, { status: 500 });
  }
}
