// src/pages/api/admin/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import type { Role, RachaStatus } from "@prisma/client";
import { prisma } from "@/server/prisma";

const isProd = process.env.NODE_ENV === "production";
const isWebDirectDbDisabled =
  process.env.DISABLE_WEB_DIRECT_DB === "true" || process.env.DISABLE_WEB_DIRECT_DB === "1";

type RegisterBody = {
  nome?: string;
  slug?: string;
  email?: string;
  senha?: string;
  presidenteNome?: string;
  presidenteApelido?: string;
};

type RegisterResponse = { message: string; rachaId: string } | { error: string };

const PRESIDENT_ROLE: Role = "PRESIDENTE";
const RACHA_STATUS_INATIVO: RachaStatus = "INATIVO";
const DEFAULT_POSICAO = "Atacante"; // posição padrão do Jogador

function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<RegisterResponse>) {
  if (isProd && isWebDirectDbDisabled) {
    return res
      .status(501)
      .json({ error: "web_db_disabled: use a API do backend para registro de racha" } as any);
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Metodo nao permitido" });
  }

  const body = (req.body ?? {}) as RegisterBody;

  const nomeRacha = body.nome?.trim() ?? "";
  const slugInput = body.slug?.trim() ?? "";
  const emailInput = body.email?.trim() ?? "";
  const senha = body.senha ?? "";
  const presidenteNome = body.presidenteNome?.trim() ?? "";
  const presidenteApelido = body.presidenteApelido?.trim() ?? "";

  // --- validações básicas
  if (nomeRacha.length < 3 || nomeRacha.length > 64) {
    return res.status(400).json({ error: "Nome do racha deve ter entre 3 e 64 caracteres" });
  }
  if (presidenteNome.length < 3 || presidenteNome.length > 60) {
    return res.status(400).json({ error: "Nome do presidente deve ter entre 3 e 60 caracteres" });
  }
  if (presidenteApelido.length < 2 || presidenteApelido.length > 20) {
    return res.status(400).json({ error: "Apelido deve ter entre 2 e 20 caracteres" });
  }
  if (!emailInput || !emailInput.includes("@")) {
    return res.status(400).json({ error: "Email invalido" });
  }
  if (senha.length < 8) {
    return res.status(400).json({ error: "Senha deve ter pelo menos 8 caracteres" });
  }

  const normalizedSlug = normalizeSlug(slugInput);
  if (normalizedSlug.length < 3 || normalizedSlug.length > 32) {
    return res.status(400).json({ error: "Slug deve ter entre 3 e 32 caracteres" });
  }
  if (!/^[a-z0-9-]+$/.test(normalizedSlug)) {
    return res
      .status(400)
      .json({ error: "Slug deve conter apenas letras minusculas, numeros e hifens" });
  }

  const normalizedEmail = emailInput.toLowerCase();

  try {
    // checagens de unicidade (slug e email do usuário)
    const [existingSlug, existingUser] = await prisma.$transaction([
      prisma.racha.findUnique({ where: { slug: normalizedSlug } }),
      prisma.usuario.findUnique({ where: { email: normalizedEmail } }),
    ]);

    if (existingSlug) {
      return res.status(409).json({ error: "Slug ja esta em uso" });
    }
    if (existingUser) {
      return res.status(409).json({ error: "Email ja esta cadastrado" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const { rachaId } = await prisma.$transaction(async (tx) => {
      // 1) Usuario (presidente)
      const usuario = await tx.usuario.create({
        data: {
          nome: presidenteNome,
          apelido: presidenteApelido,
          email: normalizedEmail,
          senhaHash,
          role: PRESIDENT_ROLE,
          // schema usa string para status; manter "ativo" (ou personalize depois)
          status: "ativo",
        },
        select: { id: true, nome: true, apelido: true, email: true },
      });

      // 2) Racha (inativo por padrão; aprovação manual)
      const racha = await tx.racha.create({
        data: {
          nome: nomeRacha,
          slug: normalizedSlug,
          ownerId: usuario.id,
          ativo: false,
          status: RACHA_STATUS_INATIVO,
        },
        select: { id: true },
      });

      // 3) Vínculo administrativo
      await tx.rachaAdmin.create({
        data: {
          rachaId: racha.id,
          usuarioId: usuario.id,
          role: "PRESIDENTE",
          status: "ativo",
        },
      });

      // 4) Jogador (reaproveita pelo e-mail; cria se não existir)
      let jogador = await tx.jogador.findUnique({
        where: { email: usuario.email },
        select: { id: true },
      });

      if (!jogador) {
        jogador = await tx.jogador.create({
          data: {
            nome: usuario.nome,
            apelido: usuario.apelido,
            email: usuario.email, // mantém o mesmo e-mail do usuário
            posicao: DEFAULT_POSICAO,
          },
          select: { id: true },
        });
      }

      // 5) Vínculo Jogador↔Racha (evita duplicar)
      const jaVinculado = await tx.rachaJogador.findFirst({
        where: { rachaId: racha.id, jogadorId: jogador.id },
        select: { id: true },
      });

      if (!jaVinculado) {
        await tx.rachaJogador.create({
          data: { rachaId: racha.id, jogadorId: jogador.id },
        });
      }

      return { rachaId: racha.id };
    });

    return res.status(201).json({
      message: "Cadastro recebido. Nossa equipe vai validar os dados e liberar o acesso em breve.",
      rachaId,
    });
  } catch (error) {
    console.error("POST /api/admin/register failed", error);
    return res.status(500).json({ error: "Erro interno ao cadastrar racha" });
  }
}
