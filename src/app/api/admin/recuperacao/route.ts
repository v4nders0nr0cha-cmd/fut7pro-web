import { NextRequest } from "next/server";
import { jsonResponse } from "../../_proxy/helpers";
import { forwardRecoveryRequest, requireRecoveryContext } from "./_helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ENTITY_TYPES = new Set(["ATHLETE", "TEAM", "COMUNICADO"]);
const OPERATION_TYPES = new Set(["ARCHIVE", "DELETE"]);

function parsePositiveInteger(value: string | null, fallback: number, max?: number) {
  if (value === null) return fallback;
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || (max && parsed > max)) return null;
  return parsed;
}

export async function GET(request: NextRequest) {
  const context = await requireRecoveryContext();
  if ("response" in context) return context.response;

  const source = request.nextUrl.searchParams;
  const entityType = source.get("entityType");
  const operationType = source.get("operationType");
  const page = parsePositiveInteger(source.get("page"), 1);
  const limit = parsePositiveInteger(source.get("limit"), 20, 50);

  if (
    (entityType && !ENTITY_TYPES.has(entityType)) ||
    (operationType && !OPERATION_TYPES.has(operationType)) ||
    page === null ||
    limit === null
  ) {
    return jsonResponse({ message: "Filtros de recuperação inválidos" }, { status: 400 });
  }

  const target = new URL("/admin/recuperacao", "https://fut7pro.internal");
  if (entityType) target.searchParams.set("entityType", entityType);
  if (operationType) target.searchParams.set("operationType", operationType);
  target.searchParams.set("page", String(page));
  target.searchParams.set("limit", String(limit));

  return forwardRecoveryRequest(`${target.pathname}${target.search}`, {
    method: "GET",
    headers: context.headers,
  });
}
