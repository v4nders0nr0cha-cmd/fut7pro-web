import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../../_proxy/helpers";

const ANALYTICS_ENDPOINT = "/notificacoes/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const tenantSlug = resolveTenantSlug(user, searchParams.get("slug"));
  if (!tenantSlug) {
    return jsonResponse({ error: "Tenant slug obrigatorio" }, { status: 400 });
  }

  const url = new URL(`${getApiBase()}${ANALYTICS_ENDPOINT}`);
  searchParams.forEach((value, key) => {
    if (key !== "slug") {
      url.searchParams.append(key, value);
    }
  });

  try {
    const headers = buildHeaders(user, tenantSlug, { includeContentType: false });
    const { response, body } = await proxyBackend(url.toString(), {
      method: "GET",
      headers,
    });
    return forwardResponse(response.status, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse(
      { error: "Falha ao consultar analytics de notificacoes", details: message },
      { status: 500 }
    );
  }
}
