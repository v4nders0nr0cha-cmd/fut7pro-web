import { NextRequest } from "next/server";
import {
  buildHeaders,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "@/app/api/_proxy/helpers";
import { getApiBase } from "@/lib/get-api-base";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const base = getApiBase();
  const headers = buildHeaders(user, resolveTenantSlug(user), { includeContentType: false });
  const { response, body } = await proxyBackend(`${base}/admin/about`, { headers });

  return new Response(JSON.stringify(body), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function PUT(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const payload = await req.json();
  const base = getApiBase();
  const headers = buildHeaders(user, resolveTenantSlug(user), { includeContentType: true });

  const { response, body } = await proxyBackend(`${base}/admin/about`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  return new Response(JSON.stringify(body), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
