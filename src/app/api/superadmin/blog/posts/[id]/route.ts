import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import { normalizeBlogPostPayload } from "@/lib/superadmin-blog-payload";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireSuperAdminUser,
} from "../../../../_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { params: { id?: string } };

function isGenericBadRequest(body: unknown) {
  if (!body || typeof body !== "object") return false;
  const statusCode = Number((body as { statusCode?: unknown }).statusCode);
  const message = (body as { message?: unknown }).message;
  return statusCode === 400 && typeof message === "string" && message.trim() === "Bad Request";
}

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const id = params?.id;
  if (!id) {
    return jsonResponse({ error: "ID obrigatorio" }, { status: 400 });
  }

  const targetUrl = `${getApiBase()}/superadmin/blog/posts/${encodeURIComponent(id)}`;
  const { response, body } = await proxyBackend(targetUrl, {
    headers: buildHeaders(user),
    cache: "no-store",
  });

  return forwardResponse(response.status, body);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const id = params?.id;
  if (!id) {
    return jsonResponse({ error: "ID obrigatorio" }, { status: 400 });
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

  const normalized = normalizeBlogPostPayload(parsedBody, "update");
  console.info("[superadmin/blog/posts/:id][PATCH] payload-shape", {
    keys: normalized.diagnostics.keys,
    categoryIdType: normalized.diagnostics.categoryIdType,
    tagIdsType: normalized.diagnostics.tagIdsType,
    tagIdsItemTypes: normalized.diagnostics.tagIdsItemTypes,
    statusType: normalized.diagnostics.statusType,
    statusValue: normalized.diagnostics.statusValue,
    publishedAtType: normalized.diagnostics.publishedAtType,
  });

  if (normalized.issues.length > 0) {
    console.warn("[superadmin/blog/posts/:id][PATCH] payload-invalid", {
      issues: normalized.issues,
      keys: normalized.diagnostics.keys,
    });
    return jsonResponse(
      {
        message: "Payload inválido para atualização de post.",
        issues: normalized.issues,
      },
      { status: 400 }
    );
  }

  const targetUrl = `${getApiBase()}/superadmin/blog/posts/${encodeURIComponent(id)}`;
  const { response, body } = await proxyBackend(targetUrl, {
    method: "PATCH",
    headers: buildHeaders(user, undefined, { includeContentType: true }),
    body: JSON.stringify(normalized.payload),
  });

  if (response.status === 400 && isGenericBadRequest(body)) {
    console.warn("[superadmin/blog/posts/:id][PATCH] backend-bad-request", {
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
              "Verifique título, resumo, conteúdo, categoria/tags e URLs (canonical/imagens).",
          },
        ],
      },
      { status: 400 }
    );
  }

  return forwardResponse(response.status, body);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const id = params?.id;
  if (!id) {
    return jsonResponse({ error: "ID obrigatorio" }, { status: 400 });
  }

  const targetUrl = `${getApiBase()}/superadmin/blog/posts/${encodeURIComponent(id)}`;
  const { response, body } = await proxyBackend(targetUrl, {
    method: "DELETE",
    headers: buildHeaders(user),
  });

  return forwardResponse(response.status, body);
}
