import { NextRequest } from "next/server";
import { proxyBackend } from "@/app/api/_proxy/helpers";
import { getApiBase } from "@/lib/get-api-base";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const base = getApiBase();
  const url = `${base}/public/${params.slug}/about`;
  const { response, body } = await proxyBackend(url, {
    method: "GET",
    headers: { accept: "application/json" },
  });

  return new Response(JSON.stringify(body), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
