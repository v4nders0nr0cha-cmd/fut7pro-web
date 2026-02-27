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
const SEO_COMPAT_FIELDS = ["metaTitle", "canonicalUrl", "focusKeyword", "robots"] as const;
const EXTENDED_COMPAT_FIELDS = [
  "subtitle",
  "coverImageAlt",
  "ogImageUrl",
  "difficulty",
  "featuredAt",
] as const;
const LEGACY_CORE_FIELDS = [
  "title",
  "excerpt",
  "content",
  "slug",
  "coverImageUrl",
  "status",
  "featured",
  "categoryId",
  "tagIds",
  "publishedAt",
] as const;
const LEGACY_MINIMAL_FIELDS = [
  "title",
  "excerpt",
  "content",
  "slug",
  "coverImageUrl",
  "categoryId",
  "tagIds",
] as const;

type Params = { params: { id?: string } };
type CompatAttempt = {
  name: string;
  payload: Record<string, unknown>;
  removedFields: string[];
};

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

function omitFields(payload: Record<string, unknown>, fields: readonly string[]) {
  const nextPayload: Record<string, unknown> = { ...payload };
  const removedFields: string[] = [];
  fields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(nextPayload, field)) {
      delete nextPayload[field];
      removedFields.push(field);
    }
  });
  return { payload: nextPayload, removedFields };
}

function pickFields(payload: Record<string, unknown>, fields: readonly string[]) {
  const allowed = new Set(fields);
  const nextPayload: Record<string, unknown> = {};
  const removedFields: string[] = [];
  Object.keys(payload).forEach((key) => {
    if (allowed.has(key)) {
      nextPayload[key] = payload[key];
      return;
    }
    removedFields.push(key);
  });
  return { payload: nextPayload, removedFields };
}

function payloadSignature(payload: Record<string, unknown>) {
  const entries = Object.keys(payload)
    .sort()
    .map((key) => [key, payload[key]]);
  return JSON.stringify(entries);
}

function buildCompatibilityAttempts(payload: Record<string, unknown>) {
  const attempts: CompatAttempt[] = [];
  const seenSignatures = new Set<string>([payloadSignature(payload)]);

  const candidates: CompatAttempt[] = [
    { name: "seo-only", ...stripSeoCompatFields(payload) },
    { name: "extended", ...omitFields(payload, [...SEO_COMPAT_FIELDS, ...EXTENDED_COMPAT_FIELDS]) },
    { name: "legacy-core", ...pickFields(payload, LEGACY_CORE_FIELDS) },
    { name: "legacy-minimal", ...pickFields(payload, LEGACY_MINIMAL_FIELDS) },
  ];

  candidates.forEach((candidate) => {
    if (candidate.removedFields.length === 0) return;
    if (Object.keys(candidate.payload).length === 0) return;
    const signature = payloadSignature(candidate.payload);
    if (seenSignatures.has(signature)) return;
    seenSignatures.add(signature);
    attempts.push(candidate);
  });

  return attempts;
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
    const compatibilityAttempts = buildCompatibilityAttempts(normalized.payload);
    for (const attempt of compatibilityAttempts) {
      const retry = await proxyBackend(targetUrl, {
        method: "PATCH",
        headers: buildHeaders(user, undefined, { includeContentType: true }),
        body: JSON.stringify(attempt.payload),
      });

      if (retry.response.ok) {
        console.warn("[superadmin/blog/posts/:id][PATCH] compat-retry-success", {
          mode: attempt.name,
          removedFields: attempt.removedFields,
        });
        return forwardResponse(retry.response.status, retry.body);
      }

      if (!isGenericBadRequest(retry.body)) {
        console.warn("[superadmin/blog/posts/:id][PATCH] compat-retry-non-generic", {
          mode: attempt.name,
          removedFields: attempt.removedFields,
          status: retry.response.status,
        });
        return forwardResponse(retry.response.status, retry.body);
      }

      console.warn("[superadmin/blog/posts/:id][PATCH] compat-retry-generic-400", {
        mode: attempt.name,
        removedFields: attempt.removedFields,
        status: retry.response.status,
      });
    }

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
              "Verifique título, resumo, conteúdo, categoria/tags e URLs de imagem/canonical.",
          },
          {
            field: "compat",
            message:
              "Backend legado detectado: campos avançados podem ser ignorados automaticamente no retry.",
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
