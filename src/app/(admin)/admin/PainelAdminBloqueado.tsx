"use client";

import { FaLock } from "react-icons/fa";
import Link from "next/link";

export default function PainelAdminBloqueado({ motivo = "" }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950">
      <div className="bg-red-900 bg-opacity-90 p-8 rounded-2xl shadow-lg text-center max-w-lg">
        <FaLock className="text-5xl text-red-300 mb-4 mx-auto" />
        <h1 className="text-2xl font-bold text-red-200 mb-2">Painel bloqueado por inadimplência</h1>
        <p className="text-zinc-200 mb-3">
          Seu racha está bloqueado por pendência de pagamento.
          <span className="block text-zinc-300 mt-1">
            {motivo ||
              "Não localizamos pagamento após o vencimento do período de teste ou da mensalidade."}
          </span>
        </p>
        <Link
          href="/admin/financeiro/planos-limites"
          className="inline-flex items-center justify-center bg-yellow-500 text-black font-bold px-6 py-3 rounded-lg hover:bg-yellow-400 duration-100 mb-2 w-full"
        >
          Ir para pagamento e regularizar acesso
        </Link>
        <a
          href="mailto:social@fut7pro.com.br?subject=Regulariza%C3%A7%C3%A3o%20de%20assinatura%20-%20Fut7Pro"
          className="text-zinc-200 text-sm underline hover:text-white"
        >
          Precisa de ajuda? Fale com o suporte.
        </a>
      </div>
    </div>
  );
}
