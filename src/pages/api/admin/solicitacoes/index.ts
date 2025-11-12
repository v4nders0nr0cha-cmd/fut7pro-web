import type { NextApiRequest, NextApiResponse } from "next";
import { backendUrl, resolveBackendAuth } from "@/server/backend-client";

async function proxyJsonResponse(backendResponse: Response, res: NextApiResponse): Promise<void> {
  const contentType = backendResponse.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const body = isJson ? await backendResponse.json().catch(() => ({})) : undefined;

  if (backendResponse.status === 204 || !isJson) {
    res.status(backendResponse.status).end(isJson ? undefined : await backendResponse.text());
    return;
  }

  res.status(backendResponse.status).json(body ?? {});
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Método ${req.method} não permitido`);
    return;
  }

  try {
    const { headers } = await resolveBackendAuth(req, res);
    const url = new URL(backendUrl("/admin/solicitacoes"));

    const { status, count } = req.query;
    if (typeof status === "string" && status.length > 0) {
      url.searchParams.set("status", status);
    }
    if (typeof count === "string" && count.length > 0) {
      url.searchParams.set("count", count);
    }

    const backendResponse = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    await proxyJsonResponse(backendResponse, res);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      res.status(401).json({ error: "Não autenticado" });
      return;
    }

    const message = error instanceof Error ? error.message : "Erro interno";
    res.status(500).json({ error: "Falha ao comunicar com o backend", details: message });
  }
}
