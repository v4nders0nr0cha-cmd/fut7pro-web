import { NextRequest, NextResponse } from "next/server";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type IncomingPayload = {
  nome?: string;
  email?: string;
  telefone?: string;
  assunto?: string;
  mensagem?: string;
  slug?: string;
};

function buildJsonResponse(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return NextResponse.json(body, { ...init, headers });
}

function normalizePayload(body: IncomingPayload) {
  const nome = body.nome?.trim();
  const email = body.email?.trim().toLowerCase();
  const assunto = body.assunto?.trim();
  const mensagem = body.mensagem?.trim();

  if (!nome || !email || !assunto || !mensagem) {
    return null;
  }

  return {
    name: nome,
    email,
    phone: body.telefone?.trim() || undefined,
    subject: assunto,
    message: mensagem,
    slug: (
      body.slug?.trim() ||
      process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG ||
      "fut7pro"
    ).toLowerCase(),
  };
}

export async function POST(req: NextRequest) {
  let body: IncomingPayload | null = null;
  try {
    body = (await req.json()) as IncomingPayload;
  } catch {
    body = null;
  }

  if (!body) {
    return buildJsonResponse({ error: "Corpo da requisicao obrigatorio." }, { status: 400 });
  }

  const payload = normalizePayload(body);
  if (!payload) {
    return buildJsonResponse(
      { error: "Nome, email, assunto e mensagem sao obrigatorios." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${getApiBase()}/public/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await response.json().catch(() => ({})) : await response.text();

    if (!response.ok) {
      const error =
        typeof data === "object" && data && "error" in data
          ? (data as Record<string, unknown>).error
          : response.statusText || "Falha ao enviar mensagem";
      return buildJsonResponse({ error }, { status: response.status });
    }

    return buildJsonResponse(typeof data === "object" ? data : { success: true }, {
      status: response.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return buildJsonResponse(
      { error: "Falha ao contatar o backend", details: message },
      { status: 500 }
    );
  }
}
