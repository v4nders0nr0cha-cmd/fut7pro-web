export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/options";
import { rachaConfig } from "@/config/racha.config";

const DEFAULT_BACKEND_URL = "http://127.0.0.1:3333";

function getBackendBase() {
  const candidate =
    process.env.API_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_BACKEND_URL;
  return candidate.replace(/\/+$/, "");
}

export async function GET(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.accessToken) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const slug =
    (session.user as any)?.tenantSlug ||
    (session.user as any)?.rachaSlug ||
    rachaConfig.slug;

  const backendUrl = `${getBackendBase()}/financeiro/export/csv`;

  const response = await fetch(backendUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.user.accessToken}`,
      "x-tenant-slug": slug,
      Accept: "text/csv",
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      (payload && typeof payload.error === "string" && payload.error) ||
      `backend_error_${response.status}`;
    return NextResponse.json({ error: message }, { status: response.status });
  }

  const csv = await response.text();
  const filename = `financeiro-${slug}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
