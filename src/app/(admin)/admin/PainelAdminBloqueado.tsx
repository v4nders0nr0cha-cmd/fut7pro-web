"use client";

import { FaLock } from "react-icons/fa";
import Link from "next/link";

export default function PainelAdminBloqueado({ motivo = "" }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950">
      <div className="bg-red-900 bg-opacity-90 p-8 rounded-2xl shadow-lg text-center max-w-lg">
        <FaLock className="text-5xl text-red-300 mb-4 mx-auto" />
        <h1 className="text-2xl font-bold text-red-200 mb-2">Painel Bloqueado por Inadimplência</h1>
        <p className="text-zinc-200 mb-3">
          Seu racha está bloqueado devido à inadimplência.
          <span className="block text-zinc-300 mt-1">
            {motivo ||
              "Pagamento não localizado após o vencimento do período de teste ou mensalidade."}
          </span>
        </p>
        <Link href="/admin/financeiro/planos-limites">
          <button className="bg-yellow-500 text-black font-bold px-6 py-3 rounded-lg hover:bg-yellow-400 duration-100 mb-2 w-full">
            Ir para pagamento e regularizar acesso
          </button>
        </Link>
        <Link
          href="/admin/comunicacao/suporte"
          className="text-zinc-200 text-sm underline hover:text-white"
        >
          Precisa de ajuda? Fale com o suporte.
        </Link>
      </div>
    </div>
  );
}
