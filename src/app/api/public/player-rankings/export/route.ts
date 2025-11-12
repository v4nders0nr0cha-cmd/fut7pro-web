import { NextRequest, NextResponse } from "next/server";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const JSON_CT = "application/json; charset=utf-8";
const ALLOWED_PARAMS = new Set([
  "type",
  "format",
  "limit",
  "position",
  "period",
  "year",
  "quarter",
  "start",
  "end",
]);

function jsonResponse(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", JSON_CT);
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return NextResponse.json(body, { ...init, headers });
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const slug = searchParams.get("slug")?.trim();

  if (!slug) {
    return jsonResponse({ error: "slug obrigat�rio" }, { status: 400 });
  }

  let base: string;
  try {
    base = getApiBase();
  } catch (error) {
    return jsonResponse(
      { error: "API base n�o configurada", details: (error as Error).message },
      { status: 500 }
    );
  }

  const backendUrl = new URL(`/public/${encodeURIComponent(slug)}/player-rankings/export`, base);
  ALLOWED_PARAMS.forEach((key) => {
    const value = searchParams.get(key);
    if (value && value.length > 0) {
      backendUrl.searchParams.set(key, value);
    }
  });

  try {
    const response = await fetch(backendUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "*/*",
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      try {
        const parsed = JSON.parse(text);
        return jsonResponse(parsed, { status: response.status });
      } catch {
        return jsonResponse(
          {
            error: "Falha ao exportar ranking p�blico",
            details: text || response.statusText,
          },
          { status: response.status }
        );
      }
    }

    const headers = new Headers();
    const contentType = response.headers.get("content-type");
    if (contentType) {
      headers.set("Content-Type", contentType);
    }
    const disposition = response.headers.get("content-disposition");
    if (disposition) {
      headers.set("Content-Disposition", disposition);
    }
    headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse(
      { error: "Erro ao contatar o backend de rankings p�blicos", details: message },
      { status: 500 }
    );
  }
}
