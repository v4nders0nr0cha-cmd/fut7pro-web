"use client";

import React from "react";
import { FaDownload } from "react-icons/fa";
import Fut7DialogBase from "@/components/ui/feedback/Fut7DialogBase";
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
    <Fut7DialogBase
      open
      title="Detalhes do pagamento"
      onClose={onClose}
      footer={
        <button
          type="button"
          className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:bg-yellow-300 disabled:opacity-50"
          onClick={onDownloadRecibo}
          disabled={!onDownloadRecibo}
        >
          <FaDownload /> Baixar recibo
        </button>
      }
    >
      <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
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
      </div>
    </Fut7DialogBase>
  );
}
