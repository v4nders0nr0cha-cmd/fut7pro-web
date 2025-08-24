// src/pages/api/register.ts

import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma"; // certifique-se que este arquivo existe: src/lib/prisma.ts

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { nome, apelido, email, senha } = req.body;

  if (!nome || !apelido || !email || !senha) {
    return res.status(400).json({ message: "Campos obrigatórios ausentes." });
  }

  if (nome.length > 10 || apelido.length > 10) {
    return res
      .status(400)
      .json({ message: "Nome e Apelido devem ter no máximo 10 letras." });
  }

  try {
    const existing = await prisma.usuario.findUnique({ where: { email } });

    if (existing) {
      return res.status(409).json({ message: "E-mail já está em uso." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await prisma.usuario.create({
      data: {
        nome,
        apelido,
        email,
        senhaHash,
      },
    });

    return res.status(200).json({ message: "Usuário registrado com sucesso." });
  } catch (error) {
    console.error("Erro ao registrar:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}
