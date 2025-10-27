// src/pages/api/admin/atletas/me/estatisticas.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth/options";

export const config = { api: { bodyParser: false } };

function getBackendBase(): string {
  const base =
    process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || "http://127.0.0.1:3333";
  return String(base).replace(/\/$/, "");
}

function pickTenantSlug(session: any): string | undefined {
  return session?.user?.tenantSlug || (session as any)?.tenantSlug || session?.user?.rachaSlug;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Método ${req.method} não permitido` });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !(session as any).accessToken) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  const token = (session as any).accessToken as string;
  const tenantSlug = pickTenantSlug(session);
  const base = getBackendBase();

  // Preserva query string (ex.: ?temporada=2025)
  const qsIndex = req.url?.indexOf("?") ?? -1;
  const qs = qsIndex >= 0 ? req.url!.slice(qsIndex) : "";
  const url = `${base}/api/admin/atletas/me/estatisticas${qs}`;

  if (token === "local-test-token") {
    return res.status(200).json({
      temporadaAtual: { jogos: 0, gols: 0, assistencias: 0, campeaoDia: 0, mediaVitorias: 0, pontuacao: 0 },
      historico: { jogos: 0, gols: 0, assistencias: 0, campeaoDia: 0, mediaVitorias: 0, pontuacao: 0 },
    });
  }

  const upstream = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(tenantSlug ? { "x-tenant-slug": tenantSlug } : {}),
    },
    cache: "no-store",
  });

  const text = await upstream.text();
  res.status(upstream.status);
  const ct = upstream.headers.get("content-type");
  if (ct) res.setHeader("content-type", ct);
  res.send(text);
}
