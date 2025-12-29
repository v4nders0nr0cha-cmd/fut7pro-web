// src/app/admin/partidas/times-do-dia/page.tsx
"use client";

import Head from "next/head";
import TimesDoDiaClient from "@/components/TimesDoDiaClient";
import { useRacha } from "@/context/RachaContext";

export default function TimesDoDiaPage() {
  const { tenantSlug } = useRacha();
  return (
    <>
      <Head>
        <title>Times do Dia | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Veja a escalação dos times do dia, destaques, artilheiro, goleiro, craque, maestro do racha Fut7. Sistema para Fut7, racha e futebol amador."
        />
        <meta
          name="keywords"
          content="racha, fut7, sistema de racha, sorteio de times, escalação de times, estatísticas futebol 7, futebol amador, futebol society, campeões do dia"
        />
        <meta name="robots" content="index, follow" />
      </Head>

      <main className="pt-20 pb-24 md:pt-6 md:pb-8 px-4 bg-fundo min-h-screen">
        <h1 className="sr-only">Times do Dia - Sistema Fut7Pro</h1>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-4 text-center">
            Times do Dia
          </h2>
          <p className="text-center text-neutral-300 mb-8">
            Veja como ficaram as escalações dos times do racha de hoje. Os confrontos e a ordem dos
            jogos estão logo abaixo.
          </p>
          <TimesDoDiaClient slug={tenantSlug || undefined} source="admin" />
        </div>
      </main>
    </>
  );
}
