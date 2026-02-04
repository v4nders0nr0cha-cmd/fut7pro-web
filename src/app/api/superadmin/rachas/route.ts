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

type BackendTenant = {
  id?: string | null;
  name?: string | null;
  nome?: string | null;
  slug?: string | null;
  isVitrine?: boolean | null;
  status?: string | null;
  blocked?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  trialEndsAt?: string | null;
  planKey?: string | null;
  plan?: string | null;
  themeKey?: string | null;
  subscription?: {
    status?: string | null;
    planKey?: string | null;
    plan?: string | null;
    trialEnd?: string | null;
  } | null;
  admins?: unknown[] | null;
  adminsCount?: number | null;
  jogadoresCount?: number | null;
  _count?: { users?: number | null } | null;
};

function normalizeStatus(raw?: string | null, blocked?: boolean | null) {
  const value = (raw || "").toUpperCase();
  if (blocked) return "BLOQUEADO";
  if (value.includes("INAD")) return "INADIMPLENTE";
  if (value.includes("TRIAL")) return "TRIAL";
  if (value.includes("PAUSE")) return "BLOQUEADO";
  if (value.includes("EXPIRE")) return "INADIMPLENTE";
  if (value.includes("BLOCK")) return "BLOQUEADO";
  if (value.includes("ATIVO") || value.includes("ACTIVE") || value.includes("PAID")) return "ATIVO";
  return value || "ATIVO";
}

function mapTenant(tenant: BackendTenant) {
  const subscription = tenant.subscription ?? null;
  const slug = tenant.slug ?? "";
  const isVitrine = Boolean(tenant.isVitrine) || slug.toLowerCase() === "vitrine";
  const status = isVitrine
    ? "ATIVO"
    : normalizeStatus(subscription?.status ?? tenant.status, tenant.blocked);
  const nome = tenant.name ?? tenant.nome ?? tenant.slug ?? "Racha sem nome";
  const adminsCount = Array.isArray(tenant.admins) ? tenant.admins.length : tenant.adminsCount;
  const jogadoresCount = tenant.jogadoresCount ?? tenant._count?.users ?? undefined;

  return {
    id: tenant.id ?? "",
    nome,
    slug: slug,
    tenantId: tenant.id ?? undefined,
    tenantSlug: tenant.slug ?? undefined,
    status,
    ativo: status === "ATIVO" || status === "TRIAL",
    plano: isVitrine
      ? "vitrine"
      : (subscription?.planKey ?? tenant.planKey ?? tenant.plan ?? undefined),
    planoStatus: subscription?.status ?? undefined,
    trialExpiraEm: subscription?.trialEnd ?? tenant.trialEndsAt ?? undefined,
    criadoEm: tenant.createdAt ?? undefined,
    atualizadoEm: tenant.updatedAt ?? undefined,
    themeKey: tenant.themeKey ?? undefined,
    adminsCount: adminsCount ?? undefined,
    jogadoresCount,
    isVitrine,
  };
}

export async function GET(_req: NextRequest) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const { response, body } = await proxyBackend(`${getApiBase()}/superadmin/tenants`, {
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

  const rachas = list.map((item) => mapTenant(item as BackendTenant));
  return jsonResponse(rachas);
}
