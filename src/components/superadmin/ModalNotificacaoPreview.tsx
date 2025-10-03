"use client";

import type { FC } from "react";
import type { SuperadminNotification } from "@/types/superadmin";

interface ModalNotificacaoPreviewProps {
  notificacao: SuperadminNotification;
  onClose: () => void;
}

export const ModalNotificacaoPreview: FC<ModalNotificacaoPreviewProps> = ({
  notificacao,
  onClose,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md shadow-xl">
      <h2 className="text-xl font-bold mb-4 text-yellow-400">Detalhe da notificação</h2>
      <div className="mb-4 space-y-2 text-zinc-100">
        <div>
          <div className="text-xs text-zinc-400 uppercase tracking-wide">Título</div>
          <div>{notificacao.titulo}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-400 uppercase tracking-wide">Mensagem</div>
          <div className="leading-relaxed">{notificacao.mensagem}</div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs text-zinc-400">
          <span>
            <b>Destino:</b> {notificacao.destino}
          </span>
          <span>
            <b>Status:</b> {notificacao.status}
          </span>
          <span>
            <b>Tipo:</b> {notificacao.tipo}
          </span>
          <span>
            <b>Enviado por:</b> {notificacao.enviadoPor}
          </span>
        </div>
        <div className="text-xs text-zinc-400">
          <b>Data/Hora:</b> {new Date(notificacao.criadoEm).toLocaleString("pt-BR")}
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
