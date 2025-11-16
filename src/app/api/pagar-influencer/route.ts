import { NextRequest } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import {
  buildHeaders,
  forwardResponse,
  jsonResponse,
  proxyBackend,
  requireUser,
} from "../admin/_proxy/helpers";

const ENDPOINT = "/superadmin/influencers/pagamentos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type IncomingPayload = {
  influencerId?: string;
  valor?: number | string;
  observacao?: string | null;
};

function normalizePayload(body: IncomingPayload) {
  const influencerId = body.influencerId?.trim();
  const amount =
    typeof body.valor === "string" ? Number.parseFloat(body.valor) : Number(body.valor);
  if (!influencerId || Number.isNaN(amount)) {
    return null;
  }
  return {
    influencerId,
    amount,
    note: body.observacao?.trim() || undefined,
  };
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  let payload: IncomingPayload | null = null;
  try {
    payload = (await req.json()) as IncomingPayload;
  } catch {
    payload = null;
  }

  if (!payload) {
    return jsonResponse({ error: "Corpo da requisicao obrigatorio" }, { status: 400 });
  }

  const normalized = normalizePayload(payload);
  if (!normalized) {
    return jsonResponse({ error: "influencerId e valor sao obrigatorios" }, { status: 400 });
  }

  try {
    const headers = buildHeaders(user, null);
    const { response, body } = await proxyBackend(`${getApiBase()}${ENDPOINT}`, {
      method: "POST",
      headers,
      body: JSON.stringify(normalized),
    });
    return forwardResponse(response.status, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse(
      { error: "Falha ao registrar pagamento", details: message },
      { status: 500 }
    );
  }
}
