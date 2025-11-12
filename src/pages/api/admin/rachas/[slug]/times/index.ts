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
  const slug = typeof req.query.slug === "string" ? req.query.slug : undefined;

  if (!slug) {
    res.status(400).json({ error: "Slug � obrigat�rio" });
    return;
  }

  try {
    const { headers } = await resolveBackendAuth(req, res, slug);
    const baseUrl = backendUrl("/api/times");

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

    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: `M�todo ${req.method} n�o permitido` });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      res.status(401).json({ error: "N�o autenticado" });
      return;
    }

    const message = error instanceof Error ? error.message : "Erro interno";
    res.status(500).json({ error: "Falha ao comunicar com o backend", details: message });
  }
}
