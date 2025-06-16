"use client";

import Link from "next/link";

const estatisticasLinks = [
  {
    title: "🏆 Classificação dos Times",
    href: "/estatisticas/classificacao-dos-times",
    description: "Veja o desempenho dos times no quadrimestre atual.",
  },
  {
    title: "🎯 Artilheiros",
    href: "/estatisticas/artilheiros",
    description: "Ranking dos jogadores que mais marcaram gols.",
  },
  {
    title: "🅰️ Assistências",
    href: "/estatisticas/assistencias",
    description: "Os maiores garçons do racha, líderes em assistências.",
  },
  {
    title: "📊 Ranking Geral",
    href: "/estatisticas/ranking",
    description: "Pontuação geral baseada em desempenho em campo.",
  },
  {
    title: "💪 Melhores por Posição",
    href: "/estatisticas/melhores-posicao",
    description: "Destaques de cada posição: atacante, meia, zagueiro e goleiro.",
  },
  {
    title: "⚖️ Tira Teima (Comparador)",
    href: "/estatisticas/tira-teima",
    description: "Compare dois jogadores lado a lado com base nos dados.",
  },
];

export default function EstatisticasPage() {
  return (
    <main className="pt-4 p-6 bg-fundo text-white">
      <h1 className="text-3xl font-bold text-yellow-400 text-center mb-2">Estatísticas do Racha</h1>
      <p className="text-center text-sm text-gray-400 mb-8 max-w-2xl mx-auto">
        Explore os dados completos do seu racha: gols, assistências, presença, ranking geral e
        comparações entre jogadores. Tudo atualizado a cada jogo.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {estatisticasLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-gray-700 hover:border-yellow-400 p-6 rounded-xl shadow transition-all flex flex-col justify-between min-h-[140px]"
          >
            <div className="text-yellow-400 font-semibold text-sm mb-2">{link.title}</div>
            <p className="text-sm text-gray-400">{link.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
