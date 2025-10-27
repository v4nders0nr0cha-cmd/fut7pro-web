import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/options";
import { prisma } from "@/server/prisma";

const DEFAULT_BACKEND_URL = "http://127.0.0.1:3333";
const ALLOWED_STATUS = new Set(["PENDENTE", "APROVADA", "REJEITADA"]);

function getBackendBase(): string {
  const base =
    process.env.API_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_BACKEND_URL;
  return base.replace(/\/+$/, "");
}

function pickTenantSlug(session: any): string | undefined {
  return (
    session?.tenantSlug ||
    session?.rachaSlug ||
    session?.user?.tenantSlug ||
    session?.user?.rachaSlug
  );
}

function normalizeStatus(value?: string | null): string | undefined {
  if (!value) return undefined;
  const upper = value.toUpperCase();
  return ALLOWED_STATUS.has(upper) ? upper : undefined;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Metodo ${req.method} nao permitido` });
  }

  const session = await getServerSession(req, res, authOptions);
  const accessToken = (session as any)?.accessToken as string | undefined;
  if (!session || !accessToken) {
    return res.status(401).json({ error: "Nao autenticado" });
  }

  const tenantSlug = pickTenantSlug(session);
  const statusParam = normalizeStatus(
    typeof req.query.status === "string" ? req.query.status : undefined,
  );
  const wantsCount = typeof req.query.count !== "undefined";
  const isLocalTest = accessToken === "local-test-token";

  if (isLocalTest) {
    if (!tenantSlug) {
      return res.status(400).json({ error: "tenant_slug_required" });
    }

    if (wantsCount) {
      const total = await prisma.solicitacao.count({
        where: {
          racha: { slug: tenantSlug },
          ...(statusParam ? { status: statusParam } : {}),
        },
      });
      return res.status(200).json({ count: total });
    }

    const items = await prisma.solicitacao.findMany({
      where: {
        racha: { slug: tenantSlug },
        ...(statusParam ? { status: statusParam } : {}),
      },
      orderBy: { criadoEm: "desc" },
      take: 100,
    });

    return res.status(200).json(
      items.map((item) => ({
        id: item.id,
        nome: item.nome,
        apelido: item.apelido,
        email: item.email,
        posicao: item.posicao,
        fotoUrl: item.fotoUrl,
        status: item.status,
        criadoEm: item.criadoEm,
      })),
    );
  }

  const base = getBackendBase();
  const params = new URLSearchParams();
  if (statusParam) params.set("status", statusParam);
  if (wantsCount) params.set("count", "1");
  const url = `${base}/admin/solicitacoes${params.toString() ? `?${params.toString()}` : ""}`;

  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    };
    if (tenantSlug) headers["x-tenant-slug"] = tenantSlug;

    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const payload = await response
      .json()
      .catch(() => ({ error: "Erro inesperado ao processar resposta do backend" }));

    if (!response.ok) {
      return res.status(response.status).json(payload);
    }

    if (wantsCount) {
      return res.status(200).json(payload);
    }

    const items = Array.isArray(payload) ? payload : [];
    const normalized = items.map((item: any) => ({
      id: item.id,
      nome: item.nome ?? item.name ?? "",
      apelido: item.apelido ?? item.nickname ?? null,
      email: item.email ?? "",
      posicao: item.posicao ?? item.position ?? "",
      fotoUrl: item.fotoUrl ?? item.photoUrl ?? null,
      status: item.status ?? "PENDENTE",
      criadoEm: item.criadoEm ?? item.createdAt ?? null,
    }));

    return res.status(200).json(normalized);
  } catch (error) {
    return res.status(502).json({
      error: "backend_unavailable",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }
}
