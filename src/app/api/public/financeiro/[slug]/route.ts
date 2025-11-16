import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import { diagHeaders } from "@/lib/api-headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: NextRequest, { params }: { params: { slug?: string } }) {
  const slug = params.slug;
  if (!slug || slug.length === 0) {
    return new Response(JSON.stringify({ error: "slug obrigatorio" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const base = getApiBase();
  const upstream = `${base}/api/public/financeiro/${encodeURIComponent(slug)}`;

  try {
    const response = await fetch(upstream, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const payload = await response.text();

    if (!response.ok) {
      return new Response(payload || response.statusText, {
        status: response.status,
        headers: {
          "Content-Type": response.headers.get("content-type") ?? "application/json; charset=utf-8",
          ...diagHeaders("static"),
        },
      });
    }

    return new Response(payload, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json; charset=utf-8",
        ...diagHeaders("backend"),
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Falha ao consultar financeiro público:", error);
    }
    return new Response(JSON.stringify({ error: "Erro ao contactar backend" }), {
      status: 502,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        ...diagHeaders("static"),
      },
    });
  }
}
