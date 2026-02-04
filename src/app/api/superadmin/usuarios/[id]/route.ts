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

type BackendUser = {
  id?: string | null;
  email?: string | null;
  name?: string | null;
  nickname?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
  superadmin?: boolean | null;
  authProvider?: string | null;
  emailVerified?: boolean | null;
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  disabledAt?: string | null;
  disabledReason?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  tenantId?: string | null;
  tenantSlug?: string | null;
  tenant?: { id?: string | null; name?: string | null; slug?: string | null } | null;
  memberships?: Array<{
    id?: string | null;
    role?: string | null;
    status?: string | null;
    createdAt?: string | null;
    tenant?: { id?: string | null; name?: string | null; slug?: string | null } | null;
  }> | null;
};

function mapUser(user: BackendUser) {
  const name = typeof user.name === "string" ? user.name : "";
  const memberships = Array.isArray(user.memberships)
    ? user.memberships.map((membership) => ({
        id: membership?.id ?? "",
        role: membership?.role ?? "ATLETA",
        status: membership?.status ?? "PENDENTE",
        createdAt: membership?.createdAt ?? undefined,
        tenantId: membership?.tenant?.id ?? undefined,
        tenantSlug: membership?.tenant?.slug ?? undefined,
        tenantNome: membership?.tenant?.name ?? undefined,
      }))
    : [];
  return {
    id: user.id ?? "",
    nome: name,
    name,
    nickname: user.nickname ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
    email: user.email ?? "",
    role: user.role ?? "ADMIN",
    superadmin: user.superadmin ?? false,
    tenantId: user.tenantId ?? user.tenant?.id ?? undefined,
    tenantSlug: user.tenantSlug ?? user.tenant?.slug ?? undefined,
    tenantNome: user.tenant?.name ?? undefined,
    authProvider: user.authProvider ?? undefined,
    emailVerified: user.emailVerified ?? false,
    emailVerifiedAt: user.emailVerifiedAt ?? undefined,
    lastLoginAt: user.lastLoginAt ?? undefined,
    disabledAt: user.disabledAt ?? undefined,
    disabledReason: user.disabledReason ?? undefined,
    criadoEm: user.createdAt ?? undefined,
    atualizadoEm: user.updatedAt ?? user.createdAt ?? undefined,
    ativo: !user.disabledAt,
    memberships,
  };
}

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

  if (!response.ok) {
    return forwardResponse(response.status, body);
  }

  return jsonResponse(mapUser((body as BackendUser) ?? {}));
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
