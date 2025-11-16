import { NextRequest } from "next/server";
import { Role } from "@/common/enums";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
} from "../../admin/_proxy/helpers";

type ForwardOptions = {
  method?: string;
  body?: string;
  includeContentType?: boolean;
};

export async function forwardSuperAdminRequest(
  req: NextRequest,
  upstreamPath: string,
  options?: ForwardOptions
) {
  const user = await requireUser();

  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  if (user.role !== Role.SUPERADMIN) {
    return jsonResponse({ error: "Apenas SuperAdmin pode acessar este recurso." }, { status: 403 });
  }

  const base = getApiBase();
  const url = new URL(`${base}${upstreamPath}`);
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers = buildHeaders(user, null, {
    includeContentType: options?.includeContentType ?? Boolean(options?.body),
  });

  const { response, body } = await proxyBackend(url.toString(), {
    method: options?.method ?? "GET",
    body: options?.body,
    headers,
  });

  return forwardResponse(response.status, body);
}
