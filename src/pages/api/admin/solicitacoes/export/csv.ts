import type { NextApiRequest, NextApiResponse } from "next";
import { backendUrl, resolveBackendAuth } from "@/server/backend-client";

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
    const url = new URL(backendUrl("/admin/solicitacoes/export/csv"));

    const { status } = req.query;
    if (typeof status === "string" && status.length > 0) {
      url.searchParams.set("status", status);
    }

    const backendResponse = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    const text = await backendResponse.text();

    res.status(backendResponse.status);
    res.setHeader("Content-Type", backendResponse.headers.get("content-type") ?? "text/csv");
    const disposition = backendResponse.headers.get("content-disposition");
    if (disposition) {
      res.setHeader("Content-Disposition", disposition);
    }
    res.send(text);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      res.status(401).json({ error: "Não autenticado" });
      return;
    }

    const message = error instanceof Error ? error.message : "Erro interno";
    res.status(500).json({ error: "Falha ao comunicar com o backend", details: message });
  }
}
