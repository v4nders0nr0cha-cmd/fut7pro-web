import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/options";
import { prisma } from "@/server/prisma";

const DEFAULT_BACKEND_URL = "http://127.0.0.1:3333";

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ error: `Metodo ${req.method} nao permitido` });
  }

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "solicitacao_id_required" });
  }

  const session = await getServerSession(req, res, authOptions);
  const accessToken = (session as any)?.accessToken as string | undefined;
  if (!session || !accessToken) {
    return res.status(401).json({ error: "Nao autenticado" });
  }

  const tenantSlug = pickTenantSlug(session);
  const isLocalTest = accessToken === "local-test-token";

  if (isLocalTest) {
    const updated = await prisma.solicitacao.update({
      where: { id },
      data: { status: "APROVADA" },
    });
    return res.status(200).json({
      id: updated.id,
      status: updated.status,
    });
  }

  const base = getBackendBase();
  const url = `${base}/admin/solicitacoes/${encodeURIComponent(id)}/approve`;

  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    };
    if (tenantSlug) headers["x-tenant-slug"] = tenantSlug;

    const response = await fetch(url, {
      method: "PUT",
      headers,
      cache: "no-store",
    });

    const payload = await response
      .json()
      .catch(() => ({ error: "Erro inesperado ao processar resposta do backend" }));

    return res.status(response.status).json(payload);
  } catch (error) {
    return res.status(502).json({
      error: "backend_unavailable",
      detail: error instanceof Error ? error.message : "unknown_error",
    });
  }
}
