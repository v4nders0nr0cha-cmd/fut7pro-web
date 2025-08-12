import type { NextApiRequest, NextApiResponse } from "next";
import type { MensagemContato } from "@/types/mensagem";
import type { Notification } from "@/types/notification";
import { v4 as uuidv4 } from "uuid";

// Simulação de DB em memória (substitua por integração real)
const mensagens: MensagemContato[] = [];
const notifications: Notification[] = [];

// POST: recebe mensagem do formulário de contato, salva e gera notificação para admin do racha
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { rachaSlug, nome, email, telefone, assunto, mensagem } = req.body;
    if (!rachaSlug || !nome || !email || !assunto || !mensagem) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes." });
    }

    // Salva mensagem no "banco"
    const novaMensagem: MensagemContato = {
      id: uuidv4(),
      rachaSlug,
      nome,
      email,
      telefone,
      assunto,
      mensagem,
      dataEnvio: new Date().toISOString(),
      status: "novo",
    };
    mensagens.unshift(novaMensagem);

    // Cria notificação para o admin do racha
    const notification: Notification = {
      id: uuidv4(),
      rachaSlug,
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

  // GET (opcional): listar mensagens por rachaSlug
  if (req.method === "GET") {
    const { rachaSlug } = req.query;
    if (!rachaSlug || typeof rachaSlug !== "string") {
      return res.status(400).json({ error: "rachaSlug obrigatório" });
    }
    const lista = mensagens.filter((msg) => msg.rachaSlug === rachaSlug);
    return res.status(200).json(lista);
  }

  res.setHeader("Allow", ["POST", "GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
