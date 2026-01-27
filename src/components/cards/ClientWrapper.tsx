"use client";

import { useEffect, useMemo, useState } from "react";
import SeletorAno from "@/components/cards/SeletorAno";
import CampeaoAnoCard from "@/components/cards/CampeaoAnoCard";
import CampeaoPosicaoCard from "@/components/cards/CampeaoPosicaoCard";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import { usePublicLinks } from "@/hooks/usePublicLinks";

const posicoes = [
  { label: "Atacante do Ano", icon: "⚽", position: "Atacante" },
  { label: "Meia do Ano", icon: "🧠", position: "Meia" },
  { label: "Zagueiro do Ano", icon: "🛡️", position: "Zagueiro" },
  { label: "Goleiro do Ano", icon: "🧤", position: "Goleiro" },
];

export default function ClientWrapper() {
  const { publicSlug } = usePublicLinks();
  const [anoSelecionado, setAnoSelecionado] = useState<number | undefined>(undefined);

  const {
    rankings: rankingGeral,
    availableYears,
    isLoading: loadingGeral,
  } = usePublicPlayerRankings({
    slug: publicSlug,
    type: "geral",
    period: "year",
    year: anoSelecionado,
  });

  useEffect(() => {
    if (!anoSelecionado && availableYears.length) {
      setAnoSelecionado(availableYears[0]);
    }
  }, [availableYears, anoSelecionado]);

  const campeoesDoAno = useMemo(() => {
    if (!rankingGeral.length) return [];
    const topPontos = [...rankingGeral].sort((a, b) => b.pontos - a.pontos)[0];
    const topGols = [...rankingGeral].sort((a, b) => b.gols - a.gols)[0];
    const topAssist = [...rankingGeral].sort((a, b) => b.assistencias - a.assistencias)[0];
    const build = (item: typeof topPontos | undefined, titulo: string, icone: string) =>
      item && {
        titulo,
        nome: item.nome,
        image: item.foto,
        valor: `Pontos: ${item.pontos}`,
        icone,
        href: `/atletas/${item.slug}`,
        slug: item.slug,
      };
    return [
      build(topPontos, "Melhor do Ano", "🏆"),
      build(topGols, "Artilheiro do Ano", "⚽"),
      build(topAssist, "Maestro do Ano", "🎯"),
      build(topPontos, "Campeão do Ano", "🥇"),
    ].filter(Boolean) as any[];
  }, [rankingGeral]);

  const rankingAtacante = usePublicPlayerRankings({
    slug: publicSlug,
    type: "geral",
    period: "year",
    year: anoSelecionado,
    position: "Atacante",
    limit: 1,
  });
  const rankingMeia = usePublicPlayerRankings({
    slug: publicSlug,
    type: "geral",
    period: "year",
    year: anoSelecionado,
    position: "Meia",
    limit: 1,
  });
  const rankingZagueiro = usePublicPlayerRankings({
    slug: publicSlug,
    type: "geral",
    period: "year",
    year: anoSelecionado,
    position: "Zagueiro",
    limit: 1,
  });
  const rankingGoleiro = usePublicPlayerRankings({
    slug: publicSlug,
    type: "geral",
    period: "year",
    year: anoSelecionado,
    position: "Goleiro",
    limit: 1,
  });

  const posicaoRankings = [rankingAtacante, rankingMeia, rankingZagueiro, rankingGoleiro];

  const melhoresPorPosicao = posicaoRankings.map((r, idx) => {
    const top = r.rankings[0];
    const posicaoMeta = posicoes[idx];
    if (!top) return null;
    return {
      posicao: posicaoMeta.label,
      nome: top.nome,
      image: top.foto,
      valor: `${top.pontos} pts`,
      icone: posicaoMeta.icon,
      href: `/atletas/${top.slug}`,
      slug: top.slug,
    };
  });

  return (
    <div className="min-h-screen bg-fundo text-white px-4 pt-4 pb-10">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-brand mb-2">Os Campeões do Racha</h1>
        <p className="text-gray-300 max-w-2xl mx-auto mb-4">
          Dados reais do ranking anual do racha. Escolha o ano para ver quem liderou.
        </p>

        <div className="inline-block">
          <SeletorAno
            anosDisponiveis={availableYears.length ? availableYears : [new Date().getFullYear()]}
            anoSelecionado={anoSelecionado || availableYears[0] || new Date().getFullYear()}
            onChange={setAnoSelecionado}
          />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-brand mb-4 text-center">Campeões do Ano</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8 justify-center">
        {loadingGeral && (
          <div className="text-center text-gray-400 col-span-full">Carregando ranking...</div>
        )}
        {!loadingGeral &&
          campeoesDoAno.map((item, idx) => <CampeaoAnoCard key={item.slug || idx} {...item} />)}
      </div>

      <h2 className="text-2xl font-bold text-brand mb-4 text-center">Melhores por Posição</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8 justify-center">
        {posicaoRankings.every((r) => r.isLoading) && (
          <div className="text-center text-gray-400 col-span-full">Carregando posições...</div>
        )}
        {melhoresPorPosicao.map(
          (item, idx) => item && <CampeaoPosicaoCard key={item.slug || idx} {...item} />
        )}
      </div>
    </div>
  );
}
