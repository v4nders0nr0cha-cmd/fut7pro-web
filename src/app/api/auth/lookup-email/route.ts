import { NextRequest, NextResponse } from "next/server";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const backendBase = getApiBase().replace(/\/+$/, "");
const LOOKUP_UNIFORM_MESSAGE = "Se estiver tudo certo, enviamos seu codigo.";

function json(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return NextResponse.json(body, { ...init, headers });
}

function normalizeLookupSuccess(payload: unknown) {
  const body = typeof payload === "object" && payload ? (payload as Record<string, unknown>) : {};
  const message =
    typeof body.message === "string" && body.message.trim()
      ? body.message.trim()
      : LOOKUP_UNIFORM_MESSAGE;
  return {
    ok: true,
    message,
    ...(body.requiresCaptcha === true ? { requiresCaptcha: true } : {}),
  };
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
    return json(normalizeLookupSuccess(null), { status: 200 });
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

    const parsed = await response.json().catch(() => null);
    const parsedRecord =
      typeof parsed === "object" && parsed ? (parsed as Record<string, unknown>) : null;

    if (!response.ok) {
      const code = typeof parsedRecord?.code === "string" ? parsedRecord.code : "";
      if (code === "CAPTCHA_REQUIRED" || code === "CAPTCHA_INVALID") {
        return json(
          {
            code,
            message:
              typeof parsedRecord?.message === "string"
                ? parsedRecord.message
                : "Nao foi possivel validar o captcha.",
            requiresCaptcha: true,
          },
          { status: response.status || 429 }
        );
      }

      if (code === "RACHA_NOT_FOUND") {
        return json(
          {
            code,
            message:
              typeof parsedRecord?.message === "string"
                ? parsedRecord.message
                : "Racha nao encontrado.",
          },
          { status: 404 }
        );
      }

      const status = response.status >= 500 ? 502 : response.status || 400;
      return json({ error: "Nao foi possivel verificar o e-mail." }, { status });
    }

    return json(normalizeLookupSuccess(parsed), { status: 200 });
  } catch {
    return json({ error: "Falha ao consultar e-mail" }, { status: 502 });
  }
}
