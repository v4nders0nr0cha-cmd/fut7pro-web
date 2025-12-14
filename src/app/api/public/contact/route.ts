import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import { proxyBackend } from "../../_proxy/helpers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  const base = getApiBase();
  const payload = await req.text();

  const { response, body } = await proxyBackend(`${base}/public/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
  });

  return new Response(JSON.stringify(body), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
