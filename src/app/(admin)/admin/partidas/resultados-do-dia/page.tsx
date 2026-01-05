"use client";

import Head from "next/head";
import { Suspense } from "react";
import ResultadosDoDiaAdmin from "@/components/admin/ResultadosDoDiaAdmin";

export default function ResultadosDoDiaPage() {
  return (
    <>
      <Head>
        <title>Registrar Resultados do Dia | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Registre placares do dia, gols e assistencias em tempo real. Resultados atualizam rankings e historico do seu racha no Fut7Pro."
        />
        <meta
          name="keywords"
          content="resultados do dia, gols, assistencias, partidas fut7, painel admin, fut7pro"
        />
      </Head>

      <main className="pt-20 pb-24 md:pt-6 md:pb-10 px-4 bg-fundo min-h-screen text-white">
        <div className="max-w-6xl mx-auto">
          <Suspense
            fallback={
              <div className="rounded-xl border border-neutral-800 bg-[#1a1a1a] p-6 text-sm text-neutral-300">
                Carregando resultados do dia...
              </div>
            }
          >
            <ResultadosDoDiaAdmin />
          </Suspense>
        </div>
      </main>
    </>
  );
}
