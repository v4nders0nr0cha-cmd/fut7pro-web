"use client";

import Link from "next/link";
import Head from "next/head";

const estatisticasLinks = [
  {
    title: "🏆 Classificação dos Times",
    href: "/estatisticas/classificacao-dos-times",
    description:
      "Acompanhe o desempenho de cada time rodada a rodada e veja quem está na liderança.",
  },
  {
    title: "📋 Ranking Geral",
    href: "/estatisticas/ranking-geral",
    description:
      "Pontuação acumulada de todos os jogadores durante a temporada ou quadrimestre.",
  },
  {
    title: "🎯 Artilheiros",
    href: "/estatisticas/artilheiros",
    description: "Ranking dos atletas com mais gols marcados nas partidas.",
  },
  {
    title: "🅰️ Assistências",
    href: "/estatisticas/assistencias",
    description:
      "Ranking dos principais maestros: veja quem mais distribuiu assistências.",
  },
  {
    title: "💪 Melhores por Posição",
    href: "/estatisticas/melhores-por-posicao",
    description: "Destaques por posição: atacante, meia, zagueiro e goleiro.",
  },
  {
    title: "⚖️ Tira-teima (Comparador)",
    href: "/estatisticas/tira-teima",
    description:
      "Compare dois jogadores lado a lado, com base em estatísticas oficiais.",
  },
];

export default function EstatisticasPage() {
  return (
    <>
      <Head>
        <title>Estatísticas | Fut7Pro</title>
        <meta
          name="description"
          content="Estatísticas completas do seu racha de futebol 7: gols, assistências, ranking de times, ranking geral, destaques por posição e comparativo entre atletas. Atualizado automaticamente a cada jogo. Fut7Pro – O sistema mais completo para futebol 7, racha e futebol amador."
        />
        <meta
          name="keywords"
          content="fut7, futebol 7, racha, estatísticas de futebol, ranking de jogadores, classificação dos times, artilheiros, assistências, maestro, comparador de atletas, ranking geral, melhores por posição, sistema de racha, futebol amador, tira teima, Fut7Pro"
        />
      </Head>

      {/* TÍTULO PRINCIPAL PADRÃO */}
      <h1 className="mb-3 mt-10 text-center text-3xl font-extrabold leading-tight text-yellow-400 drop-shadow-sm md:text-4xl">
        Estatísticas
      </h1>
      {/* DESCRIÇÃO PADRÃO — MAIS HORIZONTAL NO DESKTOP */}
      <p className="mx-auto mb-8 max-w-2xl text-center text-base font-medium leading-relaxed text-gray-300 md:max-w-3xl md:text-lg lg:max-w-4xl xl:max-w-5xl">
        Explore todos os rankings: classificação de times, desempenho dos
        jogadores, artilharia, assistências, destaques por posição e comparador
        de atletas. Evolua sua performance rodada a rodada, e mostre que está
        sempre entre os melhores.
      </p>

      <div
        className="w-full overflow-x-auto"
        style={{
          scrollbarColor: "#2a2a2a #111",
          scrollbarWidth: "thin",
        }}
      >
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {estatisticasLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-[140px] flex-col justify-between break-words rounded-xl border border-gray-700 bg-[#1a1a1a] p-6 shadow transition-all hover:border-yellow-400 hover:bg-[#222]"
              tabIndex={0}
              aria-label={link.title}
            >
              <div className="mb-2 text-base font-semibold text-yellow-400 sm:text-sm">
                {link.title}
              </div>
              <p className="text-sm text-gray-400">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
