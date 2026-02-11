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
import { buildTorneioPaths, triggerPublicRevalidate } from "../../_proxy/revalidate";

const BASE_PATH = "/api/admin/torneios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type SuccessCallbackParams = {
  body: any;
  tenantSlug: string;
  rawBody?: string;
};

async function forwardToBackend(
  req: NextRequest,
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

  const targetUrl = new URL(`${getApiBase()}${BASE_PATH}`);
  appendSafeQueryParams(req.nextUrl.searchParams, targetUrl);
  if (!targetUrl.searchParams.has("slug")) {
    targetUrl.searchParams.set("slug", tenantSlug);
  }

  const { response, body } = await proxyBackend(targetUrl.toString(), {
    ...init,
    headers,
  });

  if (response.ok && options?.onSuccess) {
    await options.onSuccess({
      body,
      tenantSlug,
      rawBody: options.rawBody,
    });
  }

  return forwardResponse(response.status, body);
}

export async function GET(req: NextRequest) {
  return forwardToBackend(
    req,
    {
      method: "GET",
      cache: "no-store",
    },
    false
  );
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  let parsedBody: any = null;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    parsedBody = null;
  }

  return forwardToBackend(
    req,
    {
      method: "POST",
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
