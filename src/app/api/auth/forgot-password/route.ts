import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const normalizeBase = (url: string) => url.replace(/\/+$/, "");

export async function POST(req: NextRequest) {
  let payload: { email?: string };

  try {
    payload = (await req.json()) as { email?: string };
  } catch {
    return Response.json({ ok: false, message: "E-mail invalido." }, { status: 400 });
  }

  const email = String(payload?.email || "").trim();
  if (!email) {
    return Response.json({ ok: false, message: "E-mail invalido." }, { status: 400 });
  }

  const baseUrl = normalizeBase(getApiBase());

  try {
    const res = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return Response.json(
        { ok: false, message: data?.message || "Nao foi possivel enviar o e-mail." },
        { status: res.status || 400 }
      );
    }

    return Response.json(data || { ok: true });
  } catch {
    return Response.json(
      { ok: false, message: "Falha ao solicitar recuperacao de senha." },
      { status: 500 }
    );
  }
}
