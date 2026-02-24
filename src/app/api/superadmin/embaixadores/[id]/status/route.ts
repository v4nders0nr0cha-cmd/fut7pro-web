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
    return jsonResponse({ error: "Embaixador invalido" }, { status: 400 });
  }

  const payload = (await request.json().catch(() => ({}))) as {
    status?: "ATIVO" | "BLOQUEADO";
    reason?: string;
    category?:
      | "FRAUDE_SPAM"
      | "VIOLACAO_REGRAS"
      | "AUTOINDICACAO"
      | "SOLICITACAO_EMBAIXADOR"
      | "DADOS_INVALIDOS"
      | "OUTROS";
  };

  if (payload.status !== "ATIVO" && payload.status !== "BLOQUEADO") {
    return jsonResponse({ error: "Status invalido" }, { status: 400 });
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
    `${getApiBase()}/superadmin/influencers/${encodeURIComponent(influencerId)}/status`,
    {
      method: "PATCH",
      headers: buildHeaders(user, undefined, { includeContentType: true }),
      body: JSON.stringify({
        status: payload.status,
        reason,
        category: category || undefined,
        ...resolveAuditContext(request),
      }),
      cache: "no-store",
    }
  );

  return forwardResponse(response.status, body);
}
