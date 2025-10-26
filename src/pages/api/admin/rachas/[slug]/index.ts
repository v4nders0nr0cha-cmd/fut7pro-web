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

function mapResponse(data: any) {
  if (!data || typeof data !== "object") return data;
  return {
    ...data,
    autoAprovarAtletas:
      data.autoAprovarAtletas ?? data.autoApproveAthletes ?? data.auto_join_enabled ?? false,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;
  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "Slug obrigatorio" });
  }

  const session = await getServerSession(req, res, authOptions);
  const accessToken = (session as any)?.accessToken as string | undefined;
  if (!session || !accessToken) {
    return res.status(401).json({ error: "Nao autenticado" });
  }

  const isLocalTest = accessToken === "local-test-token";

  if (req.method === "GET") {
    if (isLocalTest) {
      const racha = await prisma.racha.findUnique({ where: { slug } });
      if (!racha) return res.status(404).json({ error: "Racha nao encontrado" });
      return res.status(200).json(mapResponse(racha));
    }

    try {
      const response = await fetch(`${getBackendBase()}/rachas/slug/${encodeURIComponent(slug)}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      const payload = await response
        .json()
        .catch(() => ({ error: "Erro inesperado ao processar resposta do backend" }));

      if (!response.ok) {
        return res.status(response.status).json(payload);
      }

      return res.status(200).json(mapResponse(payload));
    } catch (error) {
      return res.status(502).json({
        error: "backend_unavailable",
        detail: error instanceof Error ? error.message : "unknown_error",
      });
    }
  }

  if (req.method === "PATCH" || req.method === "PUT") {
    const {
      nome,
      descricao,
      logoUrl,
      tema,
      regras,
      ativo,
      financeiroVisivel,
      autoAprovarAtletas,
      cidade,
      estado,
    } = req.body ?? {};

    if (isLocalTest) {
      const updateData: Record<string, unknown> = {};
      if (nome !== undefined) updateData.nome = nome;
      if (descricao !== undefined) updateData.descricao = descricao;
      if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
      if (tema !== undefined) updateData.tema = tema;
      if (regras !== undefined) updateData.regras = regras;
      if (ativo !== undefined) updateData.ativo = ativo;
      if (financeiroVisivel !== undefined) updateData.financeiroVisivel = financeiroVisivel;
      if (autoAprovarAtletas !== undefined) updateData.autoAprovarAtletas = autoAprovarAtletas;
      if (cidade !== undefined) updateData.cidade = cidade;
      if (estado !== undefined) updateData.estado = estado;

      const updated = await prisma.racha.update({
        where: { slug },
        data: updateData,
      });
      return res.status(200).json(mapResponse(updated));
    }

    try {
      const backendPayload: Record<string, unknown> = {};
      if (nome !== undefined) backendPayload.name = nome;
      if (descricao !== undefined) backendPayload.description = descricao;
      if (logoUrl !== undefined) backendPayload.logoUrl = logoUrl;
      if (tema !== undefined) backendPayload.theme = tema;
      if (regras !== undefined) backendPayload.rules = regras;
      if (ativo !== undefined) backendPayload.active = ativo;
      if (financeiroVisivel !== undefined) backendPayload.financeVisible = financeiroVisivel;
      if (autoAprovarAtletas !== undefined) {
        backendPayload.autoApproveAthletes = autoAprovarAtletas;
      }
      if (cidade !== undefined) backendPayload.city = cidade;
      if (estado !== undefined) backendPayload.state = estado;

      const response = await fetch(
        `${getBackendBase()}/rachas/slug/${encodeURIComponent(slug)}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "content-type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
          body: JSON.stringify(backendPayload),
        },
      );

      const payload = await response
        .json()
        .catch(() => ({ error: "Erro inesperado ao processar resposta do backend" }));

      if (!response.ok) {
        return res.status(response.status).json(payload);
      }

      return res.status(200).json(mapResponse(payload));
    } catch (error) {
      return res.status(502).json({
        error: "backend_unavailable",
        detail: error instanceof Error ? error.message : "unknown_error",
      });
    }
  }

  res.setHeader("Allow", ["GET", "PATCH", "PUT"]);
  return res.status(405).json({ error: "Metodo nao permitido" });
}

