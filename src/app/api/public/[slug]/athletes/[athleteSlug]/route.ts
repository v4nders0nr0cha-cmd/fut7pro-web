import { getApiBase } from "@/lib/get-api-base";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string; athleteSlug: string } }
) {
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
