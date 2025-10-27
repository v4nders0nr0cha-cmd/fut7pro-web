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

function mapMembershipToSolicitacao(item: any) {
  const createdAt = item?.createdAt
    ? new Date(item.createdAt).toISOString()
    : new Date().toISOString();

  return {
    id: item?.id ?? "",
    nome: item?.user?.name ?? item?.user?.email ?? "Jogador",
    apelido: null,
    email: item?.user?.email ?? "",
    posicao: "Não informado",
    fotoUrl: item?.user?.image ?? null,
    status: (item?.status ?? "PENDENTE").toUpperCase(),
    criadoEm: createdAt,
  };
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.accessToken) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status")?.toUpperCase() ?? undefined;
  const countOnly = searchParams.get("count") === "1";

  const slug =
    (session.user as any)?.tenantSlug ||
    (session.user as any)?.rachaSlug ||
    rachaConfig.slug;

  const headers: HeadersInit = {
    Authorization: `Bearer ${session.user.accessToken}`,
    "x-tenant-slug": slug,
    Accept: "application/json",
  };

  const base = getBackendBase();
  let endpoint = `${base}/memberships`;

  if (status === "PENDENTE") {
    endpoint = `${base}/memberships/pending`;
  } else if (status) {
    const params = new URLSearchParams({ status });
    endpoint = `${base}/memberships?${params.toString()}`;
  }

  const response = await fetch(endpoint, { headers });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      (payload && typeof payload.error === "string" && payload.error) ||
      `backend_error_${response.status}`;
    return NextResponse.json({ error: message }, { status: response.status });
  }

  const raw = await response.json();
  const list = Array.isArray(raw) ? raw : raw?.data ?? [];
  const mapped = list.map(mapMembershipToSolicitacao);

  if (countOnly) {
    return NextResponse.json({ count: mapped.length });
  }

  return NextResponse.json(mapped);
}
