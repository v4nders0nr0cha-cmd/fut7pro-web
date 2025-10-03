import type { NextApiRequest, NextApiResponse } from "next";
import type { Notification } from "@/types/notificacao";
import { v4 as uuidv4 } from "uuid";

// Simulação: banco em memória. Troque por integração real (Prisma, etc)
const notifications: Notification[] = [];

// GET: Lista todas as notificações do rachaSlug informado
// POST: Cria uma nova notificação (qualquer origem do sistema)
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { rachaSlug } = req.query;
    if (!rachaSlug || typeof rachaSlug !== "string") {
      return res.status(400).json({ error: "rachaSlug obrigatório" });
    }
    const lista = notifications.filter((n) => n.rachaSlug === rachaSlug);
    return res.status(200).json(lista);
  }

  if (req.method === "POST") {
    const { rachaSlug, type, titulo, mensagem, prioridade, remetente, assunto, referenciaId } =
      req.body;

    if (!rachaSlug || !type || !titulo || !mensagem) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes" });
    }

    const notification: Notification = {
      id: uuidv4(),
      rachaSlug,
      type,
      titulo,
      mensagem,
      data: new Date().toISOString(),
      lida: false,
      prioridade: prioridade || "normal",
      remetente,
      assunto,
      referenciaId,
    };

    notifications.unshift(notification); // para simular novo primeiro
    return res.status(201).json(notification);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
