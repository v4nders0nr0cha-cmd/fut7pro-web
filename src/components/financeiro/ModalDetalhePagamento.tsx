"use client";

import React from "react";
import { FaTimes, FaDownload } from "react-icons/fa";
import type { PagamentoFinanceiro } from "@/components/financeiro/types"; // CORRIGIDO!

interface ModalDetalhePagamentoProps {
  open: boolean;
  onClose: () => void;
  pagamento: PagamentoFinanceiro | null; // CORRIGIDO!
  onDownloadRecibo?: () => void;
}

export default function ModalDetalhePagamento({
  open,
  onClose,
  pagamento,
  onDownloadRecibo,
}: ModalDetalhePagamentoProps) {
  if (!open || !pagamento) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
      aria-modal="true"
    >
      <div className="bg-zinc-900 rounded-2xl shadow-xl p-6 w-full max-w-md mx-2 relative animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-zinc-300 hover:text-red-500 transition"
          onClick={onClose}
          aria-label="Fechar"
        >
          <FaTimes size={22} />
        </button>
        <h3 className="text-lg font-bold text-white mb-4">Detalhes do Pagamento</h3>
        <div className="mb-2 text-zinc-100">
          <b>Status:</b> {pagamento.status}
        </div>
        <div className="mb-2 text-zinc-100">
          <b>Data:</b> {pagamento.data}
        </div>
        <div className="mb-2 text-zinc-100">
          <b>Valor:</b> R$ {pagamento.valor.toLocaleString("pt-BR")}
        </div>
        <div className="mb-2 text-zinc-100">
          <b>Método:</b> {pagamento.metodo}
        </div>
        <div className="mb-2 text-zinc-100">
          <b>Referência:</b> {pagamento.referencia}
        </div>
        <div className="mb-2 text-zinc-100">
          <b>Descrição:</b> {pagamento.descricao || "--"}
        </div>
        <div className="flex justify-end mt-6">
          <button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded px-5 py-2 font-semibold transition"
            onClick={onDownloadRecibo}
            disabled={!onDownloadRecibo}
          >
            <FaDownload /> Baixar Recibo
          </button>
        </div>
      </div>
    </div>
  );
}
