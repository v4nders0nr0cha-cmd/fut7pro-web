import { Router } from "express";
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

const router = Router();
let notifications: AdminNotification[] = [];

router.get("/:rachaSlug", (req, res) => {
  const { rachaSlug } = req.params;
  const rachaNotifications = notifications.filter((n) => n.rachaSlug === rachaSlug);
  res.json(rachaNotifications);
});

router.post("/read/:id", (req, res) => {
  const { id } = req.params;
  notifications = notifications.map((notification) =>
    notification.id === id ? { ...notification, lida: true } : notification
  );
  res.json({ ok: true });
});

router.post("/", (req, res) => {
  const { rachaSlug, type, titulo, mensagem, prioridade, remetente, assunto, referenciaId } =
    req.body;

  const notification: AdminNotification = {
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
