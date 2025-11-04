import type { NextApiRequest, NextApiResponse } from "next";
import type { MensagemContato } from "@/types/mensagem";
import { v4 as uuidv4 } from "uuid";

interface ContatoNotification {
  id: string;
  rachaId: string;
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

const mensagens: MensagemContato[] = [];
const notifications: ContatoNotification[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { rachaId, nome, email, telefone, assunto, mensagem } = req.body;
    if (!rachaId || !nome || !email || !assunto || !mensagem) {
      return res.status(400).json({ error: "Campos obrigatorios ausentes." });
    }

    const novaMensagem: MensagemContato = {
      id: uuidv4(),
      rachaId,
      nome,
      email,
      telefone,
      assunto,
      mensagem,
      dataEnvio: new Date().toISOString(),
      status: "novo",
    };
    mensagens.unshift(novaMensagem);

    const notification: ContatoNotification = {
      id: uuidv4(),
      rachaId,
      type: "contato",
      titulo: "Nova mensagem recebida",
      mensagem: `Nova mensagem de ${nome}. Assunto: ${assunto}`,
      data: new Date().toISOString(),
      lida: false,
      prioridade: "alta",
      remetente: nome,
      assunto,
      referenciaId: novaMensagem.id,
    };
    notifications.unshift(notification);

    return res.status(201).json({ success: true });
  }

  if (req.method === "GET") {
    const { rachaId } = req.query;
    if (!rachaId || typeof rachaId !== "string") {
      return res.status(400).json({ error: "rachaSlug obrigatorio" });
    }
    const lista = mensagens.filter((msg) => msg.rachaId === rachaId);
    return res.status(200).json(lista);
  }

  res.setHeader("Allow", ["POST", "GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
