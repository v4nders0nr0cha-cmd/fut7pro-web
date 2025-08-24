// src/app/admin/partidas/sorteio-inteligente/page.tsx
"use client";

import Head from "next/head";
import SorteioInteligenteAdmin from "@/components/sorteio/SorteioInteligenteAdmin";

// MOCK de verificação de admin — substitua pelo real
function useIsAdmin() {
  return true;
}

export default function SorteioInteligentePage() {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-fundo px-4 text-center">
        <div className="rounded-2xl bg-[#23272F] px-8 py-12 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-yellow-400">
            Acesso Restrito
          </h2>
          <p className="text-gray-200">
            Apenas administradores podem acessar esta funcionalidade.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Sorteio Inteligente | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Monte times equilibrados com base em ranking, posição e estrelas. Sorteio inteligente exclusivo para administradores do Fut7Pro."
        />
        <meta
          name="keywords"
          content="sorteio de times, fut7, futebol 7, racha, balanceamento, sistema de racha, times equilibrados, administrar racha, painel admin fut7pro"
        />
        <meta name="robots" content="index, follow" />
      </Head>

      <main className="min-h-screen bg-fundo px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <div className="mx-auto max-w-5xl">
          <SorteioInteligenteAdmin />
        </div>
      </main>
    </>
  );
}
