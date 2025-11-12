import { NextRequest } from "next/server";
import { diagHeaders } from "@/lib/api-headers";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const JSON_CT = "application/json; charset=utf-8";

const FALLBACK_RESPONSE = {
  slug: "",
  total: 0,
  results: [] as unknown[],
};

function json(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", JSON_CT);
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export async function GET(req: NextRequest) {
  let baseUrl: string;

  try {
    baseUrl = getApiBase();
  } catch (error) {
    return json({ ...FALLBACK_RESPONSE, error: "API base ausente" }, { status: 503 });
  }

  const url = new URL(req.url);
  const slug = (url.searchParams.get("slug") ?? "").trim();

  if (!slug) {
    return json({ ...FALLBACK_RESPONSE, error: "slug obrigatorio" }, { status: 400 });
  }

  const searchParams = new URLSearchParams();
  const forwardKeys = [
    "search",
    "limit",
    "status",
    "position",
    "page",
    "pageSize",
    "sort",
    "season",
  ];

  forwardKeys.forEach((key) => {
    const value = url.searchParams.get(key);
    if (value && value.trim().length > 0) {
      searchParams.set(key, value.trim());
    }
  });

  const upstream = `${baseUrl}/public/${encodeURIComponent(slug)}/athletes${
    searchParams.toString().length > 0 ? `?${searchParams.toString()}` : ""
  }`;

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
          ...FALLBACK_RESPONSE,
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
    return json(
      {
        ...FALLBACK_RESPONSE,
        slug,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 502 }
    );
  }
}
