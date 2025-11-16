import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, type AuthSession } from "@/server/auth/options";
import {
  EXPORT_TARGETS,
  type ExportTargetMeta,
  type ExportTargetId,
  buildExportPath,
  findExportTarget,
} from "@/constants/export-targets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const JSON_CT = "application/json; charset=utf-8";
type SessionUser = {
  tenantSlug?: string | null;
};

type DiagnosticsRequest = {
  targetId?: ExportTargetId;
  slug?: string | null;
};

type DiagnosticState = "success" | "error";

type DiagnosticResult = {
  targetId: ExportTargetId;
  state: DiagnosticState;
  detail?: string;
  statusCode?: number;
  contentType?: string | null;
  durationMs: number;
  timestamp: string;
};

function jsonResponse(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", JSON_CT);
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return NextResponse.json(body, { ...init, headers });
}

async function extractErrorDetail(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const payload = await response.json().catch(() => null);
    if (payload && typeof payload === "object") {
      if ("error" in payload && typeof payload.error === "string") {
        return payload.error;
      }
      if ("message" in payload && typeof payload.message === "string") {
        return payload.message;
      }
    }
    return `HTTP ${response.status}`;
  }
  const text = await response.text().catch(() => "");
  if (text) {
    return text.slice(0, 200);
  }
  return `HTTP ${response.status}`;
}

async function probeTarget(
  target: ExportTargetMeta,
  tenantSlug: string,
  origin: string,
  cookieHeader: string | null
): Promise<DiagnosticResult> {
  const startedAt = Date.now();
  const timestamp = new Date().toISOString();
  const requestUrl = new URL(buildExportPath(target, tenantSlug), origin);
  try {
    const headers: Record<string, string> = {
      accept: "*/*",
    };
    if (cookieHeader && cookieHeader.length > 0) {
      headers.cookie = cookieHeader;
    }

    const response = await fetch(requestUrl.toString(), {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const durationMs = Date.now() - startedAt;
    if (!response.ok) {
      const detail = await extractErrorDetail(response);
      return {
        targetId: target.id,
        state: "error",
        detail,
        statusCode: response.status,
        durationMs,
        timestamp,
      };
    }

    if (response.body && typeof response.body.cancel === "function") {
      await response.body.cancel().catch(() => undefined);
    }

    const contentType = response.headers.get("content-type");
    const disposition =
      response.headers.get("content-disposition") ?? response.headers.get("Content-Disposition");

    const detail =
      disposition && disposition.toLowerCase().includes("filename")
        ? disposition
        : contentType || response.statusText || "OK";

    return {
      targetId: target.id,
      state: "success",
      detail,
      statusCode: response.status,
      contentType,
      durationMs,
      timestamp,
    };
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const detail = error instanceof Error ? error.message : "Falha desconhecida";
    return {
      targetId: target.id,
      state: "error",
      detail,
      durationMs,
      timestamp,
    };
  }
}

export async function POST(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as AuthSession | null;
  const user = session?.user as SessionUser | undefined;

  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  let payload: DiagnosticsRequest | null = null;
  try {
    payload = await req.json();
  } catch {
    payload = null;
  }

  const explicitSlug =
    typeof payload?.slug === "string" && payload.slug.trim().length > 0
      ? payload.slug.trim()
      : null;

  const tenantSlug =
    explicitSlug ??
    (typeof user.tenantSlug === "string" && user.tenantSlug.trim().length > 0
      ? user.tenantSlug.trim()
      : null);

  if (!tenantSlug) {
    return jsonResponse({ error: "Tenant slug obrigatorio" }, { status: 400 });
  }

  const targetId = payload?.targetId ?? null;
  let targets: ExportTargetMeta[] = EXPORT_TARGETS;
  if (targetId) {
    const matched = findExportTarget(targetId);
    if (!matched) {
      return jsonResponse({ error: "Target invalido" }, { status: 400 });
    }
    targets = [matched];
  }

  const origin = req.nextUrl.origin;
  const cookieHeader = req.headers.get("cookie");
  const results: DiagnosticResult[] = [];

  for (const target of targets) {
    // eslint-disable-next-line no-await-in-loop
    const result = await probeTarget(target, tenantSlug, origin, cookieHeader);
    results.push(result);
  }

  return jsonResponse({
    ok: true,
    tenantSlug,
    testedAt: new Date().toISOString(),
    results,
  });
}
