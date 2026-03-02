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
  const code = typeof payload?.code === "string" ? payload.code.trim() : "";
  if (!email || !code) {
    return json({ error: "E-mail e codigo obrigatorios." }, { status: 400 });
  }

  try {
    const response = await fetch(`${backendBase}/auth/passwordless/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        code,
        rachaSlug: slug,
      }),
    });

    const parsed = await response.json().catch(() => null);
    if (!response.ok) {
      return json(
        typeof parsed === "object" && parsed
          ? parsed
          : { error: "Nao foi possivel validar o codigo." },
        { status: response.status || 400 }
      );
    }

    return json(parsed, { status: response.status || 200 });
  } catch {
    return json({ error: "Falha ao validar codigo de acesso." }, { status: 502 });
  }
}
