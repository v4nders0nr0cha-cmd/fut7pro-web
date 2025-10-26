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

export async function PUT(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.accessToken) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const slug =
    (session.user as any)?.tenantSlug ||
    (session.user as any)?.rachaSlug ||
    rachaConfig.slug;

  const endpoint = `${getBackendBase()}/memberships/${encodeURIComponent(params.id)}`;

  const response = await fetch(endpoint, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.user.accessToken}`,
      "x-tenant-slug": slug,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      (payload && typeof payload.error === "string" && payload.error) ||
      `backend_error_${response.status}`;
    return NextResponse.json({ error: message }, { status: response.status });
  }

  const payload = await response.json().catch(() => ({ ok: true }));
  return NextResponse.json(payload ?? { ok: true });
}
