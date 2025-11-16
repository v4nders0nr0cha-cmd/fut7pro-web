import { NextRequest } from "next/server";
import { diagHeaders } from "@/lib/api-headers";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const JSON_CT = "application/json; charset=utf-8";

const FALLBACK_RESPONSE = {
  slug: "",
  athleteSlug: "",
  result: null as unknown,
};

function json(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", JSON_CT);
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export async function GET(req: NextRequest, { params }: { params: { athleteSlug: string } }) {
  let baseUrl: string;

  try {
    baseUrl = getApiBase();
  } catch (error) {
    return json({ ...FALLBACK_RESPONSE, error: "API base ausente" }, { status: 503 });
  }

  const athleteSlug = params?.athleteSlug?.trim();
  const url = new URL(req.url);
  const slug = (url.searchParams.get("slug") ?? "").trim();

  if (!slug) {
    return json(
      { ...FALLBACK_RESPONSE, athleteSlug: athleteSlug ?? "", error: "slug obrigatorio" },
      { status: 400 }
    );
  }

  if (!athleteSlug) {
    return json({ ...FALLBACK_RESPONSE, slug, error: "athleteSlug obrigatorio" }, { status: 400 });
  }

  const upstream = `${baseUrl}/public/${encodeURIComponent(slug)}/athletes/${encodeURIComponent(
    athleteSlug
  )}`;

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
          athleteSlug,
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
        athleteSlug,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 502 }
    );
  }
}
