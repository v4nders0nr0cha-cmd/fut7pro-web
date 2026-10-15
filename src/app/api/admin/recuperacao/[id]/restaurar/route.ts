import { jsonResponse } from "../../../../_proxy/helpers";
import { forwardRecoveryRequest, isValidRecoveryId, requireRecoveryContext } from "../../_helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRecoveryContext();
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  if (!isValidRecoveryId(id)) {
    return jsonResponse({ message: "Identificador inválido" }, { status: 400 });
  }

  return forwardRecoveryRequest(`/admin/recuperacao/${encodeURIComponent(id)}/restaurar`, {
    method: "POST",
    headers: auth.headers,
  });
}
