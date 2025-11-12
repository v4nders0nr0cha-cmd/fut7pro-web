"use client";

import type { Notificacao } from "@/types/notificacao";

type ModalNotificacaoPreviewProps = {
  notificacao: Notificacao;
  onClose: () => void;
};

export function ModalNotificacaoPreview({ notificacao, onClose }: ModalNotificacaoPreviewProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-2 text-yellow-400">Pré-visualização</h2>
        <div className="mb-2 text-zinc-100">{notificacao.message}</div>
        <div className="text-sm text-zinc-400 space-y-1">
          <div>
            <b>Tipo:</b> {notificacao.type}
          </div>
          <div>
            <b>Data/Hora:</b> {new Date(notificacao.createdAt).toLocaleString("pt-BR")}
          </div>
          <div>
            <b>Status:</b> {notificacao.isRead ? "Lida" : "Não lida"}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
