import type { NextApiRequest, NextApiResponse } from "next";
import { backendUrl, resolveBackendAuth } from "@/server/backend-client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).end(`Método ${req.method} não permitido`);
    return;
  }

  const { id } = req.query;
  if (typeof id !== "string" || id.length === 0) {
    res.status(400).json({ error: "ID da solicitação é obrigatório" });
    return;
  }

  try {
    const { headers } = await resolveBackendAuth(req, res);
    const backendResponse = await fetch(backendUrl(`/admin/solicitacoes/${id}/approve`), {
      method: "PUT",
      headers,
    });

    const contentType = backendResponse.headers.get("content-type");
    const isJson = contentType?.includes("application/json");
    const body = isJson ? await backendResponse.json().catch(() => ({})) : undefined;

    if (backendResponse.status === 204 || !isJson) {
      res.status(backendResponse.status).end(isJson ? undefined : await backendResponse.text());
      return;
    }

    res.status(backendResponse.status).json(body ?? {});
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      res.status(401).json({ error: "Não autenticado" });
      return;
    }

    const message = error instanceof Error ? error.message : "Erro interno";
    res.status(500).json({ error: "Falha ao comunicar com o backend", details: message });
  }
}
