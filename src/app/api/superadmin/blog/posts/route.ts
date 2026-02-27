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
    const compatibilityAttempts = buildCompatibilityAttempts(normalized.payload);
    for (const attempt of compatibilityAttempts) {
      const retry = await proxyBackend(`${getApiBase()}/superadmin/blog/posts`, {
        method: "POST",
        headers: buildHeaders(user, undefined, { includeContentType: true }),
        body: JSON.stringify(attempt.payload),
      });

      if (retry.response.ok) {
        console.warn("[superadmin/blog/posts][POST] compat-retry-success", {
          mode: attempt.name,
          removedFields: attempt.removedFields,
        });
        return forwardResponse(retry.response.status, retry.body);
      }

      if (!isGenericBadRequest(retry.body)) {
        console.warn("[superadmin/blog/posts][POST] compat-retry-non-generic", {
          mode: attempt.name,
          removedFields: attempt.removedFields,
          status: retry.response.status,
        });
        return forwardResponse(retry.response.status, retry.body);
      }

      console.warn("[superadmin/blog/posts][POST] compat-retry-generic-400", {
        mode: attempt.name,
        removedFields: attempt.removedFields,
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
              "Backend legado detectado: campos avançados podem ser ignorados automaticamente no retry.",
          },
        ],
      },
      { status: 400 }
    );
  }

  return forwardResponse(response.status, body);
}
