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
import { buildTorneioPaths, triggerPublicRevalidate } from "../../../_proxy/revalidate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type SuccessCallbackParams = {
  body: any;
  tenantSlug: string;
  rawBody?: string;
};

async function forwardWithTenant(
  req: NextRequest,
  params: { id: string },
  init: RequestInit,
  includeContentType: boolean,
  options?: {
    rawBody?: string;
    onSuccess?: (params: SuccessCallbackParams) => Promise<void>;
  }
) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  const headers = buildHeaders(user, tenantSlug, {
    includeContentType,
  });

  const targetUrl = new URL(`${getApiBase()}/api/admin/torneios/${encodeURIComponent(params.id)}`);
  req.nextUrl.searchParams.forEach((value, key) => targetUrl.searchParams.set(key, value));
  if (!targetUrl.searchParams.has("slug")) {
    targetUrl.searchParams.set("slug", tenantSlug);
  }

  const { response, body } = await proxyBackend(targetUrl.toString(), { ...init, headers });

  if (response.ok && options?.onSuccess) {
    await options.onSuccess({
      body,
      tenantSlug,
      rawBody: options.rawBody,
    });
  }

  return forwardResponse(response.status, body);
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return forwardWithTenant(
    req,
    params,
    {
      method: "GET",
      cache: "no-store",
    },
    false
  );
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const rawBody = await req.text();
  let parsedBody: any = null;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    parsedBody = null;
  }

  return forwardWithTenant(
    req,
    params,
    {
      method: "PUT",
      body: rawBody,
    },
    true,
    {
      rawBody,
      onSuccess: async ({ body, tenantSlug }) => {
        const torneioSlug =
          (body && typeof body === "object" && (body as any).slug) ||
          (parsedBody && typeof parsedBody === "object" && (parsedBody as any).slug) ||
          null;
        await triggerPublicRevalidate(tenantSlug, buildTorneioPaths(tenantSlug, torneioSlug));
      },
    }
  );
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return forwardWithTenant(
    req,
    params,
    {
      method: "DELETE",
    },
    false,
    {
      onSuccess: async ({ body, tenantSlug }) => {
        const torneioSlug =
          body && typeof body === "object" && body !== null ? ((body as any).slug ?? null) : null;
        await triggerPublicRevalidate(tenantSlug, buildTorneioPaths(tenantSlug, torneioSlug));
      },
    }
  );
}
