import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import { diagHeaders } from "@/lib/api-headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string; torneioSlug: string } }
) {
  const base = getApiBase();
  const url = `${base}/public/${params.slug}/torneios/${params.torneioSlug}`;

  const response = await fetch(url, {
    headers: {
      ...diagHeaders("backend"),
      "Cache-Control": "no-store",
    },
    next: { revalidate: 0, tags: [`public-${params.slug}-torneios-${params.torneioSlug}`] },
  });

  return new Response(await response.text(), {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    },
  });
}
