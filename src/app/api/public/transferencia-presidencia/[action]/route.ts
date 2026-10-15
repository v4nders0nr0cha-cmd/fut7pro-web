import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requirePublicAthleteUser,
} from "@/app/api/_proxy/helpers";

const ALLOWED_ACTIONS = new Set(["consultar", "aceitar", "recusar"]);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest, context: { params: Promise<{ action: string }> }) {
  const user = await requirePublicAthleteUser();
  if (!user) return jsonResponse({ error: "Nao autenticado" }, { status: 401 });

  const { action } = await context.params;
  if (!ALLOWED_ACTIONS.has(action)) {
    return jsonResponse({ error: "Acao invalida" }, { status: 400 });
  }

  const input = await req.json().catch(() => null);
  const token = typeof input?.token === "string" ? input.token.trim() : "";
  if (token.length < 20 || token.length > 256) {
    return jsonResponse({ error: "Token invalido" }, { status: 400 });
  }

  const headers = buildHeaders(user, undefined, {
    includeContentType: true,
    includeTenantHeaders: false,
  });
  const { response, body } = await proxyBackend(
    `${getApiBase()}/public/transferencia-presidencia/${action}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ token }),
      cache: "no-store",
    }
  );
  return forwardResponse(response.status, body);
}
