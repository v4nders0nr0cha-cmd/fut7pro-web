import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../../../_proxy/helpers";
import { revalidateTenantPublicPages } from "@/lib/revalidate-public";

const APPROVE_ENDPOINT = "/admin/solicitacoes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

  if (!params.id) {
    return jsonResponse({ error: "Solicitacao invalida" }, { status: 400 });
  }

  const base = getApiBase();
  const url = `${base}${APPROVE_ENDPOINT}/${encodeURIComponent(params.id)}/approve`;

  try {
    const headers = buildHeaders(user, tenantSlug, { includeContentType: false });
    const { response, body } = await proxyBackend(url, {
      method: "PUT",
      headers,
    });
    if (response.ok) {
      revalidateTenantPublicPages(tenantSlug);
    }
    return forwardResponse(response.status, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse(
      { error: "Falha ao aprovar solicitacao", details: message },
      { status: 500 }
    );
  }
}
