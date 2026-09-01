import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireSuperAdminUser,
} from "../../../../_proxy/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ACTION_CATEGORIES = new Set([
  "FRAUDE_SPAM",
  "VIOLACAO_REGRAS",
  "AUTOINDICACAO",
  "SOLICITACAO_EMBAIXADOR",
  "DADOS_INVALIDOS",
  "NIVEL_CREATOR",
  "OUTROS",
]);

function resolveAuditContext(request: NextRequest) {
  const forwardedFor = String(request.headers.get("x-forwarded-for") || "");
  const forwardedIp = forwardedFor.split(",").map((item) => item.trim())[0] || "";
  const realIp = String(request.headers.get("x-real-ip") || "").trim();
  const ip = String(forwardedIp || realIp || "")
    .trim()
    .slice(0, 120);
  const userAgent = String(request.headers.get("user-agent") || "")
    .trim()
    .slice(0, 500);
  return {
    ip: ip || undefined,
    userAgent: userAgent || undefined,
  };
}

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const user = await requireSuperAdminUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  const influencerId = String(context?.params?.id || "").trim();
  if (!influencerId) {
    return jsonResponse({ error: "Creator invalido" }, { status: 400 });
  }

  const payload = (await request.json().catch(() => ({}))) as {
    manualMinimumLevel?: number;
    reason?: string;
    category?: string;
  };

  const manualMinimumLevel = Number(payload.manualMinimumLevel);
  if (![1, 2, 3, 4].includes(manualMinimumLevel)) {
    return jsonResponse({ error: "Nivel minimo manual invalido" }, { status: 400 });
  }

  const reason = String(payload.reason || "").trim();
  if (reason.length < 20) {
    return jsonResponse(
      { error: "Motivo obrigatorio com no minimo 20 caracteres." },
      { status: 400 }
    );
  }

  const category = String(payload.category || "").trim();
  if (category && !ACTION_CATEGORIES.has(category)) {
    return jsonResponse({ error: "Categoria invalida" }, { status: 400 });
  }

  const { response, body } = await proxyBackend(
    `${getApiBase()}/superadmin/influencers/${encodeURIComponent(influencerId)}/manual-level`,
    {
      method: "PATCH",
      headers: buildHeaders(user, undefined, { includeContentType: true }),
      body: JSON.stringify({
        manualMinimumLevel,
        reason,
        category: category || undefined,
        ...resolveAuditContext(request),
      }),
      cache: "no-store",
    }
  );

  return forwardResponse(response.status, body);
}
