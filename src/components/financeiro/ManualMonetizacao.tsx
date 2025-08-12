"use client";

import React from "react";
import { FaLock, FaCheckCircle, FaDownload } from "react-icons/fa";

interface ManualMonetizacaoProps {
  showManual: boolean;
  onDownload?: () => void;
}

export default function ManualMonetizacao({ showManual, onDownload }: ManualMonetizacaoProps) {
  return (
    <div className="bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-2xl shadow-xl p-4 flex items-center gap-4 my-6 relative">
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
        <h3 className="font-bold text-zinc-900 text-lg mb-1">
          Manual: Técnicas para Monetizar seu Racha
        </h3>
        {showManual ? (
          <p className="text-zinc-800 text-sm mb-2">
            Parabéns! Você já pode baixar o manual exclusivo com dicas e estratégias para faturar
            mais no seu racha.
          </p>
        ) : (
          <p className="text-zinc-700 text-sm mb-2">
            Este manual será desbloqueado automaticamente após o seu primeiro pagamento confirmado.
          </p>
        )}
      </div>
      <div>
        <button
          disabled={!showManual}
          onClick={onDownload}
          className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition text-white ${
            showManual ? "bg-green-600 hover:bg-green-700" : "bg-zinc-400 cursor-not-allowed"
          }`}
        >
          <FaDownload /> Baixar Manual
        </button>
      </div>
    </div>
  );
}
