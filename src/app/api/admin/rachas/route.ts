import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import { revalidateTenantPublicPages } from "@/lib/revalidate-public";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../_proxy/helpers";

const RACHAS_ENDPOINT = "/api/rachas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function resolveHeaderTenant(user: any, req: NextRequest) {
  return resolveTenantSlug(
    user,
    req.nextUrl.searchParams.get("tenantSlug"),
    req.nextUrl.searchParams.get("slug")
  );
}

type ForwardOptions = {
  onSuccess?: (tenantSlug: string | null) => void;
};

function revalidateTenantConfig(tenantSlug: string | null) {
  if (!tenantSlug) {
    return;
  }

  try {
    revalidateTenantPublicPages(tenantSlug, {
      extraPaths: ["/sobre-nos/prestacao-de-contas"],
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Falha ao revalidar páginas públicas do racha:", error);
    }
  }
}

async function forwardRequest(
  req: NextRequest,
  init: RequestInit,
  includeContentType = true,
  options?: ForwardOptions
) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }
  const tenantSlug = resolveHeaderTenant(user, req);
  const headers = buildHeaders(user, tenantSlug, {
    includeContentType,
  });
  const base = getApiBase();
  const url = new URL(`${base}${RACHAS_ENDPOINT}`);
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  const { response, body } = await proxyBackend(url.toString(), {
    ...init,
    headers,
  });
  if (response.ok && typeof options?.onSuccess === "function") {
    try {
      options.onSuccess(tenantSlug);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Falha ao executar onSuccess em /admin/rachas:", error);
      }
    }
  }
  return forwardResponse(response.status, body);
}

export async function GET(req: NextRequest) {
  return forwardRequest(
    req,
    {
      method: "GET",
    },
    false
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return forwardRequest(
    req,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    true,
    { onSuccess: revalidateTenantConfig }
  );
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  return forwardRequest(
    req,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
    true,
    { onSuccess: revalidateTenantConfig }
  );
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  return forwardRequest(
    req,
    {
      method: "DELETE",
      body: JSON.stringify(body),
    },
    true,
    { onSuccess: revalidateTenantConfig }
  );
}
