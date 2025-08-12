"use client";

import type { FC } from "react";
import type { Notificacao } from "@/types/notificacao";

interface ModalNotificacaoPreviewProps {
  notificacao: Notificacao;
  onClose: () => void;
}

export const ModalNotificacaoPreview: FC<ModalNotificacaoPreviewProps> = ({
  notificacao,
  onClose,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md shadow-xl">
      <h2 className="text-xl font-bold mb-4 text-yellow-400">Detalhe da Notificação</h2>
      <div className="mb-4">
        <div className="mb-2 text-sm text-zinc-400">Mensagem:</div>
        <div className="mb-2 text-zinc-100">{notificacao.mensagem}</div>
        <div className="mb-1 text-xs text-zinc-400">
          <b>Data/Hora:</b> {notificacao.data}
        </div>
        <div className="mb-1 text-xs text-zinc-400">
          <b>Destino:</b> {notificacao.destino}
        </div>
        <div className="mb-1 text-xs text-zinc-400">
          <b>Status:</b> {notificacao.status}
        </div>
        <div className="mb-1 text-xs text-zinc-400">
          <b>Enviado por:</b> {notificacao.enviadoPor}
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded bg-yellow-400 text-zinc-900 font-bold hover:bg-yellow-300 transition"
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
);
