import { NextResponse } from "next/server";
import { getApiBase } from "@/lib/get-api-base";
import { buildHeaders, jsonResponse, requireUser } from "../admin/_proxy/helpers";

const ENDPOINT = "/superadmin/influencers/cupom-usos/export";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return jsonResponse({ error: "Nao autenticado" }, { status: 401 });
  }

  try {
    const headers = buildHeaders(user, null, { includeContentType: false });
    const response = await fetch(`${getApiBase()}${ENDPOINT}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok || !response.body) {
      const text = await response.text().catch(() => "");
      return jsonResponse(
        { error: text || "Falha ao exportar cupom-usos" },
        { status: response.status }
      );
    }

    const proxiedHeaders = new Headers();
    const contentType = response.headers.get("content-type");
    if (contentType) {
      proxiedHeaders.set("Content-Type", contentType);
    }
    const disposition = response.headers.get("content-disposition");
    if (disposition) {
      proxiedHeaders.set("Content-Disposition", disposition);
    } else {
      proxiedHeaders.set("Content-Disposition", 'attachment; filename="influencers_cupom_uso.csv"');
    }
    proxiedHeaders.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    proxiedHeaders.set("Pragma", "no-cache");
    proxiedHeaders.set("Expires", "0");

    return new NextResponse(response.body, {
      status: response.status,
      headers: proxiedHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse(
      { error: "Falha ao exportar cupom-usos", details: message },
      { status: 500 }
    );
  }
}
