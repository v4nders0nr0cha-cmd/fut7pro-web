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

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const payload = await req.text();

  const { response, body } = await proxyBackend(
    `${getApiBase()}/superadmin/integracoes/${params.slug}`,
    {
      method: "PUT",
      headers: buildHeaders(user, undefined, { includeContentType: true }),
      body: payload,
    }
  );

  return forwardResponse(response.status, body);
}
