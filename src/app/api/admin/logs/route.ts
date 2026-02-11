import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  appendSafeQueryParams,
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../../_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const MAX_METADATA_DEPTH = 2;
const MAX_METADATA_KEYS = 24;
const LOG_ALLOWED_KEYS = new Set([
  "id",
  "adminId",
  "adminName",
  "adminNome",
  "adminEmail",
  "usuarioId",
  "action",
  "acao",
  "resource",
  "recurso",
  "timestamp",
  "criadoEm",
  "data",
  "details",
  "detalhes",
  "ip",
  "metadata",
]);
const METADATA_ALLOWED_KEYS = new Set([
  "module",
  "feature",
  "entity",
  "entitytype",
  "entityid",
  "targetid",
  "targettype",
  "operation",
  "status",
  "result",
  "source",
  "origin",
  "path",
  "method",
  "httpstatus",
  "action",
  "reason",
  "message",
  "summary",
  "changedfields",
  "count",
  "total",
  "period",
  "date",
  "year",
  "quarter",
  "before",
  "after",
  "diff",
]);
function maskIpv4(value: string) {
  const parts = value.split(".");
  if (parts.length !== 4) return "[ip-redigido]";
  return `${parts[0]}.${parts[1]}.***.***`;
}

function sanitizeLogText(value?: unknown) {
  if (typeof value !== "string") return "";
  let sanitized = value;
  sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, "Bearer [redigido]");
  sanitized = sanitized.replace(
    /(\"?(?:token|accessToken|refreshToken|authorization|cookie|set-cookie|senha|password|secret|apiKey|apikey|hash)\"?\s*[:=]\s*\")([^\"]+)(\")/gi,
    "$1[redigido]$3"
  );
  sanitized = sanitized.replace(
    /\b([A-Za-z0-9_-]{20,})\.([A-Za-z0-9_-]{20,})\.([A-Za-z0-9_-]{20,})\b/g,
    "[jwt-redigido]"
  );
  sanitized = sanitized.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, (ip) => maskIpv4(ip));
  return sanitized;
}

function sanitizeMetadataValue(value: unknown, depth: number): unknown {
  if (value === null || typeof value === "undefined") return undefined;
  if (typeof value === "string") return sanitizeLogText(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_METADATA_KEYS)
      .map((entry) => sanitizeMetadataValue(entry, depth + 1))
      .filter((entry) => typeof entry !== "undefined");
  }
  if (typeof value === "object") {
    if (depth >= MAX_METADATA_DEPTH) return "[redigido]";
    return sanitizeMetadata(value as Record<string, unknown>, depth + 1);
  }
  return undefined;
}

function sanitizeMetadata(rawMetadata: Record<string, unknown>, depth = 0) {
  const safeMetadata: Record<string, unknown> = {};
  const entries = Object.entries(rawMetadata).slice(0, MAX_METADATA_KEYS);
  entries.forEach(([key, value]) => {
    const normalizedKey = key.toLowerCase();
    if (!METADATA_ALLOWED_KEYS.has(normalizedKey)) return;
    if (normalizedKey === "before" || normalizedKey === "after" || normalizedKey === "diff") {
      safeMetadata[key] = "[redigido]";
      return;
    }
    const sanitizedValue = sanitizeMetadataValue(value, depth);
    if (typeof sanitizedValue !== "undefined") {
      safeMetadata[key] = sanitizedValue;
    }
  });
  return Object.keys(safeMetadata).length > 0 ? safeMetadata : undefined;
}

function sanitizeLogRecord(entry: unknown) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
  const raw = entry as Record<string, unknown>;
  const safe: Record<string, unknown> = {};

  LOG_ALLOWED_KEYS.forEach((key) => {
    if (typeof raw[key] === "undefined") return;
    safe[key] = raw[key];
  });

  if (typeof safe.details === "string") safe.details = sanitizeLogText(safe.details);
  if (typeof safe.detalhes === "string") safe.detalhes = sanitizeLogText(safe.detalhes);
  if (typeof safe.ip === "string") safe.ip = maskIpv4(safe.ip);

  const metadata = raw.metadata;
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    const sanitizedMetadata = sanitizeMetadata(metadata as Record<string, unknown>);
    if (sanitizedMetadata) safe.metadata = sanitizedMetadata;
  }

  return safe;
}

function sanitizeLogsResponsePayload(payload: unknown) {
  if (Array.isArray(payload)) {
    return payload.map((entry) => sanitizeLogRecord(entry)).filter((entry) => entry !== null);
  }

  if (payload && typeof payload === "object") {
    const raw = payload as Record<string, unknown>;

    if (Array.isArray(raw.results)) {
      return {
        ...raw,
        results: raw.results
          .map((entry) => sanitizeLogRecord(entry))
          .filter((entry) => entry !== null),
      };
    }

    if (Array.isArray(raw.items)) {
      return {
        ...raw,
        items: raw.items.map((entry) => sanitizeLogRecord(entry)).filter((entry) => entry !== null),
      };
    }

    if (Array.isArray(raw.data)) {
      return {
        ...raw,
        data: raw.data.map((entry) => sanitizeLogRecord(entry)).filter((entry) => entry !== null),
      };
    }
  }

  return payload;
}

function sanitizeLogWritePayload(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return {};
  const raw = payload as Record<string, unknown>;
  const safe: Record<string, unknown> = {};

  if (typeof raw.action === "string") safe.action = raw.action;
  if (typeof raw.acao === "string") safe.acao = raw.acao;
  if (typeof raw.resource === "string") safe.resource = raw.resource;
  if (typeof raw.recurso === "string") safe.recurso = raw.recurso;
  if (typeof raw.adminId === "string") safe.adminId = raw.adminId;
  if (typeof raw.usuarioId === "string") safe.usuarioId = raw.usuarioId;
  if (typeof raw.details === "string") safe.details = sanitizeLogText(raw.details);
  if (typeof raw.detalhes === "string") safe.detalhes = sanitizeLogText(raw.detalhes);

  const metadata = raw.metadata;
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    const sanitizedMetadata = sanitizeMetadata(metadata as Record<string, unknown>);
    if (sanitizedMetadata) safe.metadata = sanitizedMetadata;
  }

  const ip = raw.ip;
  if (typeof ip === "string") {
    safe.ip = maskIpv4(ip);
  }

  return safe;
}

async function buildTargetUrl(req: NextRequest) {
  const targetUrl = new URL(`${getApiBase()}/logs`);
  appendSafeQueryParams(req.nextUrl.searchParams, targetUrl, {
    allowedKeys: ["action", "userId", "startDate", "endDate", "limit"],
  });
  return targetUrl.toString();
}

async function requireAuthHeaders(includeContentType = false) {
  const user = await requireUser();
  if (!user) {
    return { user: null, headers: null, tenantSlug: null };
  }

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return { user, headers: null, tenantSlug: null };
  }

  const headers = buildHeaders(user, tenantSlug, { includeContentType });
  return { user, headers, tenantSlug };
}

export async function GET(req: NextRequest) {
  const { user, headers, tenantSlug } = await requireAuthHeaders(false);
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }
  if (!headers || !tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const targetUrl = await buildTargetUrl(req);
  const { response, body } = await proxyBackend(targetUrl, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const safeBody = sanitizeLogsResponsePayload(body);
  const responsePayload =
    typeof safeBody === "string" || (safeBody && typeof safeBody === "object")
      ? safeBody
      : { data: safeBody ?? null };
  return forwardResponse(response.status, responsePayload);
}

export async function POST(req: NextRequest) {
  const { user, headers, tenantSlug } = await requireAuthHeaders(true);
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }
  if (!headers || !tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const payload = await req.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return jsonResponse({ error: "Payload invalido" }, { status: 400 });
  }

  const safePayload = sanitizeLogWritePayload(payload);
  const targetUrl = await buildTargetUrl(req);
  const { response, body } = await proxyBackend(targetUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(safePayload),
    cache: "no-store",
  });

  const safeBody = sanitizeLogsResponsePayload(body);
  const responsePayload =
    typeof safeBody === "string" || (safeBody && typeof safeBody === "object")
      ? safeBody
      : { data: safeBody ?? null };
  return forwardResponse(response.status, responsePayload);
}
