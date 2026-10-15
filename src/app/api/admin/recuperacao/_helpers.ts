import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
  resolveTenantSlug,
} from "../../_proxy/helpers";

const SAFE_RECOVERY_ID = /^[A-Za-z0-9_-]{1,128}$/;

export async function requireRecoveryContext() {
  const user = await requireUser({ scope: "admin" });
  if (!user) {
    return { response: jsonResponse({ message: "Não autenticado" }, { status: 401 }) } as const;
  }

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return {
      response: jsonResponse({ message: "Pelada ativa não identificada" }, { status: 400 }),
    } as const;
  }

  return {
    user,
    tenantSlug,
    headers: buildHeaders(user, tenantSlug),
  } as const;
}

export function isValidRecoveryId(id: string) {
  return SAFE_RECOVERY_ID.test(id);
}

export async function forwardRecoveryRequest(path: string, init: RequestInit) {
  const { response, body } = await proxyBackend(`${getApiBase()}${path}`, {
    ...init,
    cache: "no-store",
  });
  return forwardResponse(response.status, body);
}
