"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { usePartidas } from "@/hooks/usePartidas";

export default function PartidasDetalhesIndex() {
  const { partidas, isLoading, isError, error } = usePartidas();

  return (
    <>
      <Head>
        <title>Partidas | Fut7Pro</title>
        <meta
          name="description"
          content="Consulte as partidas registradas e acesse os detalhes completos de cada confronto."
        />
        <meta
          name="keywords"
          content="fut7, partidas, resultados, detalhes, futebol 7"
        />
      </Head>
      <main className="flex flex-col w-full min-h-screen items-center text-white">
        <section className="w-full max-w-4xl px-4 py-12">
          <h1 className="text-3xl font-bold text-yellow-400 mb-4 text-center">
            Partidas registradas
          </h1>
          <p className="text-center text-textoSuave mb-8">
            Escolha uma partida para visualizar estatisticas completas, presencas e destaques.
          </p>

          {isLoading && (
            <div className="bg-zinc-900 rounded-2xl shadow p-6 text-center">
              <span className="text-yellow-300 font-semibold">Carregando partidas...</span>
            </div>
          )}

          {isError && (
            <div className="bg-red-900/30 border border-red-700 rounded-2xl shadow p-6 text-center">
              <p className="text-red-300 font-semibold">
                Nao foi possivel carregar as partidas: {error ?? "erro desconhecido"}.
              </p>
            </div>
          )}

          {!isLoading && !isError && partidas.length === 0 && (
            <div className="bg-zinc-900 rounded-2xl shadow p-6 text-center">
              <p className="text-textoSuave">
                Ainda nao existem partidas registradas para este racha.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {partidas.map((partida) => (
              <Link
                key={partida.id}
                href={`/partidas/detalhes/${partida.id}`}
                className="flex flex-col md:flex-row md:items-center gap-4 bg-[#181818] rounded-2xl p-4 hover:bg-[#1f1f1f] transition border border-transparent hover:border-yellow-500/40"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Image
                    src={partida.logoCasa}
                    alt={`Logo ${partida.timeA}`}
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                  <div className="text-lg font-semibold">{partida.timeA}</div>
                  <div className="text-2xl font-bold text-yellow-300">
                    {partida.golsTimeA ?? "-"} <span className="text-yellow-500">x</span>{" "}
                    {partida.golsTimeB ?? "-"}
                  </div>
                  <div className="text-lg font-semibold">{partida.timeB}</div>
                  <Image
                    src={partida.logoFora}
                    alt={`Logo ${partida.timeB}`}
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                </div>
                <div className="flex flex-col gap-1 text-sm text-textoSuave min-w-[160px]">
                  <span>{new Date(partida.data).toLocaleDateString("pt-BR")}</span>
                  <span>{partida.local ?? "Local nao informado"}</span>
                  <span className="text-yellow-300 font-semibold">
                    {partida.finalizada ? "Concluida" : "Em andamento"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
