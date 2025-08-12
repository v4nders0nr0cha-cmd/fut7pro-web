// src/pages/api/admin/rachas/[slug]/admins/index.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma"; // ajuste o path se seu prisma está em outro local
// import { getSession } from "next-auth/react"; // Descomente se for usar autenticação

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  // Auth opcional (exemplo):
  // const session = await getSession({ req });
  // if (!session) return res.status(401).json({ error: "Não autenticado" });

  // Primeiro, buscar o racha pelo slug
  const racha = await prisma.racha.findUnique({
    where: { slug: String(slug) },
    select: { id: true },
  });

  if (!racha) return res.status(404).json({ error: "Racha não encontrado" });

  if (req.method === "GET") {
    // Lista todos os admins do racha
    const admins = await prisma.rachaAdmin.findMany({
      where: { rachaId: racha.id },
      include: { usuario: true },
    });
    return res.status(200).json(
      admins.map((a) => ({
        id: a.id,
        usuarioId: a.usuarioId,
        nome: a.usuario?.nome,
        email: a.usuario?.email,
        role: a.role,
        status: a.status,
        criadoEm: a.criadoEm,
      }))
    );
  }

  if (req.method === "POST") {
    const { email, role } = req.body;
    if (!email || !role) return res.status(400).json({ error: "Dados obrigatórios não enviados" });

    // Busca usuário pelo e-mail (só pode adicionar admin já cadastrado)
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) return res.status(400).json({ error: "Usuário não encontrado" });

    // Evita duplicidade
    const exists = await prisma.rachaAdmin.findFirst({
      where: { usuarioId: usuario.id, rachaId: racha.id },
    });
    if (exists) return res.status(409).json({ error: "Usuário já é admin deste racha" });

    const novo = await prisma.rachaAdmin.create({
      data: {
        rachaId: racha.id,
        usuarioId: usuario.id,
        role,
        status: "ativo",
      },
    });
    return res.status(201).json({
      id: novo.id,
      usuarioId: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: novo.role,
      status: novo.status,
      criadoEm: novo.criadoEm,
    });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: "Método não permitido" });
}
