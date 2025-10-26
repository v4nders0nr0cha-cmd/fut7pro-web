import type { NextApiRequest, NextApiResponse } from "next";

export const config = { api: { bodyParser: true } };

const DEFAULT_BACKEND_URL = "http://127.0.0.1:3333";

type Body = {
  rachaSlug?: string;
  nome?: string;
  apelido?: string;
  email?: string;
  posicao?: string;
  fotoUrl?: string | null;
  mensagem?: string | null;
};

function resolveBackendBase() {
  const base =
    process.env.API_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_BACKEND_URL;
  return base.replace(/\/+$/, "");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Metodo ${req.method} nao permitido` });
  }

  const { rachaSlug, nome, apelido, email, posicao, fotoUrl, mensagem } = (req.body ?? {}) as Body;

  if (!rachaSlug || typeof rachaSlug !== "string") {
    return res.status(400).json({ error: "Slug do racha e obrigatorio" });
  }
  if (!nome || String(nome).trim().length < 3) {
    return res.status(400).json({ error: "Nome do atleta e obrigatorio" });
  }
  if (!email || !String(email).includes("@")) {
    return res.status(400).json({ error: "E-mail invalido" });
  }

  const backendUrl = `${resolveBackendBase()}/public/${encodeURIComponent(rachaSlug)}/athlete-requests`;

  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        nome: nome.trim(),
        apelido: apelido?.trim() || undefined,
        email: email.trim().toLowerCase(),
        posicao: (posicao ?? "Atacante").trim(),
        fotoUrl: fotoUrl ?? undefined,
        mensagem: mensagem?.trim() || undefined,
      }),
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

