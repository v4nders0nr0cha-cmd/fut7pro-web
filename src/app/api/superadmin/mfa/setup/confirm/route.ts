import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import { forwardResponse, proxyBackend } from "@/app/api/_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  const body = await req.text();

  const { response, body: backendBody } = await proxyBackend(
    `${getApiBase()}/auth/superadmin/mfa/setup/confirm`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    }
  );

  return forwardResponse(response.status, backendBody);
}
