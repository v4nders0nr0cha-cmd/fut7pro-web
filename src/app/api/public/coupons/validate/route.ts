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
    return Response.json({ valid: false });
  }

  const code = String(payload?.code || "").trim();
  if (!code) {
    return Response.json({ valid: false });
  }

  const baseUrl = normalizeBase(getApiBase());

  try {
    const res = await fetch(`${baseUrl}/public/coupons/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        planKey: payload?.planKey || undefined,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      return Response.json({ valid: false });
    }

    return Response.json(data);
  } catch {
    return Response.json({ valid: false });
  }
}
