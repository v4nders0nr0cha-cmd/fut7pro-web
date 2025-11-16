import { NextRequest, NextResponse } from "next/server";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const JSON_CT = "application/json; charset=utf-8";

function json(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", JSON_CT);
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return NextResponse.json(body, { ...init, headers });
}

export async function POST(req: NextRequest) {
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Payload invalido" }, { status: 400 });
  }

  const slug = typeof payload?.slug === "string" ? payload.slug.trim() : "";
  const sponsorId = typeof payload?.sponsorId === "string" ? payload.sponsorId.trim() : "";
  const type = typeof payload?.type === "string" ? payload.type.toLowerCase() : "";

  if (!slug || !sponsorId || (type !== "click" && type !== "impression")) {
    return json({ error: "slug, sponsorId e type sao obrigatorios" }, { status: 400 });
  }

  let base: string;
  try {
    base = getApiBase();
  } catch (error) {
    return json(
      { error: "API base nao configurada", details: (error as Error).message },
      { status: 500 }
    );
  }

  const backendUrl = `${base}/public/${encodeURIComponent(
    slug
  )}/sponsors/${encodeURIComponent(sponsorId)}/metrics`;

  const refererHeader = req.headers.get("referer") ?? undefined;
  const userAgent = req.headers.get("user-agent") ?? undefined;

  let clientIp: string | undefined;
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const [first] = forwardedFor
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
    if (first) {
      clientIp = first;
    }
  }
  if (!clientIp) {
    const realIp = req.headers.get("x-real-ip");
    if (realIp && realIp.length > 0) {
      clientIp = realIp;
    }
  }
  if (!clientIp) {
    const reqIp = (req as unknown as { ip?: string | null }).ip;
    if (reqIp) {
      clientIp = reqIp;
    }
  }

  const metadata =
    payload?.metadata && typeof payload.metadata === "object" && !Array.isArray(payload.metadata)
      ? payload.metadata
      : undefined;

  const body = {
    type,
    currentUrl:
      typeof payload.currentUrl === "string" && payload.currentUrl.length > 0
        ? payload.currentUrl
        : refererHeader,
    targetUrl: typeof payload.targetUrl === "string" ? payload.targetUrl : undefined,
    utmSource: typeof payload.utmSource === "string" ? payload.utmSource : undefined,
    utmMedium: typeof payload.utmMedium === "string" ? payload.utmMedium : undefined,
    utmCampaign: typeof payload.utmCampaign === "string" ? payload.utmCampaign : undefined,
    utmTerm: typeof payload.utmTerm === "string" ? payload.utmTerm : undefined,
    utmContent: typeof payload.utmContent === "string" ? payload.utmContent : undefined,
    referer: typeof payload.referer === "string" ? payload.referer : refererHeader,
    metadata,
    userAgent,
    ip: clientIp,
  };

  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": JSON_CT,
        Accept: JSON_CT,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      try {
        const parsed = JSON.parse(text);
        return json(parsed, { status: response.status });
      } catch {
        return json(
          {
            error: "Falha ao registrar metrica de patrocinador",
            details: text || response.statusText,
          },
          { status: response.status }
        );
      }
    }

    return json({ ok: true }, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return json(
      { error: "Erro ao contatar o backend de metricas de patrocinadores", details: message },
      { status: 500 }
    );
  }
}
