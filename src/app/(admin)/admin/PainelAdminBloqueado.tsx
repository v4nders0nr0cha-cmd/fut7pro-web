"use client";

import { FaLock } from "react-icons/fa";
import Link from "next/link";

export default function PainelAdminBloqueado({ motivo = "" }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950">
      <div className="max-w-lg rounded-2xl bg-red-900 bg-opacity-90 p-8 text-center shadow-lg">
        <FaLock className="mx-auto mb-4 text-5xl text-red-300" />
        <h1 className="mb-2 text-2xl font-bold text-red-200">
          Painel Bloqueado por Inadimplência
        </h1>
        <p className="mb-3 text-zinc-200">
          Seu racha está bloqueado devido à inadimplência.
          <span className="mt-1 block text-zinc-300">
            {motivo ||
              "Pagamento não localizado após o vencimento do período de teste ou mensalidade."}
          </span>
        </p>
        <Link href="/admin/financeiro">
          <button className="mb-2 w-full rounded-lg bg-yellow-500 px-6 py-3 font-bold text-black duration-100 hover:bg-yellow-400">
            Ir para pagamento e regularizar acesso
          </button>
        </Link>
        <Link
          href="/admin/suporte"
          className="text-sm text-zinc-200 underline hover:text-white"
        >
          Precisa de ajuda? Fale com o suporte.
        </Link>
      </div>
    </div>
  );
}
