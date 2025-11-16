import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
  forwardResponse,
} from "../../_proxy/helpers";

const REPORTS_ENDPOINT = "/api/admin/financeiro/relatorios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(
    user,
    req.nextUrl.searchParams.get("slug"),
    req.nextUrl.searchParams.get("tenantSlug")
  );

  if (!tenantSlug) {
    return jsonResponse({ error: "tenantSlug obrigatorio" }, { status: 400 });
  }

  const base = getApiBase();
  const url = new URL(`${base}${REPORTS_ENDPOINT}`);
  req.nextUrl.searchParams.forEach((value, key) => {
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
    return jsonResponse(
      { error: "Falha ao consultar relatorios financeiros", details: message },
      { status: 500 }
    );
  }
}
