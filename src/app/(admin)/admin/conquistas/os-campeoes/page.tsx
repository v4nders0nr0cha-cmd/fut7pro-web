"use client";

import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import CampeaoAnoCard from "@/components/cards/CampeaoAnoCard";
import QuadrimestreGrid from "@/components/cards/QuadrimestreGrid";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import type { QuadrimestresAno } from "@/types/estatisticas";

const posicoes = [
  { label: "Atacante do Ano", icon: "⚽", position: "Atacante" },
  { label: "Meia do Ano", icon: "🧠", position: "Meia" },
  { label: "Zagueiro do Ano", icon: "🛡️", position: "Zagueiro" },
  { label: "Goleiro do Ano", icon: "🧤", position: "Goleiro" },
];

export default function OsCampeoesAdminPage() {
  const [anoSelecionado, setAnoSelecionado] = useState<number | undefined>(undefined);
  const {
    rankings: rankingGeral,
    availableYears,
    isLoading: loadingGeral,
  } = usePublicPlayerRankings({ type: "geral", period: "year", year: anoSelecionado });
  const anoBase = anoSelecionado ?? availableYears[0] ?? new Date().getFullYear();
  const [fechandoTemporada, setFechandoTemporada] = useState(false);
  const [mensagemFechamento, setMensagemFechamento] = useState<string | null>(null);

  useEffect(() => {
    if (!anoSelecionado && availableYears.length) {
      setAnoSelecionado(availableYears[0]);
    }
  }, [availableYears, anoSelecionado]);

  const handleFinalizarTemporada = async () => {
    if (fechandoTemporada) return;
    setFechandoTemporada(true);
    setMensagemFechamento(null);

    try {
      const response = await fetch("/api/campeoes/finalizar-temporada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: anoBase }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Erro ao finalizar temporada.");
      }
      const created = Number.isFinite(payload?.created) ? payload.created : 0;
      setMensagemFechamento(`Temporada ${anoBase} finalizada. ${created} conquistas geradas.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao finalizar temporada.";
      setMensagemFechamento(message);
    } finally {
      setFechandoTemporada(false);
    }
  };

  const campeoesDoAno = useMemo(() => {
    if (!rankingGeral.length) return [];
    const topPontos = [...rankingGeral].sort((a, b) => b.pontos - a.pontos)[0];
    const topGols = [...rankingGeral].sort((a, b) => b.gols - a.gols)[0];
    const topAssist = [...rankingGeral].sort((a, b) => b.assistencias - a.assistencias)[0];
    const build = (item: (typeof rankingGeral)[0] | undefined, titulo: string, icone: string) =>
      item && {
        titulo,
        nome: item.nome,
        image: item.foto,
        valor: `${item.pontos} pts`,
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
    type: "geral",
    period: "year",
    year: anoSelecionado,
    position: "Atacante",
    limit: 1,
  });
  const rankingMeia = usePublicPlayerRankings({
    type: "geral",
    period: "year",
    year: anoSelecionado,
    position: "Meia",
    limit: 1,
  });
  const rankingZagueiro = usePublicPlayerRankings({
    type: "geral",
    period: "year",
    year: anoSelecionado,
    position: "Zagueiro",
    limit: 1,
  });
  const rankingGoleiro = usePublicPlayerRankings({
    type: "geral",
    period: "year",
    year: anoSelecionado,
    position: "Goleiro",
    limit: 1,
  });

  const posicaoRankings = [rankingAtacante, rankingMeia, rankingZagueiro, rankingGoleiro];

  const quadrimestres: QuadrimestresAno = useMemo(() => {
    const lista = rankingGeral.slice(0, 4).map((r) => ({
      titulo: "Destaque do Quadrimestre",
      nome: r.nome,
      icone: "⭐",
      slug: r.slug,
    }));
    return { "Ranking Atual": lista };
  }, [rankingGeral]);

  return (
    <>
      <Head>
        <title>Os Campeões (Admin) | Fut7Pro</title>
        <meta
          name="description"
          content="Finalize a temporada e veja os destaques reais com base no ranking anual do racha."
        />
        <meta
          name="keywords"
          content="fut7pro, admin, campeões, ranking, temporada, conquistas, futebol"
        />
      </Head>

      <main className="bg-fundo text-white min-h-screen pt-20 pb-24 md:pt-6 md:pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 text-center mt-8 mb-2">
            Os Campeões (Gestão)
          </h1>
          <p className="text-center text-gray-300 mb-8 max-w-2xl mx-auto">
            Dados carregados do ranking anual do seu racha. Ajuste o ano para ver os vencedores e
            destaques por posição.
          </p>

          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="inline-block">
              <select
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-yellow-200 font-semibold"
                value={anoBase}
                onChange={(e) => setAnoSelecionado(Number(e.target.value))}
              >
                {(availableYears.length ? availableYears : [new Date().getFullYear()]).map(
                  (ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  )
                )}
              </select>
            </div>
            <button
              type="button"
              onClick={handleFinalizarTemporada}
              disabled={fechandoTemporada}
              className={`border border-yellow-400 text-yellow-200 font-semibold px-4 py-2 rounded transition ${
                fechandoTemporada ? "opacity-60 cursor-not-allowed" : "hover:bg-yellow-400/10"
              }`}
            >
              {fechandoTemporada ? "Finalizando temporada..." : "Finalizar temporada"}
            </button>
            {mensagemFechamento && (
              <p className="text-sm text-gray-300 text-center">{mensagemFechamento}</p>
            )}
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-yellow-400 text-center mb-6">Campeões do Ano</h2>
            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 justify-center items-stretch">
              {loadingGeral && (
                <div className="text-center text-gray-400 col-span-full">Carregando ranking...</div>
              )}
              {!loadingGeral &&
                campeoesDoAno.map((c, idx) =>
                  c ? <CampeaoAnoCard key={c.slug || idx} {...c} temporario={false} /> : null
                )}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-yellow-400 text-center mb-6">
              Melhores por Posição
            </h2>
            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 justify-center items-stretch">
              {posicaoRankings.every((r) => r.isLoading) && (
                <div className="text-center text-gray-400 col-span-full">
                  Carregando posições...
                </div>
              )}
              {posicaoRankings.map((r, idx) => {
                const top = r.rankings[0];
                const meta = posicoes[idx];
                if (!top) return null;
                return (
                  <CampeaoAnoCard
                    key={top.slug || idx}
                    titulo={meta.label}
                    nome={top.nome}
                    image={top.foto}
                    valor={`${top.pontos} pts`}
                    icone={meta.icon}
                    href={`/atletas/${top.slug}`}
                    slug={top.slug}
                    temporario={false}
                  />
                );
              })}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-yellow-400 text-center mb-6">
              Campeões por Quadrimestre
            </h2>
            <QuadrimestreGrid dados={quadrimestres} year={anoBase} />
          </section>
        </div>
      </main>
    </>
  );
}
