import { getApiBase } from "@/lib/get-api-base";
import { getVitrineAthleteResponse, isPublicVitrineSlug } from "@/lib/public-vitrine-demo";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string; athleteSlug: string } }
) {
  if (isPublicVitrineSlug(params.slug)) {
    const body = getVitrineAthleteResponse(params.athleteSlug);
    return new Response(JSON.stringify(body), {
      status: body.athlete ? 200 : 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const base = getApiBase();
  const url = `${base}/public/${encodeURIComponent(params.slug)}/athletes/${encodeURIComponent(
    params.athleteSlug
  )}`;

  const res = await fetch(url, { cache: "no-store" });
  const bodyText = await res.text();
  let body: any = null;
  try {
    body = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    body = bodyText;
  }

  return new Response(JSON.stringify(body), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
