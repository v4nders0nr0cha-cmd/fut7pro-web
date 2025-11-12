import type { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";

interface AdminNotification {
  id: string;
  rachaSlug: string;
  type: string;
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  prioridade: string;
  remetente?: string;
  assunto?: string;
  referenciaId?: string;
}

const notifications: AdminNotification[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { rachaSlug } = req.query;
    if (!rachaSlug || typeof rachaSlug !== "string") {
      return res.status(400).json({ error: "rachaSlug obrigatorio" });
    }
    const lista = notifications.filter((n) => n.rachaSlug === rachaSlug);
    return res.status(200).json(lista);
  }

  if (req.method === "POST") {
    const { rachaSlug, type, titulo, mensagem, prioridade, remetente, assunto, referenciaId } =
      req.body;

    if (!rachaSlug || !type || !titulo || !mensagem) {
      return res.status(400).json({ error: "Campos obrigatorios ausentes" });
    }

    const notification: AdminNotification = {
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

    notifications.unshift(notification);
    return res.status(201).json(notification);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
