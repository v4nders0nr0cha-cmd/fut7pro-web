"use client";
// src/app/admin/partidas/historico/page.tsx

import Head from "next/head";
import HistoricoPartidasAdmin from "@/components/admin/HistoricoPartidasAdmin";

export default function AdminHistoricoPartidasPage() {
  return (
    <>
      <Head>
        <title>Historico de Partidas | Painel Admin - Fut7Pro</title>
        <meta
          name="description"
          content="Lance resultados, gols e assistencias das partidas do seu racha. Painel Fut7Pro completo para administracao profissional."
        />
        <meta
          name="keywords"
          content="admin fut7, editar partidas, corrigir placar, editar gols, editar assistencias, historico futebol 7"
        />
      </Head>

      <main className="pt-20 pb-24 md:pt-6 md:pb-10 px-4 bg-fundo min-h-screen text-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2 text-center">
            Historico de Partidas
          </h1>
          <p className="text-base md:text-lg mb-6 text-textoSuave text-center">
            Navegue pelos dias de racha, acompanhe o status das rodadas e acesse os confrontos para
            editar resultados com rapidez.
          </p>
          <HistoricoPartidasAdmin />
        </div>
      </main>
    </>
  );
}
