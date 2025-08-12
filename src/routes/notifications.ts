import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import type { Notification } from "../types/notification";

const router = Router();
let notifications: Notification[] = []; // Troque para integração DB no projeto real

// Listar notificações do racha (badge, inbox)
router.get("/:rachaSlug", (req, res) => {
  const { rachaSlug } = req.params;
  const rachaNotifs = notifications.filter((n) => n.rachaSlug === rachaSlug);
  res.json(rachaNotifs);
});

// Marcar como lida
router.post("/read/:id", (req, res) => {
  const { id } = req.params;
  notifications = notifications.map((n) => (n.id === id ? { ...n, lida: true } : n));
  res.json({ ok: true });
});

// Criar notificação (chamar ao receber mensagem ou aviso)
router.post("/", (req, res) => {
  const { rachaSlug, type, titulo, mensagem, prioridade, remetente, assunto, referenciaId } =
    req.body;
  const notification: Notification = {
    id: uuidv4(),
    rachaSlug,
    type,
    titulo,
    mensagem,
    prioridade: prioridade || "normal",
    lida: false,
    data: new Date().toISOString(),
    remetente,
    assunto,
    referenciaId,
  };
  notifications.push(notification);
  res.status(201).json(notification);
});

export default router;
