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

export async function POST(req: NextRequest) {
  if (!backendBase) {
    return json({ error: "BACKEND_URL nao configurado" }, { status: 500 });
  }

  let payload: Record<string, unknown> | null = null;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Payload invalido" }, { status: 400 });
  }

  const email = typeof payload?.email === "string" ? payload.email.trim() : "";
  const rachaSlug = typeof payload?.rachaSlug === "string" ? payload.rachaSlug.trim() : "";
  const captchaToken = typeof payload?.captchaToken === "string" ? payload.captchaToken.trim() : "";

  if (!email) {
    return json({ error: "E-mail obrigatorio" }, { status: 400 });
  }

  if (rachaSlug.toLowerCase() === "vitrine") {
    return json({
      exists: false,
      userExists: false,
      providers: [],
      hasPassword: false,
      membershipStatus: "BLOCKED",
      nextAction: "BLOCKED_MESSAGE",
    });
  }

  try {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent");

    const response = await fetch(`${backendBase}/auth/lookup-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(forwardedFor ? { "x-forwarded-for": forwardedFor } : {}),
        ...(realIp ? { "x-real-ip": realIp } : {}),
        ...(userAgent ? { "user-agent": userAgent } : {}),
      },
      body: JSON.stringify({
        email,
        rachaSlug: rachaSlug || undefined,
        captchaToken: captchaToken || undefined,
      }),
    });
    const text = await response.text();
    let parsed: unknown = text;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }

    if (!response.ok) {
      return json(
        typeof parsed === "object" && parsed ? parsed : { error: text || "Falha ao consultar" },
        { status: response.status }
      );
    }

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return json({ error: "Falha ao consultar e-mail", details: message }, { status: 500 });
  }
}
