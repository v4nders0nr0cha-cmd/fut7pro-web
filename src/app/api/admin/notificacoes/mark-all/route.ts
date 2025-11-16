import { getApiBase } from "@/lib/get-api-base";
import {
  jsonResponse,
  requireUser,
  resolveTenantSlug,
  buildHeaders,
  proxyBackend,
  ensureTenantId,
} from "../../_proxy/helpers";

const NOTIFICATIONS_ENDPOINT = "/notificacoes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH() {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Não autenticado" }, { status: 401 });
  }

  const tenantSlug = resolveTenantSlug(user);
  if (!tenantSlug) {
    return jsonResponse({ error: "tenantSlug obrigatório" }, { status: 400 });
  }

  const base = getApiBase();
  const listUrl = `${base}${NOTIFICATIONS_ENDPOINT}`;

  try {
    const listHeaders = buildHeaders(user, tenantSlug, { includeContentType: false });
    const { response, body } = await proxyBackend(listUrl, { method: "GET", headers: listHeaders });

    if (!response.ok) {
      return jsonResponse(
        {
          error: "Falha ao buscar notificações",
          status: response.status,
          details: body ? safeParseError(body) : undefined,
        },
        { status: response.status }
      );
    }

    const notifications = parseNotificationList(body);
    if (!notifications) {
      return jsonResponse({ error: "Resposta inválida do backend" }, { status: 502 });
    }

    const unread = notifications.filter(
      (item) => item && typeof item.id === "string" && !item.isRead
    );
    if (unread.length === 0) {
      return jsonResponse({ updated: 0 }, { status: 200 });
    }

    const tenantId = ensureTenantId(user, null);
    let failures = 0;

    await Promise.all(
      unread.map(async (item) => {
        const updateUrl = `${base}${NOTIFICATIONS_ENDPOINT}/${encodeURIComponent(item.id)}`;
        const headers = buildHeaders(user, tenantSlug);
        const bodyPayload: Record<string, unknown> = { isRead: true };
        if (tenantId) {
          bodyPayload.tenantId = tenantId;
        }

        try {
          const res = await fetch(updateUrl, {
            method: "PUT",
            headers,
            body: JSON.stringify(bodyPayload),
          });
          if (!res.ok) {
            failures += 1;
          }
        } catch {
          failures += 1;
        }
      })
    );

    if (failures > 0) {
      return jsonResponse(
        {
          error: "Falha ao marcar algumas notificações",
          updated: unread.length - failures,
          failed: failures,
        },
        { status: 207 }
      );
    }

    return jsonResponse({ updated: unread.length }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse(
      { error: "Falha ao marcar notificações", details: message },
      { status: 500 }
    );
  }
}

function safeParseError(body: string) {
  try {
    const parsed = JSON.parse(body);
    if (parsed && typeof parsed === "object" && "error" in parsed) {
      return parsed.error;
    }
    return body;
  } catch {
    return body;
  }
}

function parseNotificationList(body: string | null) {
  if (!body) return [];
  try {
    const parsed = JSON.parse(body);
    if (Array.isArray(parsed)) {
      return parsed as Array<{ id: string; isRead?: boolean }>;
    }
    return null;
  } catch {
    return null;
  }
}
