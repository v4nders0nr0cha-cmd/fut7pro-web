import { getApiBase } from "@/lib/get-api-base";

export const dynamic = "force-dynamic";

function normalize(body: any) {
  if (body && typeof body === "object" && "data" in body) return body;
  return { data: body ?? null };
}

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const base = getApiBase();
  const slug = params.slug;

  const res = await fetch(`${base}/public/${encodeURIComponent(slug)}/footer`, {
    cache: "no-store",
  });

  const bodyText = await res.text();
  let body: any = null;
  try {
    body = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    body = bodyText;
  }

  return new Response(JSON.stringify(normalize(body)), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
