import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  jsonResponse,
  requireUser,
  resolveTenantSlug,
} from "../../../../../_proxy/helpers";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) return jsonResponse({ error: "Nao autenticado" }, { status: 401 });

  const id = String(params?.id || "").trim();
  if (!id) {
    return jsonResponse({ error: "ID do diagnostico obrigatorio" }, { status: 400 });
  }

  const slugParam = req.nextUrl.searchParams.get("slug") || undefined;
  const tenantSlug = resolveTenantSlug(user, slugParam);
  if (!tenantSlug) {
    return jsonResponse({ error: "Tenant ativo nao encontrado" }, { status: 400 });
  }

  const search = req.nextUrl.search || "";
  const url = `${getApiBase()}/admin/relatorios/diagnostics/${encodeURIComponent(id)}/artifact${search}`;

  const response = await fetch(url, {
    method: "GET",
    headers: buildHeaders(user, tenantSlug),
    cache: "no-store",
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "application/json; charset=utf-8";
    const text = await response.text();
    if (contentType.includes("application/json")) {
      try {
        const parsed = text ? JSON.parse(text) : null;
        if (parsed && typeof parsed === "object") {
          return jsonResponse(parsed as Record<string, unknown>, { status: response.status });
        }
      } catch {
        // fallback para resposta textual
      }
    }
    return new Response(text || "Falha ao baixar artefato do diagnóstico.", {
      status: response.status,
      headers: { "Content-Type": contentType },
    });
  }

  const payload = await response.arrayBuffer();
  const headers = new Headers();

  const contentType = response.headers.get("content-type") || "application/json; charset=utf-8";
  const contentDisposition =
    response.headers.get("content-disposition") ||
    `attachment; filename="diagnostico-${encodeURIComponent(id)}.json"`;
  const cacheControl =
    response.headers.get("cache-control") || "no-store, max-age=0, must-revalidate";

  headers.set("Content-Type", contentType);
  headers.set("Content-Disposition", contentDisposition);
  headers.set("Cache-Control", cacheControl);

  return new Response(payload, {
    status: response.status,
    headers,
  });
}
