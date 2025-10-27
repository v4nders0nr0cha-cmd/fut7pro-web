// src/pages/api/admin/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import type { Role, RachaStatus } from "@prisma/client";
import { prisma } from "@/server/prisma";
const isProd = process.env.NODE_ENV === "production";
const isWebDirectDbDisabled =
  process.env.DISABLE_WEB_DIRECT_DB === "true" || process.env.DISABLE_WEB_DIRECT_DB === "1";

type RegisterBody = {
  // Racha
  nome?: string; // nome do racha
  slug?: string; // slug do racha
  cidade?: string; // cidade do racha
  estado?: string; // estado do racha (UF)
  logoUrl?: string; // opcional: logo do racha

  // Login
  email?: string; // email do presidente (Usuario + Jogador)
  senha?: string; // senha do presidente

  // Dados pessoais do presidente
  presidenteNome?: string; // nome (apenas primeiro nome)
  presidenteApelido?: string; // apelido (opcional)
  presidentePosicao?: string; // posição obrigatória
  presidenteFotoUrl?: string; // opcional: foto (url/dataurl)
};

type Ok = { message: string; rachaId: string };
type Err = { error: string };
type Res = Ok | Err;

const PRESIDENT_ROLE: Role = "PRESIDENTE";
const RACHA_STATUS_INATIVO: RachaStatus = "INATIVO";
const POSICAO_PADRAO = "ATACANTE" as const; // posição inicial do jogador do presidente

function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Res>) {
  if (isProd && isWebDirectDbDisabled) {
    return res.status(501).json({ error: "web_db_disabled: use API backend para admin/register" } as Err);
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método não permitido" });
  }

  const body = (req.body ?? {}) as RegisterBody;

  const nomeRacha = body.nome?.trim() ?? "";
  const slugInput = body.slug?.trim() ?? "";
  const emailInput = body.email?.trim() ?? "";
  const senha = body.senha ?? "";
  const presidenteNomeRaw = body.presidenteNome?.trim() ?? "";
  const presidenteApelido = body.presidenteApelido?.trim() ?? "";
  const presidentePosicao = body.presidentePosicao?.trim().toUpperCase() ?? "";
  const presidenteFotoUrl = body.presidenteFotoUrl?.trim() || null;
  const logoUrl = body.logoUrl?.trim() || null;
  const cidade = body.cidade?.trim() ?? "";
  const estado = body.estado?.trim().toUpperCase() ?? "";

  // ---- validações básicas
  if (nomeRacha.length < 3 || nomeRacha.length > 64) {
    return res.status(400).json({ error: "Nome do racha deve ter entre 3 e 64 caracteres" });
  }
  if (presidenteNomeRaw.length < 2 || presidenteNomeRaw.length > 60) {
    return res.status(400).json({ error: "Nome do presidente deve ter entre 2 e 60 caracteres" });
  }
  if (presidenteApelido && (presidenteApelido.length < 2 || presidenteApelido.length > 20)) {
    return res.status(400).json({ error: "Apelido deve ter entre 2 e 20 caracteres" });
  }
  if (!presidentePosicao) {
    return res.status(400).json({ error: "Posição do presidente é obrigatória" });
  }
  if (!cidade || !estado) {
    return res.status(400).json({ error: "Cidade e estado do racha são obrigatórios" });
  }
  if (!emailInput || !emailInput.includes("@")) {
    return res.status(400).json({ error: "Email inválido" });
  }
  if (senha.length < 8) {
    return res.status(400).json({ error: "Senha deve ter pelo menos 8 caracteres" });
  }

  const slug = normalizeSlug(slugInput);
  if (slug.length < 3 || slug.length > 32) {
    return res.status(400).json({ error: "Slug deve ter entre 3 e 32 caracteres" });
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res
      .status(400)
      .json({ error: "Slug deve conter apenas letras minúsculas, números e hífens" });
  }

  const email = emailInput.toLowerCase();
  // apenas o primeiro nome
  const presidenteNome = presidenteNomeRaw.split(/\s+/)[0];

  try {
    // conflitos óbvios
    const [existingRacha, existingUser] = await prisma.$transaction([
      prisma.racha.findUnique({ where: { slug } }),
      prisma.usuario.findUnique({ where: { email } }),
    ]);

    if (existingRacha) {
      return res.status(409).json({ error: "Slug já está em uso" });
    }
    if (existingUser) {
      // Opção conservadora: não sobrescreve usuário existente nessa rota pública
      return res.status(409).json({ error: "Email já está cadastrado" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    // transação: cria Usuario + Racha + RachaAdmin + (reusa ou cria) Jogador + RachaJogador
    const result = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          nome: presidenteNome,
          apelido: presidenteApelido,
          email,
          senhaHash,
          role: PRESIDENT_ROLE,
          status: "ativo",
        },
      });

      const racha = await tx.racha.create({
        data: {
          nome: nomeRacha,
          slug,
          cidade,
          estado,
          ownerId: usuario.id,
          ativo: false,
          status: RACHA_STATUS_INATIVO,
          logoUrl: logoUrl ?? undefined,
        },
      });

      await tx.rachaAdmin.create({
        data: {
          rachaId: racha.id,
          usuarioId: usuario.id,
          role: "PRESIDENTE",
          status: "ativo",
        },
      });

      // Jogador: reaproveita por email ou cria novo
      let jogador = await tx.jogador.findUnique({ where: { email } });
      if (!jogador) {
        jogador = await tx.jogador.create({
          data: {
            nome: presidenteNome,
            apelido: presidenteApelido,
            email,
            posicao: presidentePosicao || POSICAO_PADRAO,
            foto: presidenteFotoUrl ?? undefined,
            status: "ativo",
          },
        });
      }

      // Vincula Jogador ao Racha (idempotente com unique no par rachaId+jogadorId, se existir)
      // Se não tiver unique no schema, este create simples funciona; se tiver, você pode trocar por upsert-like.
      await tx.rachaJogador.create({
        data: {
          rachaId: racha.id,
          jogadorId: jogador.id,
        },
      });

      return { rachaId: racha.id };
    });

    return res.status(201).json({
      message:
        "Cadastro recebido! Vamos validar os dados e liberar o acesso em breve. Você já está configurado como presidente e jogador do racha.",
      rachaId: result.rachaId,
    });
  } catch (err: any) {
    // Trata conflito de unique (caso você adicione @@unique([rachaId, jogadorId]) e a chamada seja repetida)
    const msg = typeof err?.message === "string" ? err.message : String(err);
    if (msg.includes("Unique constraint failed")) {
      // cenário: RachaJogador já existe; considere sucesso
      return res.status(201).json({
        message:
          "Cadastro processado. Vinculações já existiam ou foram criadas. Aguardando liberação do racha.",
        rachaId:
          (await prisma.racha.findUnique({ where: { slug }, select: { id: true } }))?.id ?? "",
      });
    }

    console.error("POST /api/admin/register failed", err);
    return res.status(500).json({ error: "Erro interno ao cadastrar racha" });
  }
}
