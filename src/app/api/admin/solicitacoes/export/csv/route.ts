import { NextRequest, NextResponse } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../../../_proxy/helpers";

const EXPORT_ENDPOINT = "/admin/solicitacoes/export/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const tenantSlug = resolveTenantSlug(
    user,
    searchParams.get("slug"),
    searchParams.get("tenantSlug")
  );

  if (!tenantSlug) {
    return jsonResponse({ error: "tenantSlug obrigatorio" }, { status: 400 });
  }

  const base = getApiBase();
  const url = new URL(`${base}${EXPORT_ENDPOINT}`);
  const status = searchParams.get("status");
  if (status) {
    url.searchParams.set("status", status);
  }

  try {
    const headers = buildHeaders(user, tenantSlug, { includeContentType: false });
    const { response } = await proxyBackend(url.toString(), {
      method: "GET",
      headers,
    });

    const proxiedHeaders = new Headers();
    const contentType = response.headers.get("content-type");
    if (contentType) {
      proxiedHeaders.set("Content-Type", contentType);
    } else {
      proxiedHeaders.set("Content-Type", "text/csv; charset=utf-8");
    }
    const disposition = response.headers.get("content-disposition");
    if (disposition) {
      proxiedHeaders.set("Content-Disposition", disposition);
    }
    proxiedHeaders.set("Cache-Control", "no-store, max-age=0, must-revalidate");

    return new NextResponse(response.body, {
      status: response.status,
      headers: proxiedHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse(
      { error: "Falha ao exportar solicitacoes", details: message },
      { status: 500 }
    );
  }
}
