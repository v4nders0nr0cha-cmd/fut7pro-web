import { NextRequest } from "next/server";
import { jsonResponse, requireUser, resolveTenantSlug } from "../../../_proxy/helpers";
import { triggerPublicRevalidate } from "../../../_proxy/revalidate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(_req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return jsonResponse({ error: "Slug do racha obrigatorio" }, { status: 400 });
  }

  await triggerPublicRevalidate(tenantSlug);

  return jsonResponse({
    ok: true,
    slug: tenantSlug,
    timestamp: new Date().toISOString(),
  });
}
