"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
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

export default function CampeoesPage() {
  const { publicHref, publicSlug } = usePublicLinks();
  const [anoSelecionado, setAnoSelecionado] = useState<number | undefined>(undefined);
  const [saibaMaisOpen, setSaibaMaisOpen] = useState(false);
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
          content="Veja os campeoes do ano e por quadrimestre no racha. Hall da fama com rankings de pontos, gols e assistencias, sempre atualizado em tempo real."
        />
        <meta
          name="keywords"
          content="os campeoes, hall da fama, ranking anual, ranking quadrimestral, artilheiros, assistencias, fut7, futebol 7, racha"
        />
      </Head>

      <main className="w-full max-w-[1440px] mx-auto px-4 pt-[40px] pb-12">
        <h1 className="sr-only">
          Os Campeões do Racha - Melhores do Ano, Rankings e Campeões por Quadrimestre
        </h1>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-brand mb-2">Os Campeões</h2>
          <p className="text-textoSuave">
            Hall da Fama do racha, com os campeões do ano e de cada quadrimestre, baseados em
            desempenho real nos jogos, rankings e estatísticas oficiais.
          </p>
          <div className="flex justify-center mt-3">
            <button
              type="button"
              onClick={() => setSaibaMaisOpen(true)}
              className="text-brand-soft hover:text-brand-soft font-semibold text-sm underline underline-offset-4"
            >
              Saiba mais
            </button>
          </div>
        </div>

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

      <Transition.Root show={saibaMaisOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSaibaMaisOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/80 transition-opacity" aria-hidden="true" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center px-4 py-6 overflow-y-auto">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-6"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-6"
            >
              <Dialog.Panel className="relative w-full max-w-3xl mx-auto bg-[#191919] rounded-2xl shadow-xl px-6 pb-6 pt-8 border border-brand/10 max-h-[85vh] overflow-y-auto">
                <button
                  onClick={() => setSaibaMaisOpen(false)}
                  className="absolute right-4 top-4 bg-black/70 rounded-full px-3 py-1 text-white text-sm"
                  aria-label="Fechar"
                >
                  X
                </button>

                <Dialog.Title className="text-2xl font-bold text-brand mb-4 text-center">
                  Como funciona a página Os Campeões
                </Dialog.Title>

                <div className="space-y-5 text-sm text-gray-200 leading-relaxed">
                  <p>
                    A página Os Campeões funciona como o Hall da Fama oficial do racha, destacando
                    os melhores atletas e times ao longo do ano e de cada quadrimestre, com base em
                    dados reais registrados no sistema. Todos os campeões são definidos
                    automaticamente a partir dos rankings, estatísticas e resultados oficiais das
                    partidas, sem interferência manual.
                  </p>

                  <div>
                    <h4 className="text-brand-soft font-semibold mb-2">Escolha do Ano</h4>
                    <p>
                      Você pode selecionar o ano desejado para visualizar os campeões daquele
                      período. Os anos disponíveis começam a partir do ano de criação do racha e
                      seguem de forma cronológica.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-brand-soft font-semibold mb-2">Campeões do Ano</h4>
                    <p className="mb-2">
                      Nesta seção são exibidos os principais destaques da temporada:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Melhor do Ano: atleta com maior pontuação total no ano.</li>
                      <li>Artilheiro do Ano: atleta com maior número de gols no ano.</li>
                      <li>Maestro do Ano: atleta com maior número de assistências no ano.</li>
                      <li>Campeão do Ano: time com maior pontuação acumulada no ano.</li>
                    </ul>
                    <p className="mt-2">
                      Ao clicar em qualquer card, você é direcionado ao ranking correspondente
                      daquele ano. Quando o ano ainda não foi finalizado, os cards exibem o selo
                      "Temporariamente", indicando que os resultados podem mudar até o encerramento
                      da temporada.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-brand-soft font-semibold mb-2">
                      Melhores por Posição no Ano
                    </h4>
                    <p className="mb-2">
                      Abaixo dos campeões principais estão os vencedores por posição, considerando
                      apenas atletas da mesma função:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Atacante do Ano</li>
                      <li>Meia do Ano</li>
                      <li>Zagueiro do Ano</li>
                      <li>Goleiro do Ano</li>
                    </ul>
                    <p className="mt-2">
                      O critério é sempre o mesmo: maior pontuação dentro da posição no ano
                      selecionado. Cada card leva ao ranking específico daquela posição.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-brand-soft font-semibold mb-2">
                      Campeões por Quadrimestre
                    </h4>
                    <p className="mb-2">O ano é dividido em três quadrimestres:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>1o Quadrimestre: Janeiro a Abril</li>
                      <li>2o Quadrimestre: Maio a Agosto</li>
                      <li>3o Quadrimestre: Setembro a Dezembro</li>
                    </ul>
                    <p className="mt-2">
                      Cada quadrimestre possui seus próprios campeões, definidos apenas pelo
                      desempenho dentro daquele período. Ao final de cada quadrimestre:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Os rankings do período são finalizados.</li>
                      <li>Os campeões recebem o selo de Campeão do Quadrimestre.</li>
                      <li>
                        Os rankings do próximo quadrimestre reiniciam do zero, garantindo disputa
                        justa.
                      </li>
                    </ul>
                    <p className="mt-2">
                      Antes do início de um quadrimestre, os rankings aparecem com a mensagem:
                      "Ranking liberado no início do quadrimestre."
                    </p>
                  </div>

                  <div>
                    <h4 className="text-brand-soft font-semibold mb-2">
                      Conquistas e Ícones no Perfil
                    </h4>
                    <p className="mb-2">
                      Sempre que um atleta ou time conquista um título (anual ou quadrimestral), ele
                      recebe um ícone de premiação virtual. Esses ícones:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Ficam visíveis no perfil do atleta.</li>
                      <li>São permanentes.</li>
                      <li>
                        São organizados por importância, dando mais destaque aos títulos mais raros
                        e difíceis de conquistar.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-brand-soft font-semibold mb-2">Observação Importante</h4>
                    <p>
                      Se um racha for criado no meio do ano, apenas os quadrimestres a partir da
                      data de criação passam a ser considerados. Quadrimestres já encerrados antes
                      da criação do racha não terão campeões.
                    </p>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
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
          temporariamente
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
