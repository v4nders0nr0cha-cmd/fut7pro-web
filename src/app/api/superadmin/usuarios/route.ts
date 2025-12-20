import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireSuperAdminUser,
} from "../../_proxy/helpers";

export const runtime = "nodejs";
export const revalidate = 0;
export const dynamic = "force-dynamic";

type BackendUser = {
  id?: string | null;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  tenantId?: string | null;
  tenantSlug?: string | null;
  tenant?: { id?: string | null; name?: string | null; slug?: string | null } | null;
};

function mapUser(user: BackendUser) {
  const name = typeof user.name === "string" ? user.name : "";
  return {
    id: user.id ?? "",
    nome: name,
    name,
    email: user.email ?? "",
    role: user.role ?? "ADMIN",
    tenantId: user.tenantId ?? user.tenant?.id ?? undefined,
    tenantSlug: user.tenantSlug ?? user.tenant?.slug ?? undefined,
    criadoEm: user.createdAt ?? undefined,
    atualizadoEm: user.updatedAt ?? user.createdAt ?? undefined,
    ativo: true,
  };
}

export async function GET(_req: NextRequest) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const { response, body } = await proxyBackend(`${getApiBase()}/superadmin/users`, {
    headers: buildHeaders(user),
    cache: "no-store",
  });

  if (!response.ok) {
    return forwardResponse(response.status, body);
  }

  const list = Array.isArray(body)
    ? body
    : Array.isArray((body as { results?: unknown[] })?.results)
      ? (body as { results: unknown[] }).results
      : [];

  const usuarios = list.map((item) => mapUser(item as BackendUser));
  return jsonResponse(usuarios);
}
