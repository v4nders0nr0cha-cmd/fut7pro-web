// src/pages/api/admin/jogadores.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { backendUrl, resolveBackendAuth } from "@/server/backend-client";

async function proxyJsonResponse(backendResponse: Response, res: NextApiResponse): Promise<void> {
  const contentType = backendResponse.headers.get("content-type");
  const hasBody = contentType && contentType.includes("application/json");

  const body = hasBody ? await backendResponse.json() : undefined;

  if (!hasBody && backendResponse.status === 204) {
    res.status(204).end();
    return;
  }

  res.status(backendResponse.status).json(body ?? {});
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    const querySlug = typeof req.query.slug === "string" ? req.query.slug : undefined;
    const { headers, tenantSlug } = await resolveBackendAuth(req, res, querySlug);

    if (!tenantSlug) {
      return res.status(400).json({ error: "Tenant slug n�o informado" });
    }

    const baseUrl = backendUrl("/api/jogadores");

    if (req.method === "GET") {
      const backendResponse = await fetch(baseUrl, {
        method: "GET",
        headers,
      });
      await proxyJsonResponse(backendResponse, res);
      return;
    }

    if (req.method === "POST") {
      const backendResponse = await fetch(baseUrl, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(req.body ?? {}),
      });
      await proxyJsonResponse(backendResponse, res);
      return;
    }

    if (req.method === "PUT") {
      const { id, ...payload } = req.body ?? {};
      if (!id || typeof id !== "string") {
        res.status(400).json({ error: "ID do jogador � obrigat�rio para atualiza��o" });
        return;
      }

      const backendResponse = await fetch(`${baseUrl}/${id}`, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await proxyJsonResponse(backendResponse, res);
      return;
    }

    if (req.method === "DELETE") {
      const { id } = req.body ?? {};
      if (!id || typeof id !== "string") {
        res.status(400).json({ error: "ID do jogador � obrigat�rio para exclus�o" });
        return;
      }

      const backendResponse = await fetch(`${baseUrl}/${id}`, {
        method: "DELETE",
        headers,
      });
      await proxyJsonResponse(backendResponse, res);
      return;
    }

    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    res.status(405).end(`M�todo ${req.method} n�o permitido`);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      res.status(401).json({ error: "N�o autenticado" });
      return;
    }

    const message = error instanceof Error ? error.message : "Erro interno";
    res.status(500).json({ error: "Falha ao comunicar com o backend", details: message });
  }
}
