"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Shuffle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import ChampionBanner from "@/components/cards/ChampionBanner";
import GamesOfTheDayMobileModal from "@/components/cards/GamesOfTheDayMobileModal";
import TopTeamsCard from "@/components/cards/TopTeamsCard";
import Card from "@/components/cards/Card";
import Sidebar from "@/components/layout/Sidebar";
import PlayerCard from "@/components/cards/PlayerCard";
import GamesOfTheDay from "@/components/cards/GamesOfTheDay";
import DestaquesRegrasModal from "@/components/modals/DestaquesRegrasModal";
import { useJogosDoDia } from "@/hooks/useJogosDoDia";
import { usePublicMatches } from "@/hooks/usePublicMatches";
import { usePublicDestaquesDoDia } from "@/hooks/usePublicDestaquesDoDia";
import { useRacha } from "@/context/RachaContext";
import { rachaConfig } from "@/config/racha.config";
import { useAuth } from "@/hooks/useAuth";
import { usePublicLinks } from "@/hooks/usePublicLinks";
import { buildDestaquesDoDia, getTimeCampeao } from "@/utils/destaquesDoDia";
import { resolvePublicTenantSlug } from "@/utils/public-links";
import type { PublicMatch } from "@/types/partida";

const DEFAULT_PLAYER_IMAGE = "/images/jogadores/jogador_padrao_01.jpg";
const DEFAULT_TEAM_IMAGE = "/images/torneios/torneio-matador.jpg";
const BOT_PLAYER_IMAGE = "/images/jogadores/Jogador-Reserva.png";
const BOT_GOALKEEPER_IMAGE = "/images/jogadores/Goleiro-Reserva.png";

type PositionCode = "ATA" | "MEIA" | "ZAG" | "GOL" | "";

type PlayerStats = {
  id: string;
  name: string;
  nickname?: string;
  positionCode: PositionCode;
  photoUrl?: string | null;
  goals: number;
  assists: number;
  games: number;
  presences: number;
};

type HighlightPlayer = {
  id: string;
  name: string;
  posicao: string;
  foto: string;
  gols: number;
  assistencias: number;
  partidas: number;
  presencas: number;
  status?: "titular" | "substituto" | "ausente";
  highlightBadge?: string;
  highlightCriteria?: string;
  highlightValue?: number | null;
  highlightValueLabel?: string;
  highlightFooterText?: string;
  highlightIcon?: string;
};

type HighlightMeta = {
  criteria: string;
  badge: string;
  icon: string;
  statKey?: keyof Pick<PlayerStats, "goals" | "assists">;
  statLabel?: string;
  footerText?: string;
};

const HIGHLIGHT_META: Record<"atacante" | "meia" | "zagueiro" | "goleiro", HighlightMeta> = {
  atacante: {
    criteria: "Mais gols no time campeão",
    badge: "Automático",
    icon: "/images/icons/atacante-do-ano.png",
    statKey: "goals",
    statLabel: "gols",
  },
  meia: {
    criteria: "Mais assistências no time campeão",
    badge: "Automático",
    icon: "/images/icons/meia-do-ano.png",
    statKey: "assists",
    statLabel: "assistências",
  },
  zagueiro: {
    criteria: "Escolha do admin (time campeão)",
    badge: "Manual",
    icon: "/images/icons/zagueiro-do-ano.png",
    footerText: "Manual",
  },
  goleiro: {
    criteria: "Goleiro do time campeão",
    badge: "Automático",
    icon: "/images/icons/luva-de-ouro.png",
    footerText: "Automático",
  },
};

const DESTAQUE_CRITERIA = {
  atacante: "Mais gols no time campeão",
  meia: "Mais assistências no time campeão",
  zagueiro: "Escolha do admin (time campeão)",
  goleiro: "Goleiro do time campeão",
  artilheiro: "Mais gols no dia (qualquer time)",
  maestro: "Mais assistências no dia (qualquer time)",
};

function parseMatchDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function hasValidScore(match: PublicMatch) {
  const scoreA = match.score?.teamA ?? match.scoreA;
  const scoreB = match.score?.teamB ?? match.scoreB;
  return typeof scoreA === "number" && typeof scoreB === "number";
}

function normalizePosition(value?: string | null): PositionCode {
  if (!value) return "";
  const normalized = value.toLowerCase();
  if (normalized.includes("gol")) return "GOL";
  if (normalized.includes("zag") || normalized.includes("def")) return "ZAG";
  if (normalized.includes("ata")) return "ATA";
  if (normalized.includes("mei")) return "MEIA";
  return "";
}

function buildDayStats(matches: PublicMatch[]): PlayerStats[] {
  const map = new Map<string, PlayerStats>();

  matches.forEach((match) => {
    (match.presences ?? []).forEach((presence) => {
      const athlete = presence.athlete;
      if (!athlete?.name) return;
      if (presence.status === "AUSENTE") return;

      const id = athlete.id || `${athlete.name}-${presence.teamId ?? match.id}`;
      const existing = map.get(id);
      const current = existing || {
        id,
        name: athlete.name,
        nickname: athlete.nickname ?? undefined,
        positionCode: normalizePosition(athlete.position),
        photoUrl: athlete.photoUrl ?? null,
        goals: 0,
        assists: 0,
        games: 0,
        presences: 0,
      };

      current.goals += Number(presence.goals ?? 0);
      current.assists += Number(presence.assists ?? 0);
      current.games += 1;
      current.presences += 1;

      map.set(id, current);
    });
  });

  return Array.from(map.values());
}

function pickTop(
  list: PlayerStats[],
  primary: keyof Pick<PlayerStats, "goals" | "assists" | "games">,
  secondary: keyof Pick<PlayerStats, "goals" | "assists" | "games">
) {
  if (!list.length) return null;
  return [...list].sort((a, b) => {
    if (b[primary] !== a[primary]) return b[primary] - a[primary];
    return b[secondary] - a[secondary];
  })[0];
}

function buildHighlight(
  stat: PlayerStats | null,
  title: string,
  meta?: HighlightMeta
): HighlightPlayer | null {
  if (!stat) return null;
  const highlightValue = meta?.statKey ? stat[meta.statKey] : null;
  return {
    id: stat.id,
    name: stat.name,
    posicao: title,
    foto: stat.photoUrl || DEFAULT_PLAYER_IMAGE,
    gols: stat.goals,
    assistencias: stat.assists,
    partidas: stat.games,
    presencas: stat.presences,
    highlightBadge: meta?.badge,
    highlightCriteria: meta?.criteria,
    highlightValue,
    highlightValueLabel: meta?.statLabel,
    highlightFooterText: meta?.footerText || meta?.badge,
    highlightIcon: meta?.icon,
  };
}

function buildBotHighlight(
  title: string,
  role: "atacante" | "meia" | "zagueiro" | "goleiro",
  meta?: HighlightMeta
) {
  const isGoalkeeper = role === "goleiro";
  const highlightValue = meta?.statKey ? 0 : null;
  return {
    id: `bot-${role}`,
    name: isGoalkeeper ? "Goleiro Reserva BOT" : "Jogador Reserva BOT",
    posicao: title,
    foto: isGoalkeeper ? BOT_GOALKEEPER_IMAGE : BOT_PLAYER_IMAGE,
    gols: 0,
    assistencias: 0,
    partidas: 0,
    presencas: 0,
    highlightBadge: meta?.badge,
    highlightCriteria: meta?.criteria,
    highlightValue,
    highlightValueLabel: meta?.statLabel,
    highlightFooterText: meta?.footerText || meta?.badge,
    highlightIcon: meta?.icon,
    status: "ausente" as const,
  };
}

export default function Home() {
  const { tenantSlug } = useRacha();
  const { publicHref, publicSlug } = usePublicLinks();
  const slug = publicSlug.trim() || tenantSlug.trim() || rachaConfig.slug;
  const { hasPermission } = useAuth();
  const pathname = usePathname() ?? "";
  const { data: session } = useSession();
  const slugFromPath = resolvePublicTenantSlug(pathname);
  const sessionSlug =
    typeof (session?.user as any)?.tenantSlug === "string"
      ? (session?.user as any).tenantSlug.trim().toLowerCase()
      : "";
  const isTenantSession = Boolean(slugFromPath && sessionSlug && slugFromPath === sessionSlug);
  const isAdmin = isTenantSession && hasPermission("RACHA_UPDATE");

  const [modalOpen, setModalOpen] = useState(false);
  const [regrasOpen, setRegrasOpen] = useState(false);
  const {
    jogos: jogosDoDia,
    isLoading: isLoadingJogos,
    isError: isErrorJogos,
  } = useJogosDoDia(slug);

  const {
    matches,
    isLoading: isLoadingHighlights,
    isError: isErrorHighlights,
  } = usePublicMatches({
    slug,
    scope: "recent",
    limit: 20,
  });
  const { destaque: destaqueDia } = usePublicDestaquesDoDia({ slug });

  const { confrontos, times, dataReferencia } = useMemo(
    () => buildDestaquesDoDia(matches),
    [matches]
  );

  const campeaoInfo = useMemo(() => getTimeCampeao(confrontos, times), [confrontos, times]);
  const matchesDoDia = useMemo(() => {
    if (!dataReferencia) return [];
    const reference = parseMatchDate(dataReferencia);
    if (!reference) return [];
    return matches.filter((match) => {
      if (!hasValidScore(match)) return false;
      const date = parseMatchDate(match.date);
      return date ? isSameDay(date, reference) : false;
    });
  }, [matches, dataReferencia]);

  const stats = useMemo(() => buildDayStats(matchesDoDia), [matchesDoDia]);
  const destaqueFaltou = destaqueDia?.faltou ?? null;

  const highlights = useMemo(() => {
    const championPlayers = campeaoInfo?.time?.jogadores ?? [];
    const statsByName = new Map(stats.map((stat) => [stat.name, stat]));
    const statsById = new Map(stats.map((stat) => [stat.id, stat]));
    const manualZagueiroId = destaqueDia?.zagueiroId ?? null;

    const buildFromChampion = (
      pos: PositionCode,
      primary: keyof Pick<PlayerStats, "goals" | "assists" | "games">,
      secondary: keyof Pick<PlayerStats, "goals" | "assists" | "games">
    ) => {
      const candidates = championPlayers.filter((player) => player.pos === pos);
      if (!candidates.length) return null;
      const enriched = candidates.map((player) => {
        const stat = statsByName.get(player.nome);
        if (stat) return stat;
        return {
          id: player.id || player.nome,
          name: player.nome,
          nickname: player.apelido || undefined,
          positionCode: pos,
          photoUrl: player.foto || null,
          goals: 0,
          assists: 0,
          games: 0,
          presences: 0,
        } as PlayerStats;
      });
      return pickTop(enriched, primary, secondary);
    };

    const resolveManualZagueiro = () => {
      if (!manualZagueiroId) return null;
      const byId = statsById.get(manualZagueiroId);
      if (byId) return byId;
      const candidate = championPlayers.find((player) => player.id === manualZagueiroId);
      if (!candidate) return null;
      return {
        id: candidate.id || candidate.nome,
        name: candidate.nome,
        nickname: candidate.apelido || undefined,
        positionCode: "ZAG",
        photoUrl: candidate.foto || null,
        goals: 0,
        assists: 0,
        games: 0,
        presences: 0,
      } as PlayerStats;
    };

    const atacantes = stats.filter((stat) => stat.positionCode === "ATA");
    const meias = stats.filter((stat) => stat.positionCode === "MEIA");
    const zagueiros = stats.filter((stat) => stat.positionCode === "ZAG");
    const goleiros = stats.filter((stat) => stat.positionCode === "GOL");

    const zagueiroManual = resolveManualZagueiro();

    const atacante =
      buildFromChampion("ATA", "goals", "assists") || pickTop(atacantes, "goals", "assists");
    const meia =
      buildFromChampion("MEIA", "assists", "goals") || pickTop(meias, "assists", "goals");
    const zagueiro =
      zagueiroManual || buildFromChampion("ZAG", "games", "goals") || zagueiros[0] || null;
    const goleiro = buildFromChampion("GOL", "games", "goals") || goleiros[0] || null;

    const artilheiro = pickTop(stats, "goals", "assists");
    const maestro = pickTop(stats, "assists", "goals");

    return {
      atacante,
      meia,
      zagueiro,
      goleiro,
      artilheiro,
      maestro,
    };
  }, [campeaoInfo, stats, destaqueDia?.zagueiroId]);

  const destaqueDate = destaqueDia?.date ? parseMatchDate(destaqueDia.date) : null;
  const championDate = dataReferencia
    ? new Date(dataReferencia).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : destaqueDate
      ? destaqueDate.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : isLoadingHighlights
        ? "Carregando..."
        : "Resultados pendentes";

  const championPlayers =
    campeaoInfo?.time?.jogadores?.map((player) => player.nome).filter(Boolean) ?? [];
  const bannerImage = destaqueDia?.bannerUrl || campeaoInfo?.time?.logoUrl || DEFAULT_TEAM_IMAGE;

  const highlightCards = [
    destaqueFaltou?.atacante
      ? buildBotHighlight("Atacante do Dia", "atacante", HIGHLIGHT_META.atacante)
      : buildHighlight(highlights.atacante, "Atacante do Dia", HIGHLIGHT_META.atacante),
    destaqueFaltou?.meia
      ? buildBotHighlight("Meia do Dia", "meia", HIGHLIGHT_META.meia)
      : buildHighlight(highlights.meia, "Meia do Dia", HIGHLIGHT_META.meia),
    destaqueFaltou?.zagueiro
      ? buildBotHighlight("Zagueiro do Dia", "zagueiro", HIGHLIGHT_META.zagueiro)
      : buildHighlight(highlights.zagueiro, "Zagueiro do Dia", HIGHLIGHT_META.zagueiro),
    destaqueFaltou?.goleiro
      ? buildBotHighlight("Goleiro do Dia", "goleiro", HIGHLIGHT_META.goleiro)
      : buildHighlight(highlights.goleiro, "Goleiro do Dia", HIGHLIGHT_META.goleiro),
  ].filter(Boolean) as HighlightPlayer[];

  const modalDestaques = [
    destaqueFaltou?.atacante
      ? {
          title: "Atacante do Dia",
          name: "Jogador Reserva BOT",
          criteria: DESTAQUE_CRITERIA.atacante,
          image: BOT_PLAYER_IMAGE,
        }
      : highlights.atacante
        ? {
            title: "Atacante do Dia",
            name: highlights.atacante.name,
            criteria: DESTAQUE_CRITERIA.atacante,
            value:
              typeof highlights.atacante.goals === "number"
                ? `${highlights.atacante.goals} gols`
                : undefined,
            image: highlights.atacante.photoUrl || DEFAULT_PLAYER_IMAGE,
          }
        : null,
    destaqueFaltou?.meia
      ? {
          title: "Meia do Dia",
          name: "Jogador Reserva BOT",
          criteria: DESTAQUE_CRITERIA.meia,
          image: BOT_PLAYER_IMAGE,
        }
      : highlights.meia
        ? {
            title: "Meia do Dia",
            name: highlights.meia.name,
            criteria: DESTAQUE_CRITERIA.meia,
            value:
              typeof highlights.meia.assists === "number"
                ? `${highlights.meia.assists} assistências`
                : undefined,
            image: highlights.meia.photoUrl || DEFAULT_PLAYER_IMAGE,
          }
        : null,
    destaqueFaltou?.zagueiro
      ? {
          title: "Zagueiro do Dia",
          name: "Jogador Reserva BOT",
          criteria: DESTAQUE_CRITERIA.zagueiro,
          image: BOT_PLAYER_IMAGE,
        }
      : highlights.zagueiro
        ? {
            title: "Zagueiro do Dia",
            name: highlights.zagueiro.name,
            criteria: DESTAQUE_CRITERIA.zagueiro,
            image: highlights.zagueiro.photoUrl || DEFAULT_PLAYER_IMAGE,
          }
        : null,
    destaqueFaltou?.goleiro
      ? {
          title: "Goleiro do Dia",
          name: "Goleiro Reserva BOT",
          criteria: DESTAQUE_CRITERIA.goleiro,
          image: BOT_GOALKEEPER_IMAGE,
        }
      : highlights.goleiro
        ? {
            title: "Goleiro do Dia",
            name: highlights.goleiro.name,
            criteria: DESTAQUE_CRITERIA.goleiro,
            image: highlights.goleiro.photoUrl || DEFAULT_PLAYER_IMAGE,
          }
        : null,
  ].filter(Boolean) as Array<{
    title: string;
    name: string;
    value?: string;
    image?: string;
    criteria?: string;
  }>;

  const modalArtilheiroMaestro = [
    highlights.artilheiro
      ? {
          title: "Artilheiro do Dia",
          name: highlights.artilheiro.name,
          criteria: DESTAQUE_CRITERIA.artilheiro,
          value: highlights.artilheiro.goals ? `${highlights.artilheiro.goals} gols` : undefined,
          image: highlights.artilheiro.photoUrl || DEFAULT_PLAYER_IMAGE,
        }
      : null,
    highlights.maestro
      ? {
          title: "Maestro do Dia",
          name: highlights.maestro.name,
          criteria: DESTAQUE_CRITERIA.maestro,
          value: highlights.maestro.assists
            ? `${highlights.maestro.assists} assistências`
            : undefined,
          image: highlights.maestro.photoUrl || DEFAULT_PLAYER_IMAGE,
        }
      : null,
  ].filter(Boolean) as Array<{
    title: string;
    name: string;
    value?: string;
    image?: string;
    criteria?: string;
  }>;

  const hasHighlights = highlightCards.length > 0;

  return (
    <>
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10 flex flex-col lg:flex-row gap-8">
        {/* CONTEUDO PRINCIPAL */}
        <div className="flex-1">
          <h1 className="sr-only">Fut7Pro: Sistema para Racha, Fut7 e Futebol Amador</h1>

          <ChampionBanner
            image={bannerImage}
            date={championDate}
            players={championPlayers.slice(0, 7)}
            href={publicHref("/partidas/times-do-dia")}
          />

          {/* GRID DESTAQUES DO DIA - Desktop: Sempre visivel; Mobile: sumir e usar modal */}
          <div className="hidden lg:grid grid-cols-4 gap-4 mt-6 mb-10">
            {isLoadingHighlights ? (
              <div className="col-span-4 text-center text-gray-400">
                Carregando destaques do dia...
              </div>
            ) : hasHighlights ? (
              highlightCards.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onRulesClick={() => setRegrasOpen(true)}
                />
              ))
            ) : isErrorHighlights ? (
              <div className="col-span-4 text-center text-red-400">
                Não foi possível carregar os destaques do dia.
              </div>
            ) : (
              <div className="col-span-4 text-center text-gray-400">
                Aguardando resultados para exibir os destaques do dia.
              </div>
            )}
          </div>

          {/* SO MOBILE: Botao "Ver todos os destaques do dia" */}
          <div className="block lg:hidden my-6">
            <button
              onClick={() => setModalOpen(true)}
              className="w-full bg-brand hover:bg-brand-strong transition text-black font-bold rounded-xl py-3 text-base shadow-lg"
            >
              Ver todos os destaques do dia
            </button>
            <GamesOfTheDayMobileModal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              destaques={modalDestaques}
              artilheiroMaestro={modalArtilheiroMaestro}
              isLoading={isLoadingHighlights}
            />
          </div>

          {/* CARDS PRINCIPAIS COM LINKS E ORDEM CORRETA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
            <Link href={publicHref("/atletas")}>
              <Card title="Conquistas" description="Colecione medalhas e evolua seu perfil." />
            </Link>
            <Link href={publicHref("/estatisticas/ranking-geral")}>
              <Card title="Ranking" description="Compare seu desempenho com os melhores." />
            </Link>
            <Link href={publicHref("/os-campeoes")}>
              <Card title="Campeões" description="Veja quem se destacou nos rachas." />
            </Link>
            <Link href={publicHref("/estatisticas/tira-teima")}>
              <Card
                title="Tira Teima"
                description="Compare jogadores lado a lado com dados reais."
              />
            </Link>
            <Link href={publicHref("/estatisticas")}>
              <Card title="Estatísticas" description="Acompanhe sua performance em tempo real." />
            </Link>
            {/* Sorteio Inteligente so e clicavel para admin */}
            {isAdmin ? (
              <Link href="/admin/partidas/sorteio-inteligente">
                <Card
                  title="Sorteio Inteligente"
                  description="Equipes equilibradas com base no histórico."
                  icon={<Shuffle size={22} className="text-brand -ml-1" />}
                  restricted={true}
                  isAdmin={isAdmin}
                />
              </Link>
            ) : (
              <Card
                title="Sorteio Inteligente"
                description="Equipes equilibradas com base no histórico."
                icon={<Shuffle size={22} className="text-brand -ml-1" />}
                restricted={true}
                isAdmin={isAdmin}
              />
            )}
          </div>

          {/* GRID "JOGOS DO DIA" + "CLASSIFICACAO DOS TIMES" */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <div className="cursor-pointer">
              <GamesOfTheDay
                partidas={jogosDoDia}
                isLoading={isLoadingJogos}
                isError={isErrorJogos}
              />
            </div>
            <TopTeamsCard />
          </div>
        </div>

        {/* Sidebar (desktop only) */}
        <aside className="hidden lg:block w-[340px] flex-shrink-0">
          <Sidebar />
        </aside>
      </div>
      <DestaquesRegrasModal open={regrasOpen} onClose={() => setRegrasOpen(false)} />
    </>
  );
}
