import type { NextApiRequest, NextApiResponse } from "next";
import { backendUrl, resolveBackendAuth } from "@/server/backend-client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: `M�todo ${req.method} n�o permitido` });
    return;
  }

  try {
    const { headers } = await resolveBackendAuth(req, res);

    const backendResponse = await fetch(backendUrl("/api/sorteio/publicar"), {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(req.body ?? {}),
    });

    const contentType = backendResponse.headers.get("content-type");
    const hasBody = contentType && contentType.includes("application/json");
    const payload = hasBody ? await backendResponse.json() : undefined;

    if (!hasBody && backendResponse.status === 204) {
      res.status(204).end();
      return;
    }

    res.status(backendResponse.status).json(payload ?? {});
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      res.status(401).json({ error: "N�o autenticado" });
      return;
    }

    const message = error instanceof Error ? error.message : "Erro interno";
    res.status(500).json({ error: "Falha ao publicar sorteio", details: message });
  }
}
