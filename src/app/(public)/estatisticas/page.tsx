"use client";

import Link from "next/link";
import Head from "next/head";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import PageHelp from "@/components/public/PageHelp";

const estatisticasLinks = [
  {
    title: "🏆 Classificação dos Times",
    href: "/estatisticas/classificacao-dos-times",
    description: "Acompanhe pontos, aproveitamento, vitórias, empates e derrotas por período.",
  },
  {
    title: "📋 Ranking Geral",
    href: "/estatisticas/ranking-geral",
    description:
      "Pontuação consolidada dos atletas com filtros de temporada, quadrimestre e geral.",
  },
  {
    title: "🎯 Artilheiros",
    href: "/estatisticas/artilheiros",
    description: "Veja quem mais decide na bola na rede, com filtros por período e ano.",
  },
  {
    title: "🅰️ Assistências",
    href: "/estatisticas/assistencias",
    description: "Ranking dos maestros com mais passes para gol nas partidas registradas.",
  },
  {
    title: "💪 Melhores por Posição",
    href: "/estatisticas/melhores-por-posicao",
    description: "Destaques de atacante, meia, zagueiro e goleiro com base em dados oficiais.",
  },
  {
    title: "⚖️ Tira-teima (Comparador)",
    href: "/estatisticas/tira-teima",
    description: "Compare dois atletas lado a lado com histórico, eficiência e desempenho.",
  },
];

export default function EstatisticasPage() {
  const { publicHref } = usePublicLinks();

  return (
    <>
      <Head>
        <title>Estatísticas | Fut7Pro</title>
        <meta
          name="description"
          content="Estatísticas oficiais do racha em tempo real: classificação dos times, ranking geral, artilheiros, assistências, melhores por posição e comparador de atletas. Dados atualizados a cada partida publicada."
        />
        <meta
          name="keywords"
          content="fut7, futebol 7, racha, estatísticas de futebol, ranking de jogadores, classificação dos times, artilheiros, assistências, maestro, comparador de atletas, ranking geral, melhores por posição, sistema de racha, futebol amador, tira teima, Fut7Pro"
        />
      </Head>

      <PageHelp
        title="Estatísticas"
        headingLevel="h1"
        variant="main-page"
        className="mt-10"
        summary="Explore métricas oficiais do racha por atleta, time, posição e período."
        detailsTitle="O que você encontra em Estatísticas"
        details={
          <>
            <p>
              A área de Estatísticas reúne os rankings e comparadores oficiais do racha, sempre com
              dados alimentados pelas partidas publicadas no painel administrativo.
            </p>
            <p>
              Você pode acompanhar classificação dos times, ranking geral, artilheiros,
              assistências, melhores por posição e o Tira Teima entre atletas.
            </p>
          </>
        }
      />

      <div
        className="w-full overflow-x-auto"
        style={{
          scrollbarColor: "#2a2a2a #111",
          scrollbarWidth: "thin",
        }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl mx-auto">
          {estatisticasLinks.map((link) => (
            <Link
              key={link.href}
              href={publicHref(link.href)}
              className="bg-[#1a1a1a] hover:bg-[#222] border border-gray-700 hover:border-brand p-6 rounded-xl shadow transition-all flex flex-col justify-between min-h-[140px] break-words"
              tabIndex={0}
              aria-label={link.title}
            >
              <div className="text-brand font-semibold text-base sm:text-sm mb-2">{link.title}</div>
              <p className="text-sm text-gray-400">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
