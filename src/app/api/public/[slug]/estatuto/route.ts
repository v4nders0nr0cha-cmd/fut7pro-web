import { NextRequest } from "next/server";
import { proxyBackend } from "@/app/api/_proxy/helpers";
import { getApiBase } from "@/lib/get-api-base";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const base = getApiBase();
  const target = new URL(`${base}/public/${params.slug}/estatuto`);
  req.nextUrl.searchParams.forEach((value, key) => target.searchParams.set(key, value));

  const { response, body } = await proxyBackend(target.toString(), {
    method: "GET",
    headers: { accept: "application/json" },
  });

  return new Response(JSON.stringify(body), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
