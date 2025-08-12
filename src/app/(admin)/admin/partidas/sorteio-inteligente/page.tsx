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
      <main className="min-h-screen flex flex-col items-center justify-center bg-fundo text-center px-4">
        <div className="bg-[#23272F] px-8 py-12 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Acesso Restrito</h2>
          <p className="text-gray-200">Apenas administradores podem acessar esta funcionalidade.</p>
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

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 min-h-screen bg-fundo">
        <div className="max-w-5xl mx-auto">
          <SorteioInteligenteAdmin />
        </div>
      </main>
    </>
  );
}
