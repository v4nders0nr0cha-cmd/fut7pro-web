import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pagamento em processamento | Fut7Pro",
  description: "Resumo do retorno do pagamento Fut7Pro.",
  robots: { index: false, follow: false },
};

export default function BillingSucessoPage() {
  return (
    <main className="min-h-screen bg-[#0c0f14] px-4 py-16 flex items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-[#2b2b2b] bg-[#151a22] p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-3">Pagamento em processamento</h1>
        <p className="text-sm text-gray-300 mb-6">
          Recebemos o retorno do Mercado Pago. Seu pagamento pode levar alguns minutos para ser
          confirmado. Enquanto isso, voce pode acompanhar o status no painel do seu racha.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/financeiro/planos-limites"
            className="px-4 py-2 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-300"
          >
            Ver assinatura
          </Link>
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 rounded-lg border border-[#384152] text-white hover:border-yellow-400"
          >
            Voltar ao painel
          </Link>
        </div>
      </div>
    </main>
  );
}
