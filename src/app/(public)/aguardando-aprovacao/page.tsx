import { Suspense } from "react";
import type { Metadata } from "next";
import AguardandoAprovacaoClient from "./AguardandoAprovacaoClient";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.fut7pro.com.br").replace(
  /\/+$/,
  ""
);

export const metadata: Metadata = {
  title: "Aguardando aprovacao | Fut7Pro",
  description: "Acompanhe o status da sua solicitacao de cadastro no Fut7Pro.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: `${APP_URL}/aguardando-aprovacao`,
  },
};

export default function AguardandoAprovacaoPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-lg px-4 py-10 text-gray-300">Carregando...</div>
      }
    >
      <AguardandoAprovacaoClient />
    </Suspense>
  );
}
