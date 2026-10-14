import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requirePublicAthleteUser,
} from "@/app/api/_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ slug: string; inviteId: string; action: string }> }
) {
  const user = await requirePublicAthleteUser();
  if (!user) return jsonResponse({ error: "Nao autenticado" }, { status: 401 });

  const { slug, inviteId, action } = await context.params;
  if (!slug || !inviteId || !["accept", "reject"].includes(action)) {
    return jsonResponse({ error: "Convite ou acao invalida" }, { status: 400 });
  }

  const headers = buildHeaders(user, slug);
  headers["x-auth-context"] = "athlete";
  const { response, body } = await proxyBackend(
    `${getApiBase()}/public/rachas/${encodeURIComponent(slug)}/admin-role-invites/${encodeURIComponent(inviteId)}/${action}`,
    { method: "POST", headers, cache: "no-store" }
  );
  return forwardResponse(response.status, body);
}
