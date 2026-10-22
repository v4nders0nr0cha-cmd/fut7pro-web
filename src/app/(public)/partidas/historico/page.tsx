"use client";

import Head from "next/head";
import HistoricoPartidas from "@/components/partidas/HistoricoPartidas";

export default function HistoricoPage() {
  return (
    <>
      <Head>
        <title>Histórico de Partidas | Fut7Pro</title>
        <meta
          name="description"
          content="Consulte o histórico de partidas do grupo, com datas, locais, placares e detalhes dos jogos."
        />
        <meta
          name="keywords"
          content="historico de partidas, fut7, racha, resultados, placar, times do dia"
        />
      </Head>

      <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-brand mb-2">Histórico de Partidas</h1>
          <p className="text-textoSuave text-base md:text-lg">
            Consulte datas, locais, placares e detalhes das partidas do grupo.
          </p>
        </div>
        <HistoricoPartidas />
      </div>
    </>
  );
}
