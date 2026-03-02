import { NextRequest, NextResponse } from "next/server";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const backendBase = getApiBase().replace(/\/+$/, "");

function json(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return NextResponse.json(body, { ...init, headers });
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!backendBase) {
    return json({ error: "BACKEND_URL nao configurado" }, { status: 500 });
  }

  let payload: Record<string, unknown> | null = null;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Payload invalido" }, { status: 400 });
  }

  const slug = params.slug?.trim().toLowerCase();
  if (!slug) {
    return json({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }
  if (slug === "vitrine") {
    return json({ error: "Login de atletas desabilitado no racha vitrine." }, { status: 403 });
  }

  const email = typeof payload?.email === "string" ? payload.email.trim() : "";
  if (!email) {
    return json({ error: "E-mail obrigatorio" }, { status: 400 });
  }

  try {
    const response = await fetch(`${backendBase}/auth/passwordless/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        rachaSlug: slug,
      }),
    });
    const parsed = await response.json().catch(() => null);
    const body =
      typeof parsed === "object" && parsed
        ? parsed
        : { ok: true, message: "Se estiver tudo certo, enviamos seu codigo." };

    return json(body, { status: response.status || 200 });
  } catch {
    return json({ error: "Falha ao solicitar codigo de acesso." }, { status: 502 });
  }
}
