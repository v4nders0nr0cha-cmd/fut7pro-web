"use client";

import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import CampeaoAnoCard from "@/components/cards/CampeaoAnoCard";
import QuadrimestreGrid from "@/components/cards/QuadrimestreGrid";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import { usePublicTeamRankings } from "@/hooks/usePublicTeamRankings";
import type { RankingAtleta, QuadrimestresAno } from "@/types/estatisticas";
import type { TeamRankingEntry } from "@/hooks/usePublicTeamRankings";

const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_PLAYER_IMAGE = "/images/jogadores/jogador_padrao_01.jpg";
const DEFAULT_TEAM_IMAGE = "/images/times/time_padrao_01.png";

type TenantInfo = {
  slug: string;
  name: string;
  createdAt: string;
};

const tenantFetcher = async (url: string): Promise<TenantInfo> => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Erro ao carregar dados do racha");
  }
  return res.json();
};

const positionMeta = [
  {
    key: "atacante",
    label: "Atacante do Ano",
    icon: "/images/icons/atacante-do-ano.png",
    href: "/estatisticas/melhores-por-posicao/atacantes",
    fallback: DEFAULT_PLAYER_IMAGE,
  },
  {
    key: "meia",
    label: "Meia do Ano",
    icon: "/images/icons/meia-do-ano.png",
    href: "/estatisticas/melhores-por-posicao/meias",
    fallback: "/images/jogadores/jogador_padrao_03.jpg",
  },
  {
    key: "zagueiro",
    label: "Zagueiro do Ano",
    icon: "/images/icons/zagueiro-do-ano.png",
    href: "/estatisticas/melhores-por-posicao/zagueiros",
    fallback: "/images/jogadores/jogador_padrao_07.jpg",
  },
  {
    key: "goleiro",
    label: "Goleiro do Ano",
    icon: "/images/icons/luva-de-ouro.png",
    href: "/estatisticas/melhores-por-posicao/goleiros",
    fallback: "/images/jogadores/jogador_padrao_09.jpg",
  },
];

export default function OsCampeoesAdminPage() {
  const { publicSlug } = usePublicLinks();
  const [anoSelecionado, setAnoSelecionado] = useState<number | undefined>(undefined);
  const [fechandoTemporada, setFechandoTemporada] = useState(false);
  const [mensagemFechamento, setMensagemFechamento] = useState<string | null>(null);
  const anoBase = anoSelecionado ?? CURRENT_YEAR;

  const tenantKey = publicSlug ? `/api/public/${publicSlug}/tenant` : null;
  const { data: tenantData } = useSWR<TenantInfo>(tenantKey, tenantFetcher, {
    revalidateOnFocus: false,
  });
  const tenantCreatedAt = tenantData?.createdAt;

  const rankingAno = usePublicPlayerRankings({
    slug: publicSlug,
    type: "geral",
    period: "year",
    year: anoBase,
  });

  const rankingTimesAno = usePublicTeamRankings({ slug: publicSlug, year: anoBase });

  const rankingQ1 = usePublicPlayerRankings({
    slug: publicSlug,
    type: "geral",
    period: "quarter",
    year: anoBase,
    quarter: 1,
  });
  const rankingQ2 = usePublicPlayerRankings({
    slug: publicSlug,
    type: "geral",
    period: "quarter",
    year: anoBase,
    quarter: 2,
  });
  const rankingQ3 = usePublicPlayerRankings({
    slug: publicSlug,
    type: "geral",
    period: "quarter",
    year: anoBase,
    quarter: 3,
  });

  const timesQ1 = usePublicTeamRankings({
    slug: publicSlug,
    period: "quarter",
    year: anoBase,
    quarter: 1,
  });
  const timesQ2 = usePublicTeamRankings({
    slug: publicSlug,
    period: "quarter",
    year: anoBase,
    quarter: 2,
  });
  const timesQ3 = usePublicTeamRankings({
    slug: publicSlug,
    period: "quarter",
    year: anoBase,
    quarter: 3,
  });

  const anosDisponiveis = useMemo(() => {
    const combined = new Set<number>();
    rankingAno.availableYears.forEach((year) => combined.add(year));
    rankingTimesAno.availableYears.forEach((year) => combined.add(year));
    const list = Array.from(combined).filter((year) => Number.isFinite(year));
    if (!list.length) return [CURRENT_YEAR];
    return list.sort((a, b) => a - b);
  }, [rankingAno.availableYears, rankingTimesAno.availableYears]);

  useEffect(() => {
    if (!anosDisponiveis.length) return;
    if (!anoSelecionado || !anosDisponiveis.includes(anoSelecionado)) {
      setAnoSelecionado(anosDisponiveis[anosDisponiveis.length - 1]);
    }
  }, [anosDisponiveis, anoSelecionado]);

  const isLoading = rankingAno.isLoading || rankingTimesAno.isLoading;
  const isError = rankingAno.isError || rankingTimesAno.isError;
  const errorMessage = rankingAno.error || rankingTimesAno.error || "Erro ao carregar campeoes.";

  const campeoesDoAno = useMemo(() => {
    const topPontos = pickTopByMetric(rankingAno.rankings, "pontos");
    const topGols = pickTopByMetric(rankingAno.rankings, "gols");
    const topAssist = pickTopByMetric(rankingAno.rankings, "assistencias");
    const topTime = pickTopTeam(rankingTimesAno.teams);
    const temporario = anoBase === CURRENT_YEAR;

    return [
      {
        titulo: "Melhor do Ano",
        nome: topPontos?.nome ?? "Ranking em processamento",
        valor: topPontos ? `${topPontos.pontos} pontos` : "Em processamento",
        image: safeImage(topPontos?.foto, DEFAULT_PLAYER_IMAGE),
        icone: "/images/icons/trofeu-de-ouro.png",
        href: `/estatisticas/ranking-anual?year=${anoBase}`,
        slug: topPontos?.slug,
        temporario,
      },
      {
        titulo: "Artilheiro do Ano",
        nome: topGols?.nome ?? "Artilheiro em processamento",
        valor: topGols ? `${topGols.gols} gols` : "Em processamento",
        image: safeImage(topGols?.foto, DEFAULT_PLAYER_IMAGE),
        icone: "/images/icons/bola-de-ouro.png",
        href: `/estatisticas/artilheiros?period=temporada&year=${anoBase}`,
        slug: topGols?.slug,
        temporario,
      },
      {
        titulo: "Campeao do Ano",
        nome: topTime?.nome ?? "Time em processamento",
        valor: topTime ? `${topTime.pontos} pontos` : "Em processamento",
        image: safeImage(topTime?.logo, DEFAULT_TEAM_IMAGE),
        icone: "/images/icons/trofeu-de-ouro.png",
        href: `/estatisticas/classificacao-dos-times?year=${anoBase}`,
        temporario,
      },
      {
        titulo: "Maestro do Ano",
        nome: topAssist?.nome ?? "Maestro em processamento",
        valor: topAssist ? `${topAssist.assistencias} assistencias` : "Em processamento",
        image: safeImage(topAssist?.foto, "/images/jogadores/jogador_padrao_05.jpg"),
        icone: "/images/icons/chuteira-de-ouro.png",
        href: `/estatisticas/assistencias?period=temporada&year=${anoBase}`,
        slug: topAssist?.slug,
        temporario,
      },
    ];
  }, [anoBase, rankingAno.rankings, rankingTimesAno.teams]);

  const melhoresPorPosicao = useMemo(() => {
    const temporario = anoBase === CURRENT_YEAR;
    return positionMeta.map((meta) => {
      const top = pickTopByPosition(rankingAno.rankings, meta.key);
      return {
        titulo: meta.label,
        nome: top?.nome ?? "Ranking em processamento",
        valor: top ? `${top.pontos} pontos` : "Em processamento",
        image: safeImage(top?.foto, meta.fallback),
        icone: meta.icon,
        href: `${meta.href}?period=temporada&year=${anoBase}`,
        slug: top?.slug,
        temporario,
      };
    });
  }, [anoBase, rankingAno.rankings]);

  const quadrimestres = useMemo<QuadrimestresAno>(() => {
    return {
      "1o Quadrimestre": buildQuadrimestreItems(rankingQ1.rankings, timesQ1.teams),
      "2o Quadrimestre": buildQuadrimestreItems(rankingQ2.rankings, timesQ2.teams),
      "3o Quadrimestre": buildQuadrimestreItems(rankingQ3.rankings, timesQ3.teams),
    };
  }, [
    rankingQ1.rankings,
    rankingQ2.rankings,
    rankingQ3.rankings,
    timesQ1.teams,
    timesQ2.teams,
    timesQ3.teams,
  ]);

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

  return (
    <>
      <Head>
        <title>Os Campeoes (Admin) | Fut7Pro</title>
        <meta
          name="description"
          content="Finalize a temporada e veja os destaques reais com base no ranking anual do racha."
        />
        <meta
          name="keywords"
          content="fut7pro, admin, campeoes, ranking, temporada, conquistas, futebol"
        />
      </Head>

      <main className="bg-fundo text-white min-h-screen pt-20 pb-24 md:pt-6 md:pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 text-center mt-8 mb-2">
            Os Campeoes (Gestao)
          </h1>
          <p className="text-center text-gray-300 mb-8 max-w-2xl mx-auto">
            Dados carregados do ranking anual do seu racha. Ajuste o ano para ver os vencedores e
            destaques por posicao.
          </p>

          {isError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center text-red-300 mb-6">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="inline-block">
              <select
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-yellow-200 font-semibold"
                value={anoBase}
                onChange={(e) => setAnoSelecionado(Number(e.target.value))}
              >
                {anosDisponiveis.map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
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
            <h2 className="text-2xl font-bold text-yellow-400 text-center mb-6">Campeoes do Ano</h2>
            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 justify-center items-stretch">
              {isLoading && (
                <div className="text-center text-gray-400 col-span-full">Carregando ranking...</div>
              )}
              {!isLoading &&
                campeoesDoAno.map((campeao) => (
                  <CampeaoAnoCard key={campeao.titulo} {...campeao} />
                ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-yellow-400 text-center mb-6">
              Melhores por Posicao
            </h2>
            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 justify-center items-stretch">
              {isLoading && (
                <div className="text-center text-gray-400 col-span-full">
                  Carregando posicoes...
                </div>
              )}
              {!isLoading &&
                melhoresPorPosicao.map((campeao) => (
                  <CampeaoAnoCard key={campeao.titulo} {...campeao} />
                ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-yellow-400 text-center mb-6">
              Campeoes por Quadrimestre
            </h2>
            <QuadrimestreGrid
              dados={quadrimestres}
              year={anoBase}
              tenantCreatedAt={tenantCreatedAt}
            />
          </section>
        </div>
      </main>
    </>
  );
}

function safeImage(src?: string | null, fallback: string = DEFAULT_PLAYER_IMAGE) {
  if (!src) return fallback;
  const trimmed = src.trim();
  return trimmed ? trimmed : fallback;
}

function pickTopByMetric(list: RankingAtleta[], metric: "pontos" | "gols" | "assistencias") {
  if (!list.length) return undefined;
  return [...list].sort((a, b) => (b[metric] ?? 0) - (a[metric] ?? 0))[0];
}

function pickTopByPosition(list: RankingAtleta[], positionKey: string) {
  const filtered = list.filter((item) => {
    const pos = normalizePosition(item.posicao ?? item.position);
    return pos === positionKey;
  });
  return pickTopByMetric(filtered, "pontos");
}

function pickTopTeam(list: TeamRankingEntry[]) {
  if (!list.length) return undefined;
  return [...list].sort((a, b) => b.pontos - a.pontos)[0];
}

function normalizePosition(value?: string | null) {
  if (!value) return "";
  const cleaned = value.toUpperCase().replace(/[^A-Z]/g, "");
  if (cleaned.startsWith("ATA")) return "atacante";
  if (cleaned.startsWith("MEI")) return "meia";
  if (cleaned.startsWith("ZAG")) return "zagueiro";
  if (
    cleaned.startsWith("GOL") ||
    cleaned.startsWith("GK") ||
    cleaned.startsWith("GL") ||
    cleaned.startsWith("GOALKEEP") ||
    cleaned.startsWith("GOALIE") ||
    cleaned.startsWith("KEEPER")
  ) {
    return "goleiro";
  }
  return cleaned.toLowerCase();
}

function buildQuadrimestreItems(
  rankings: RankingAtleta[],
  teams: TeamRankingEntry[]
): QuadrimestresAno[string] {
  const topPontos = pickTopByMetric(rankings, "pontos");
  const topGols = pickTopByMetric(rankings, "gols");
  const topAssist = pickTopByMetric(rankings, "assistencias");
  const topTeam = pickTopTeam(teams);
  const topAtacante = pickTopByPosition(rankings, "atacante");
  const topMeia = pickTopByPosition(rankings, "meia");
  const topZagueiro = pickTopByPosition(rankings, "zagueiro");
  const topGoleiro = pickTopByPosition(rankings, "goleiro");

  return [
    {
      titulo: "Melhor do Quadrimestre",
      nome: topPontos?.nome ?? "Em processamento",
      icone: "/images/icons/trofeu-de-prata.png",
      slug: topPontos?.slug,
    },
    {
      titulo: "Artilheiro do Quadrimestre",
      nome: topGols?.nome ?? "Em processamento",
      icone: "/images/icons/bola-de-prata.png",
      slug: topGols?.slug,
    },
    {
      titulo: "Maestro do Quadrimestre",
      nome: topAssist?.nome ?? "Em processamento",
      icone: "/images/icons/chuteira-de-prata.png",
      slug: topAssist?.slug,
    },
    {
      titulo: "Campeao do Quadrimestre",
      nome: topTeam?.nome ?? "Em processamento",
      icone: "/images/icons/trofeu-de-prata.png",
    },
    {
      titulo: "Atacante do Quadrimestre",
      nome: topAtacante?.nome ?? "Em processamento",
      icone: "/images/icons/atacante-do-quadrimestre.png",
      slug: topAtacante?.slug,
    },
    {
      titulo: "Meia do Quadrimestre",
      nome: topMeia?.nome ?? "Em processamento",
      icone: "/images/icons/meia-do-quadrimestre.png",
      slug: topMeia?.slug,
    },
    {
      titulo: "Zagueiro do Quadrimestre",
      nome: topZagueiro?.nome ?? "Em processamento",
      icone: "/images/icons/zagueiro-do-quadrimestre.png",
      slug: topZagueiro?.slug,
    },
    {
      titulo: "Goleiro do Quadrimestre",
      nome: topGoleiro?.nome ?? "Em processamento",
      icone: "/images/icons/luva-de-prata.png",
      slug: topGoleiro?.slug,
    },
  ];
}
