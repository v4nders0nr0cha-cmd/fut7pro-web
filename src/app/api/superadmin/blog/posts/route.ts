import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import { normalizeBlogPostPayload } from "@/lib/superadmin-blog-payload";
import {
  appendSafeQueryParams,
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireSuperAdminUser,
} from "../../../_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
const SEO_COMPAT_FIELDS = ["metaTitle", "canonicalUrl", "focusKeyword", "robots"] as const;

function isGenericBadRequest(body: unknown) {
  if (!body || typeof body !== "object") return false;
  const statusCode = Number((body as { statusCode?: unknown }).statusCode);
  const message = (body as { message?: unknown }).message;
  return statusCode === 400 && typeof message === "string" && message.trim() === "Bad Request";
}

function stripSeoCompatFields(payload: Record<string, unknown>) {
  const nextPayload: Record<string, unknown> = { ...payload };
  const removedFields: string[] = [];
  SEO_COMPAT_FIELDS.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(nextPayload, field)) {
      delete nextPayload[field];
      removedFields.push(field);
    }
  });
  return { payload: nextPayload, removedFields };
}

function logPayloadShape(prefix: string, body: unknown) {
  const normalized = normalizeBlogPostPayload(body, "create");
  console.info(prefix, {
    keys: normalized.diagnostics.keys,
    categoryIdType: normalized.diagnostics.categoryIdType,
    tagIdsType: normalized.diagnostics.tagIdsType,
    tagIdsItemTypes: normalized.diagnostics.tagIdsItemTypes,
    statusType: normalized.diagnostics.statusType,
    statusValue: normalized.diagnostics.statusValue,
    publishedAtType: normalized.diagnostics.publishedAtType,
  });

  return normalized;
}

export async function GET(req: NextRequest) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const targetUrl = new URL(`${getApiBase()}/superadmin/blog/posts`);
  appendSafeQueryParams(req.nextUrl.searchParams, targetUrl, {
    allowedKeys: ["pageSize"],
  });

  const { response, body } = await proxyBackend(targetUrl.toString(), {
    headers: buildHeaders(user),
    cache: "no-store",
  });

  return forwardResponse(response.status, body);
}

export async function POST(req: NextRequest) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  let parsedBody: unknown;
  try {
    parsedBody = await req.json();
  } catch {
    return jsonResponse(
      {
        message: "Payload JSON inválido.",
        issues: [{ field: "body", message: "Envie um objeto JSON válido." }],
      },
      { status: 400 }
    );
  }

  const normalized = logPayloadShape("[superadmin/blog/posts][POST] payload-shape", parsedBody);
  if (normalized.issues.length > 0) {
    console.warn("[superadmin/blog/posts][POST] payload-invalid", {
      issues: normalized.issues,
      keys: normalized.diagnostics.keys,
    });
    return jsonResponse(
      {
        message: "Payload inválido para criação de post.",
        issues: normalized.issues,
      },
      { status: 400 }
    );
  }

  const { response, body } = await proxyBackend(`${getApiBase()}/superadmin/blog/posts`, {
    method: "POST",
    headers: buildHeaders(user, undefined, { includeContentType: true }),
    body: JSON.stringify(normalized.payload),
  });

  if (response.status === 400 && isGenericBadRequest(body)) {
    const compatibilityPayload = stripSeoCompatFields(normalized.payload);
    if (compatibilityPayload.removedFields.length > 0) {
      const retry = await proxyBackend(`${getApiBase()}/superadmin/blog/posts`, {
        method: "POST",
        headers: buildHeaders(user, undefined, { includeContentType: true }),
        body: JSON.stringify(compatibilityPayload.payload),
      });

      if (retry.response.ok) {
        console.warn("[superadmin/blog/posts][POST] seo-compat-retry-success", {
          removedFields: compatibilityPayload.removedFields,
        });
        return forwardResponse(retry.response.status, retry.body);
      }

      console.warn("[superadmin/blog/posts][POST] seo-compat-retry-failed", {
        removedFields: compatibilityPayload.removedFields,
        status: retry.response.status,
      });
    }

    console.warn("[superadmin/blog/posts][POST] backend-bad-request", {
      keys: normalized.diagnostics.keys,
      categoryIdType: normalized.diagnostics.categoryIdType,
      tagIdsType: normalized.diagnostics.tagIdsType,
      statusValue: normalized.diagnostics.statusValue,
    });
    return jsonResponse(
      {
        message: "Requisição rejeitada pelo backend do blog.",
        issues: [
          {
            field: "payload",
            message:
              "Verifique título, resumo, conteúdo, categoria/tags e URLs de imagem/canonical.",
          },
          {
            field: "compat",
            message:
              "Se o backend ainda não suportar SEO avançado, tente salvar com Meta title, Canonical, Palavra-chave foco e Robots vazios.",
          },
        ],
      },
      { status: 400 }
    );
  }

  return forwardResponse(response.status, body);
}
