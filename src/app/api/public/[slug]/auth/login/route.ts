import { NextRequest, NextResponse } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import { sanitizePublicAuthErrorPayload } from "../route-errors";

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
    return json({ error: "Não foi possível conectar ao Fut7Pro agora." }, { status: 500 });
  }

  let payload: Record<string, unknown> | null = null;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return json(
      { error: "Não foi possível concluir a solicitação. Confira os dados e tente novamente." },
      { status: 400 }
    );
  }

  const slug = params.slug?.trim().toLowerCase();
  if (!slug) {
    return json(
      { error: "Não encontramos este racha. Confira o link e tente novamente." },
      { status: 400 }
    );
  }
  if (slug === "vitrine") {
    return json({ error: "Login de atletas desabilitado no racha vitrine." }, { status: 403 });
  }

  try {
    const res = await fetch(`${backendBase}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, rachaSlug: slug }),
    });
    const text = await res.text();
    let parsed: unknown = text;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }

    if (!res.ok) {
      return json(
        sanitizePublicAuthErrorPayload(
          parsed,
          "Não foi possível entrar agora. Confira os dados e tente novamente."
        ),
        { status: res.status }
      );
    }

    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch {
    return json(
      { error: "Não foi possível entrar agora. Verifique sua internet e tente novamente." },
      { status: 500 }
    );
  }
}
