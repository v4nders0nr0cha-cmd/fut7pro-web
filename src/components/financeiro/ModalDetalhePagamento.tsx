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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      aria-modal="true"
    >
      <div className="animate-fadeIn relative mx-2 w-full max-w-md rounded-2xl bg-zinc-900 p-6 shadow-xl">
        <button
          className="absolute right-3 top-3 text-zinc-300 transition hover:text-red-500"
          onClick={onClose}
          aria-label="Fechar"
        >
          <FaTimes size={22} />
        </button>
        <h3 className="mb-4 text-lg font-bold text-white">
          Detalhes do Pagamento
        </h3>
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
        <div className="mt-6 flex justify-end">
          <button
            className="flex items-center gap-2 rounded bg-green-600 px-5 py-2 font-semibold text-white transition hover:bg-green-700"
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
