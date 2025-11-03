import { NextRequest } from "next/server";
import { diagHeaders } from "@/lib/api-headers";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const JSON_CT = "application/json; charset=utf-8";

function json(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", JSON_CT);
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return new Response(JSON.stringify(body), { ...init, headers });
}

export async function GET(req: NextRequest) {
  let baseUrl: string;
  try {
    baseUrl = getApiBase();
  } catch (error) {
    const message = error instanceof Error ? error.message : "API base ausente";
    return json({ error: message }, { status: 503 });
  }

  const url = new URL(req.url);
  const slug = (url.searchParams.get("slug") ?? "").trim();

  if (!slug) {
    return json({ error: "slug obrigatorio" }, { status: 400 });
  }

  const upstream = `${baseUrl}/public/${encodeURIComponent(slug)}/team-rankings`;

  try {
    const response = await fetch(upstream, {
      method: "GET",
      headers: {
        accept: JSON_CT,
      },
      cache: "no-store",
    });

    const bodyText = await response.text();
    if (!response.ok) {
      return json(
        {
          slug,
          error: `Upstream ${response.status}`,
          status: response.status,
          body: bodyText.slice(0, 300),
        },
        { status: response.status }
      );
    }

    return new Response(bodyText, {
      status: 200,
      headers: {
        ...diagHeaders("backend"),
        "Content-Type": response.headers.get("content-type") ?? JSON_CT,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return json({ slug, error: message }, { status: 502 });
  }
}
