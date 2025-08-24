// src/app/admin/partidas/times-do-dia/page.tsx
"use client";

import Head from "next/head";
import TimesDoDiaClient from "@/components/TimesDoDiaClient";

export default function TimesDoDiaPage() {
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

      <main className="min-h-screen bg-fundo px-4 pb-24 pt-20 md:pb-8 md:pt-6">
        <h1 className="sr-only">Times do Dia - Sistema Fut7Pro</h1>
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-2xl font-bold text-yellow-400 md:text-3xl">
            Times do Dia
          </h2>
          <p className="mb-8 text-center text-neutral-300">
            Veja como ficaram as escalações dos times do racha de hoje. Os
            confrontos e a ordem dos jogos estão logo abaixo.
          </p>
          <TimesDoDiaClient />
        </div>
      </main>
    </>
  );
}
