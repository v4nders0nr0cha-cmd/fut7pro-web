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

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toProxyArtifactUrl(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;

  const value = raw.trim();
  if (value.startsWith("/admin/relatorios/diagnostics/")) {
    return `/api${value}`;
  }
  if (value.startsWith("/api/admin/relatorios/diagnostics/")) {
    return value;
  }

  try {
    const url = new URL(value);
    if (url.pathname.startsWith("/admin/relatorios/diagnostics/")) {
      return `/api${url.pathname}${url.search || ""}`;
    }
  } catch {
    // ignore invalid URL
  }

  return value;
}

function mapExecutionArtifact(item: unknown) {
  if (!isObject(item)) return item;

  const candidate =
    item.artifactUrl ??
    item.location ??
    item.downloadUrl ??
    item.fileUrl ??
    (typeof item.id === "string" ? `/admin/relatorios/diagnostics/${item.id}/artifact` : null);

  const mapped = toProxyArtifactUrl(candidate);
  if (!mapped) return item;

  return {
    ...item,
    artifactUrl: mapped,
  };
}

function mapDiagnosticsBody(body: unknown) {
  if (!isObject(body)) return body;

  const mapped = { ...body };
  if (Array.isArray(mapped.history)) {
    mapped.history = mapped.history.map((item) => mapExecutionArtifact(item));
  }
  if (isObject(mapped.summary) && mapped.summary.lastExecution) {
    mapped.summary = {
      ...mapped.summary,
      lastExecution: mapExecutionArtifact(mapped.summary.lastExecution),
    };
  }
  if (mapped.execution) {
    mapped.execution = mapExecutionArtifact(mapped.execution);
  }

  return mapped;
}

function toForwardableBody(body: unknown): string | object {
  const mapped = mapDiagnosticsBody(body);
  if (typeof mapped === "string") return mapped;
  if (mapped && typeof mapped === "object") return mapped as object;
  return JSON.stringify(mapped ?? null);
}

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if (!user) return jsonResponse({ error: "Nao autenticado" }, { status: 401 });

  const slugParam = req.nextUrl.searchParams.get("slug") || undefined;
  const tenantSlug = resolveTenantSlug(user, slugParam);
  if (!tenantSlug) {
    return jsonResponse({ error: "Tenant ativo nao encontrado" }, { status: 400 });
  }

  const search = req.nextUrl.search || "";
  const { response, body } = await proxyBackend(
    `${getApiBase()}/admin/relatorios/diagnostics${search}`,
    {
      headers: buildHeaders(user, tenantSlug),
      cache: "no-store",
    }
  );

  return forwardResponse(response.status, toForwardableBody(body));
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) return jsonResponse({ error: "Nao autenticado" }, { status: 401 });

  const slugParam = req.nextUrl.searchParams.get("slug") || undefined;
  const tenantSlug = resolveTenantSlug(user, slugParam);
  if (!tenantSlug) {
    return jsonResponse({ error: "Tenant ativo nao encontrado" }, { status: 400 });
  }

  const payload = await req.json().catch(() => ({}));
  const search = req.nextUrl.search || "";
  const { response, body } = await proxyBackend(
    `${getApiBase()}/admin/relatorios/diagnostics${search}`,
    {
      method: "POST",
      headers: {
        ...buildHeaders(user, tenantSlug, { includeContentType: true }),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    }
  );

  return forwardResponse(response.status, toForwardableBody(body));
}
