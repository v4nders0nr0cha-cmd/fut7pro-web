import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireSuperAdminUser,
} from "../../../../../_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const id = context.params.id;
  if (!id) {
    return jsonResponse({ error: "ID invalido" }, { status: 400 });
  }

  const payload = await req.text();
  const { response, body } = await proxyBackend(
    `${getApiBase()}/superadmin/support/tickets/${id}/cancelamento-racha/aprovar`,
    {
      method: "POST",
      headers: buildHeaders(user, undefined, { includeContentType: true }),
      body: payload,
    }
  );

  return forwardResponse(response.status, body);
}
