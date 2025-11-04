import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  jsonResponse,
  requireUser,
  resolveTenantSlug,
  buildHeaders,
  proxyBackend,
  forwardResponse,
} from "../_proxy/helpers";

const MATCHES_ENDPOINT = "/api/partidas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Não autenticado" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const tenantSlug = resolveTenantSlug(user, searchParams.get("slug"), searchParams.get("tenantSlug"));

  if (!tenantSlug) {
    return jsonResponse({ error: "tenantSlug obrigatório" }, { status: 400 });
  }

  const base = getApiBase();
  const url = new URL(`${base}${MATCHES_ENDPOINT}`);
  searchParams.forEach((value, key) => {
    if (key !== "slug" && key !== "tenantSlug") {
      url.searchParams.set(key, value);
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
    return jsonResponse({ error: "Falha ao buscar partidas", details: message }, { status: 500 });
  }
}
