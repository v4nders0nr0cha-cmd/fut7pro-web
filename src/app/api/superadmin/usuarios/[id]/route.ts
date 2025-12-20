import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireSuperAdminUser,
} from "../../../_proxy/helpers";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id?: string } }) {
  const user = await requireSuperAdminUser();
  if (!user) return jsonResponse({ error: "Nao autenticado" }, { status: 401 });

  const id = params?.id;
  if (!id) return jsonResponse({ error: "ID obrigatorio" }, { status: 400 });

  const targetUrl = `${getApiBase()}/superadmin/users/${encodeURIComponent(id)}`;
  const { response, body } = await proxyBackend(targetUrl, {
    headers: buildHeaders(user),
    cache: "no-store",
  });

  return forwardResponse(response.status, body);
}

export async function PUT(req: NextRequest, { params }: { params: { id?: string } }) {
  const user = await requireSuperAdminUser();
  if (!user) return jsonResponse({ error: "Nao autenticado" }, { status: 401 });

  const id = params?.id;
  if (!id) return jsonResponse({ error: "ID obrigatorio" }, { status: 400 });

  const targetUrl = `${getApiBase()}/superadmin/users/${encodeURIComponent(id)}`;
  const { response, body } = await proxyBackend(targetUrl, {
    method: "PUT",
    headers: buildHeaders(user, undefined, { includeContentType: true }),
    body: await req.text(),
  });

  return forwardResponse(response.status, body);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id?: string } }) {
  const user = await requireSuperAdminUser();
  if (!user) return jsonResponse({ error: "Nao autenticado" }, { status: 401 });

  const id = params?.id;
  if (!id) return jsonResponse({ error: "ID obrigatorio" }, { status: 400 });

  const targetUrl = `${getApiBase()}/superadmin/users/${encodeURIComponent(id)}`;
  const { response, body } = await proxyBackend(targetUrl, {
    method: "DELETE",
    headers: buildHeaders(user),
  });

  return forwardResponse(response.status, body);
}
