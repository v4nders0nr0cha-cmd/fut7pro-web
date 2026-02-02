"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";

export default function PresidenteAccessBlock() {
  const [sent, setSent] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto py-12">
      <div className="bg-[#1c1f26] border border-[#2a2d34] rounded-2xl p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <ShieldAlert className="text-yellow-300" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-yellow-300 mb-2">Acesso exclusivo do Presidente</h1>
        <p className="text-zinc-300 mb-6">
          Essa área é a prancheta do dono do racha. Para manter o jogo justo e seguro, só o
          Presidente pode mexer aqui.
        </p>
        {sent ? (
          <div className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3">
            Solicitação enviada (mock). Em breve o Presidente verá o pedido.
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSent(true)}
            className="px-5 py-2 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-300"
          >
            Enviar mensagem ao Presidente
          </button>
        )}
      </div>
    </div>
  );
}
