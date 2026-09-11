import { NextRequest, NextResponse } from "next/server";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const backendBase = getApiBase().replace(/\/+$/, "");
const loginPath = process.env.AUTH_LOGIN_PATH || "/auth/login";
const AUTH_SERVICE_UNAVAILABLE_MESSAGE =
  "Nao foi possivel acessar o servico de autenticacao agora. Tente novamente em alguns instantes.";
const STRUCTURED_AUTH_ERROR_CODES = new Set([
  "TURNSTILE_REQUIRED",
  "TURNSTILE_INVALID",
  "TURNSTILE_UNAVAILABLE",
  "EMAIL_NOT_VERIFIED",
  "INVALID_CREDENTIALS",
]);

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

function isServiceUnavailableStatus(status: number) {
  return status === 502 || status === 503 || status === 504;
}

function isStructuredAuthError(value: unknown) {
  const record = asRecord(value);
  const code = typeof record.code === "string" ? record.code.trim() : "";
  return STRUCTURED_AUTH_ERROR_CODES.has(code);
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
  const turnstileProof =
    typeof payload.turnstileProof === "string" ? payload.turnstileProof.trim() : "";

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
        turnstileProof: turnstileProof || undefined,
      }),
    });

    const parsed = await response.json().catch(() => null);
    if (!response.ok) {
      if (isStructuredAuthError(parsed)) {
        return json(parsed, { status: response.status || 400 });
      }

      if (isServiceUnavailableStatus(response.status)) {
        return json(
          { code: "AUTH_SERVICE_UNAVAILABLE", message: AUTH_SERVICE_UNAVAILABLE_MESSAGE },
          { status: response.status }
        );
      }

      return json(
        typeof parsed === "object" && parsed ? parsed : { message: "E-mail ou senha invalidos." },
        { status: response.status || 400 }
      );
    }

    return json(typeof parsed === "object" && parsed ? parsed : {}, {
      status: response.status || 200,
    });
  } catch {
    return json(
      { code: "AUTH_SERVICE_UNAVAILABLE", message: AUTH_SERVICE_UNAVAILABLE_MESSAGE },
      { status: 502 }
    );
  }
}
