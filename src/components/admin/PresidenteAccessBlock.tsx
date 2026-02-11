"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function PresidenteAccessBlock() {
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
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/admin/comunicacao/suporte"
            className="px-5 py-2 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition"
          >
            Falar com o suporte Fut7Pro
          </Link>
          <Link
            href="/admin/dashboard"
            className="text-sm text-yellow-300 underline hover:text-yellow-200 transition"
          >
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
