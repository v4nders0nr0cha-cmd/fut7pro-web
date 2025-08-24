"use client";

import React from "react";
import { FaLock, FaCheckCircle, FaDownload } from "react-icons/fa";

interface ManualMonetizacaoProps {
  showManual: boolean;
  onDownload?: () => void;
}

export default function ManualMonetizacao({
  showManual,
  onDownload,
}: ManualMonetizacaoProps) {
  return (
    <div className="relative my-6 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-300 p-4 shadow-xl">
      <div>
        <div className="text-3xl">
          {showManual ? (
            <FaCheckCircle className="text-green-700" />
          ) : (
            <FaLock className="text-zinc-800" />
          )}
        </div>
      </div>
      <div className="flex-1">
        <h3 className="mb-1 text-lg font-bold text-zinc-900">
          Manual: Técnicas para Monetizar seu Racha
        </h3>
        {showManual ? (
          <p className="mb-2 text-sm text-zinc-800">
            Parabéns! Você já pode baixar o manual exclusivo com dicas e
            estratégias para faturar mais no seu racha.
          </p>
        ) : (
          <p className="mb-2 text-sm text-zinc-700">
            Este manual será desbloqueado automaticamente após o seu primeiro
            pagamento confirmado.
          </p>
        )}
      </div>
      <div>
        <button
          disabled={!showManual}
          onClick={onDownload}
          className={`flex items-center gap-2 rounded px-4 py-2 font-semibold text-white transition ${
            showManual
              ? "bg-green-600 hover:bg-green-700"
              : "cursor-not-allowed bg-zinc-400"
          }`}
        >
          <FaDownload /> Baixar Manual
        </button>
      </div>
    </div>
  );
}
