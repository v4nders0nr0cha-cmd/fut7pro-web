import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "@/app/api/_proxy/helpers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { tenantId: string } }) {
  const user = await requireUser();
  if (!user) {
    return new Response(
      JSON.stringify({ message: "Sua sessão expirou. Entre novamente para continuar." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const base = getApiBase();
  const tenantSlug = resolveTenantSlug(user, params.tenantId) || params.tenantId;
  const url = new URL(
    `${base}/tenants/${encodeURIComponent(
      params.tenantId
    )}/me/premium-profile/legendary-celebration/seen`
  );
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const { response, body } = await proxyBackend(url.toString(), {
    method: "POST",
    headers: buildHeaders(user, tenantSlug),
    cache: "no-store",
  });

  return new Response(JSON.stringify(body), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
