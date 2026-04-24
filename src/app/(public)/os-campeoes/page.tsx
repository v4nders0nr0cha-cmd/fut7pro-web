"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import QuadrimestreGrid from "@/components/cards/QuadrimestreGrid";
import PageHelp from "@/components/public/PageHelp";
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

export default function CampeoesPage() {
  const { publicHref, publicSlug } = usePublicLinks();
  const [anoSelecionado, setAnoSelecionado] = useState<number | undefined>(undefined);
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
    const createdYear = resolveYearFromDate(tenantCreatedAt);
    const minYear = createdYear ?? (list.length ? Math.min(...list) : CURRENT_YEAR);
    const maxYear = Math.max(CURRENT_YEAR, createdYear ?? CURRENT_YEAR, ...list);
    const range: number[] = [];
    for (let year = minYear; year <= maxYear; year += 1) {
      range.push(year);
    }
    return range.length ? range : [CURRENT_YEAR];
  }, [rankingAno.availableYears, rankingTimesAno.availableYears, tenantCreatedAt]);

  useEffect(() => {
    if (!anosDisponiveis.length) return;
    if (!anoSelecionado || !anosDisponiveis.includes(anoSelecionado)) {
      setAnoSelecionado(anosDisponiveis[anosDisponiveis.length - 1]);
    }
  }, [anosDisponiveis, anoSelecionado]);

  const isLoading = rankingAno.isLoading || rankingTimesAno.isLoading;
  const isError = rankingAno.isError || rankingTimesAno.isError;
  const errorMessage = rankingAno.error || rankingTimesAno.error || "Erro ao carregar campeões.";

  const campeoesAno = useMemo(() => {
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
        icon: "/images/icons/trofeu-de-ouro.png",
        href: publicHref(`/estatisticas/ranking-anual?year=${anoBase}`),
        temporario,
        highlight: true,
      },
      {
        titulo: "Artilheiro do Ano",
        nome: topGols?.nome ?? "Artilheiro em processamento",
        valor: topGols ? `${topGols.gols} gols` : "Em processamento",
        image: safeImage(topGols?.foto, DEFAULT_PLAYER_IMAGE),
        icon: "/images/icons/bola-de-ouro.png",
        href: publicHref(`/estatisticas/artilheiros?period=temporada&year=${anoBase}`),
        temporario,
        highlight: true,
      },
      {
        titulo: "Campeão do Ano",
        nome: topTime?.nome ?? "Time em processamento",
        valor: topTime ? `${topTime.pontos} pontos` : "Em processamento",
        image: safeImage(topTime?.logo, DEFAULT_TEAM_IMAGE),
        icon: "/images/icons/trofeu-de-ouro.png",
        href: publicHref(`/estatisticas/classificacao-dos-times?year=${anoBase}`),
        temporario,
        highlight: true,
      },
      {
        titulo: "Maestro do Ano",
        nome: topAssist?.nome ?? "Maestro em processamento",
        valor: topAssist ? `${topAssist.assistencias} assistências` : "Em processamento",
        image: safeImage(topAssist?.foto, "/images/jogadores/jogador_padrao_05.jpg"),
        icon: "/images/icons/chuteira-de-ouro.png",
        href: publicHref(`/estatisticas/assistencias?period=temporada&year=${anoBase}`),
        temporario,
        highlight: true,
      },
    ];
  }, [anoBase, publicHref, rankingAno.rankings, rankingTimesAno.teams]);

  const melhoresPorPosicao = useMemo(() => {
    const temporario = anoBase === CURRENT_YEAR;
    return positionMeta.map((meta) => {
      const top = pickTopByPosition(rankingAno.rankings, meta.key);
      return {
        titulo: meta.label,
        nome: top?.nome ?? "Ranking em processamento",
        valor: top ? `${top.pontos} pontos` : "Em processamento",
        image: safeImage(top?.foto, meta.fallback),
        icon: meta.icon,
        href: publicHref(`${meta.href}?period=temporada&year=${anoBase}`),
        temporario,
        highlight: true,
      };
    });
  }, [anoBase, publicHref, rankingAno.rankings]);

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

  if (isLoading) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 pt-[40px] pb-10">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-4 text-lg text-textoSuave">Carregando campeões...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 pt-[40px] pb-10">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Erro ao carregar campeões</h1>
          <p className="text-red-300">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Os Campeões | Hall da Fama do Racha | Fut7Pro</title>
        <meta
          name="description"
          content="Hall da Fama oficial do racha com campeões do ano e de cada quadrimestre, baseado em rankings reais de pontos, gols, assistências e desempenho por posição."
        />
        <meta
          name="keywords"
          content="campeões do racha, hall da fama, ranking anual, ranking quadrimestral, conquistas, artilheiros, assistências, fut7pro"
        />
      </Head>

      <main className="w-full max-w-[1440px] mx-auto px-4 pt-[40px] pb-12">
        <h1 className="sr-only">
          Os Campeões do Racha - Melhores do Ano, Rankings e Campeões por Quadrimestre
        </h1>

        <PageHelp
          title="Os Campeões"
          summary="Hall da Fama oficial com títulos anuais e quadrimestrais do racha."
          className="mb-8"
          detailsTitle="Como funciona a página Os Campeões"
          details={
            <>
              <p>
                A página Os Campeões consolida os títulos oficiais do racha por ano e por
                quadrimestre, com vencedores calculados a partir das partidas publicadas.
              </p>

              <div>
                <h4 className="text-brand-soft font-semibold mb-2">Campeões do Ano</h4>
                <p>
                  A temporada destaca Melhor do Ano, Artilheiro do Ano, Maestro do Ano e Campeão do
                  Ano. Cada card abre o ranking correspondente já filtrado para o ano selecionado.
                </p>
              </div>

              <div>
                <h4 className="text-brand-soft font-semibold mb-2">Melhores por Posição</h4>
                <p>
                  Atacante, meia, zagueiro e goleiro do ano são definidos pela maior pontuação entre
                  atletas da mesma função.
                </p>
              </div>

              <div>
                <h4 className="text-brand-soft font-semibold mb-2">Campeões por Quadrimestre</h4>
                <p>
                  O ano é dividido em três períodos: janeiro a abril, maio a agosto e setembro a
                  dezembro. Cada quadrimestre possui seus próprios campeões.
                </p>
              </div>
            </>
          }
        />

        <div className="flex flex-col items-center gap-4 mb-10">
          <label htmlFor="ano-campeoes" className="text-brand font-semibold">
            Selecione o ano
          </label>
          <select
            id="ano-campeoes"
            value={anoBase}
            onChange={(event) => setAnoSelecionado(Number(event.target.value))}
            className="bg-[#1A1A1A] text-white border border-brand px-4 py-2 rounded"
          >
            {anosDisponiveis.map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>
        </div>

        <section className="mb-12">
          <h3 className="text-2xl font-bold text-brand text-center mb-6">Campeões do Ano</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {campeoesAno.map((card) => (
              <ChampionHighlightCard key={card.titulo} {...card} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h3 className="text-2xl font-bold text-brand text-center mb-6">
            Melhores por Posição no Ano
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {melhoresPorPosicao.map((card) => (
              <ChampionHighlightCard key={card.titulo} {...card} />
            ))}
          </div>
        </section>

        <section className="mb-4">
          <h3 className="text-2xl font-bold text-brand text-center mb-6">
            Campeões por Quadrimestre
          </h3>
          <QuadrimestreGrid
            dados={quadrimestres}
            year={anoBase}
            tenantCreatedAt={tenantCreatedAt}
          />
        </section>
      </main>
    </>
  );
}

function ChampionHighlightCard({
  titulo,
  nome,
  valor,
  href,
  image,
  icon,
  temporario,
  highlight,
}: {
  titulo: string;
  nome: string;
  valor: string;
  href: string;
  image: string;
  icon: string;
  temporario?: boolean;
  highlight?: boolean;
}) {
  const highlightClasses = highlight
    ? "shadow-[0_0_18px_2px_var(--brand)] ring-1 ring-brand hover:shadow-[0_0_24px_4px_var(--brand)]"
    : "hover:shadow-[0_0_10px_2px_var(--brand)]";
  const paddingClass = temporario ? "pt-7" : "";
  return (
    <Link
      href={href}
      className={`relative block bg-[#1A1A1A] rounded-xl p-4 ${paddingClass} transition-shadow ${highlightClasses}`}
    >
      {highlight && (
        <span className="pointer-events-none absolute -top-10 left-1/2 h-20 w-40 -translate-x-1/2 rounded-full bg-brand/20 blur-2xl" />
      )}
      {temporario && (
        <span className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider text-gray-200 bg-black/40 px-2 py-0.5 rounded-full z-10">
          dados parciais
        </span>
      )}
      {icon && (
        <div className="absolute top-2 right-3">
          {icon.startsWith("/") ? (
            <Image src={icon} alt={`Ícone ${titulo}`} width={28} height={28} />
          ) : (
            <span className="text-2xl">{icon}</span>
          )}
        </div>
      )}
      <p className="text-[11px] uppercase font-bold text-brand mb-2 pr-10">{titulo}</p>
      <div className="flex items-center gap-3">
        <Image
          src={image}
          alt={`Imagem de ${nome}`}
          width={48}
          height={48}
          className="rounded-md object-cover"
        />
        <div className="flex flex-col">
          <p className="font-semibold text-sm text-white">{nome}</p>
          <p className="text-brand text-xs">{valor}</p>
        </div>
      </div>
    </Link>
  );
}

function safeImage(src?: string | null, fallback: string = DEFAULT_PLAYER_IMAGE) {
  if (!src) return fallback;
  const trimmed = src.trim();
  return trimmed ? trimmed : fallback;
}

function resolveYearFromDate(value?: string | null) {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.getFullYear();
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
      titulo: "Campeão do Quadrimestre",
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
