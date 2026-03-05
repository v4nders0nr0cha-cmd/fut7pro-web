import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const normalizeBase = (url: string) => url.replace(/\/+$/, "");

export async function POST(req: NextRequest) {
  let payload: { code?: string; planKey?: string };

  try {
    payload = (await req.json()) as { code?: string; planKey?: string };
  } catch {
    return Response.json({ valid: false, reason: "invalid_payload" });
  }

  const code = String(payload?.code || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  if (!code) {
    return Response.json({ valid: false, reason: "invalid_code" });
  }

  const baseUrl = normalizeBase(getApiBase());
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${baseUrl}/public/coupons/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        code,
        planKey: payload?.planKey || undefined,
      }),
    });

    const data = await res.json().catch(() => null);
    if (res.status === 429) {
      return Response.json({ valid: false, reason: "rate_limited" });
    }
    if (!res.ok) {
      return Response.json({ valid: false, reason: data?.reason || "temporary_error" });
    }
    if (!data) {
      return Response.json({ valid: false, reason: "temporary_error" });
    }

    return Response.json(data);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return Response.json({ valid: false, reason: "timeout" });
    }
    return Response.json({ valid: false, reason: "temporary_error" });
  } finally {
    clearTimeout(timeout);
  }
}
