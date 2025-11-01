// src/pages/api/register.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { backendUrl } from "@/server/backend-client";

function resolveTenantSlug(req: NextApiRequest): string | null {
  if (typeof req.query.slug === "string" && req.query.slug.trim().length > 0) {
    return req.query.slug.trim();
  }

  if (typeof req.body?.slug === "string" && req.body.slug.trim().length > 0) {
    return req.body.slug.trim();
  }

  if (process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG) {
    return process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG.trim();
  }

  if (process.env.DEFAULT_TENANT_SLUG) {
    return process.env.DEFAULT_TENANT_SLUG.trim();
  }

  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Método ${req.method} não permitido.` });
  }

  const slug = resolveTenantSlug(req);
  if (!slug) {
    return res.status(400).json({ message: "Slug do racha não informado." });
  }

  const { nome, apelido, email, posicao, mensagem, fotoUrl } = req.body ?? {};

  if (!nome || !email || !posicao) {
    return res.status(400).json({ message: "Nome, e-mail e posição são obrigatórios." });
  }

  const payload = {
    nome: String(nome).trim(),
    apelido: typeof apelido === "string" && apelido.trim().length > 0 ? apelido.trim() : undefined,
    email: String(email).trim().toLowerCase(),
    posicao: String(posicao).trim(),
    mensagem:
      typeof mensagem === "string" && mensagem.trim().length > 0 ? mensagem.trim() : undefined,
    fotoUrl: typeof fotoUrl === "string" && fotoUrl.trim().length > 0 ? fotoUrl.trim() : undefined,
  };

  try {
    const backendResponse = await fetch(
      backendUrl(`/public/${encodeURIComponent(slug)}/athlete-requests`),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const contentType = backendResponse.headers.get("content-type");
    const isJson = contentType?.includes("application/json");
    const body = isJson ? await backendResponse.json().catch(() => ({})) : undefined;

    if (!isJson) {
      const text = await backendResponse.text();
      res.status(backendResponse.status).send(text);
      return;
    }

    res.status(backendResponse.status).json(body ?? {});
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    res.status(500).json({ message: "Erro ao registrar solicitação de atleta.", details: message });
  }
}
