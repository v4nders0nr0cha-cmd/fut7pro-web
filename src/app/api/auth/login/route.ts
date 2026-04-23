import { NextRequest, NextResponse } from "next/server";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const backendBase = getApiBase().replace(/\/+$/, "");
const loginPath = process.env.AUTH_LOGIN_PATH || "/auth/login";

function json(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return NextResponse.json(body, { ...init, headers });
}

function resolvePath(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value ? (value as Record<string, unknown>) : {};
}

export async function POST(req: NextRequest) {
  if (!backendBase) {
    return json({ message: "BACKEND_URL nao configurado" }, { status: 500 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = asRecord(await req.json());
  } catch {
    return json({ message: "Payload invalido" }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const password = typeof payload.password === "string" ? payload.password : "";
  const turnstileToken =
    typeof payload.turnstileToken === "string" ? payload.turnstileToken.trim() : "";

  if (!email || !password) {
    return json({ message: "Informe e-mail e senha." }, { status: 400 });
  }

  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const userAgent = req.headers.get("user-agent");

  try {
    const response = await fetch(resolvePath(backendBase, loginPath), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(forwardedFor ? { "x-forwarded-for": forwardedFor } : {}),
        ...(realIp ? { "x-real-ip": realIp } : {}),
        ...(userAgent ? { "user-agent": userAgent } : {}),
      },
      body: JSON.stringify({
        email,
        password,
        turnstileToken: turnstileToken || undefined,
      }),
    });

    const parsed = await response.json().catch(() => null);
    if (!response.ok) {
      return json(
        typeof parsed === "object" && parsed ? parsed : { message: "E-mail ou senha invalidos." },
        { status: response.status || 400 }
      );
    }

    return json(typeof parsed === "object" && parsed ? parsed : {}, {
      status: response.status || 200,
    });
  } catch {
    return json({ message: "Nao foi possivel entrar agora. Tente novamente." }, { status: 502 });
  }
}
