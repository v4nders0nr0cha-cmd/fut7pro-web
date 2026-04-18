// src/app/admin/partidas/sorteio-inteligente/page.tsx
"use client";

import Head from "next/head";
import SorteioInteligenteAdmin from "@/components/sorteio/SorteioInteligenteAdmin";

export default function SorteioInteligentePage() {
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
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 min-h-screen bg-fundo">
        <div className="max-w-5xl mx-auto">
          <SorteioInteligenteAdmin />
        </div>
      </main>
    </>
  );
}
