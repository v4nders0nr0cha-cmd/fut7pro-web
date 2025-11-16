import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
} from "../../_proxy/helpers";

const ENDPOINT = "/api/admin/atletas/me";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function ensureUser() {
  const user = await requireUser();
  if (!user) {
    return null;
  }
  return user;
}

export async function GET() {
  const user = await ensureUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const base = getApiBase();
  const headers = buildHeaders(user, user.tenantSlug ?? null, { includeContentType: false });
  const { response, body } = await proxyBackend(`${base}${ENDPOINT}`, {
    method: "GET",
    headers,
  });

  return forwardResponse(response.status, body);
}

export async function PUT(req: NextRequest) {
  const user = await ensureUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const incomingForm = await req.formData();
  const upstreamForm = new FormData();
  incomingForm.forEach((value, key) => {
    upstreamForm.append(key, value);
  });

  const base = getApiBase();
  const headers = buildHeaders(user, user.tenantSlug ?? null, { includeContentType: false });
  const { response, body } = await proxyBackend(`${base}${ENDPOINT}`, {
    method: "PUT",
    headers,
    body: upstreamForm,
  });

  return forwardResponse(response.status, body);
}
