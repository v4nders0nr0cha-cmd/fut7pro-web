"use client";

import { useState } from "react";
import type { NotificationType } from "@/types/notificacao";

interface ModalNovaNotificacaoProps {
  onClose: () => void;
  onSubmit: (payload: { title: string; message: string; type: NotificationType }) => Promise<void>;
}

const TIPOS: NotificationType[] = ["ALERTA", "SISTEMA", "PERSONALIZADA"];

export function ModalNovaNotificacao({ onClose, onSubmit }: ModalNovaNotificacaoProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<NotificationType>("SISTEMA");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      setError("Preencha título e mensagem");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), message: message.trim(), type });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar notificação");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-yellow-400">Nova Notificação</h2>
        <input
          className="w-full rounded bg-zinc-800 text-zinc-100 border border-zinc-700 mb-3 p-2"
          placeholder="Título"
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full h-28 rounded bg-zinc-800 text-zinc-100 border border-zinc-700 mb-3 p-2"
          placeholder="Digite a mensagem..."
          maxLength={300}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <select
          className="w-full rounded bg-zinc-800 text-zinc-100 border border-zinc-700 mb-4 p-2"
          value={type}
          onChange={(e) => setType(e.target.value as NotificationType)}
        >
          {TIPOS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error && <div className="text-sm text-red-400 mb-3">{error}</div>}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-yellow-400 text-zinc-900 font-bold hover:bg-yellow-300 transition disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
