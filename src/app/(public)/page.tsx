"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Shuffle } from "lucide-react";
import ChampionBanner from "@/components/cards/ChampionBanner";
import GamesOfTheDayMobileModal from "@/components/cards/GamesOfTheDayMobileModal";
import TopTeamsCard from "@/components/cards/TopTeamsCard";
import Card from "@/components/cards/Card";
import Sidebar from "@/components/layout/Sidebar";
import PlayerCard from "@/components/cards/PlayerCard";
import GamesOfTheDay from "@/components/cards/GamesOfTheDay";
import { useJogosDoDia } from "@/hooks/useJogosDoDia";
import { usePublicMatches } from "@/hooks/usePublicMatches";
import { useRacha } from "@/context/RachaContext";
import { rachaConfig } from "@/config/racha.config";
import { useAuth } from "@/hooks/useAuth";
import { buildDestaquesDoDia, getTimeCampeao } from "@/utils/destaquesDoDia";
import type { PublicMatch } from "@/types/partida";

const DEFAULT_PLAYER_IMAGE = "/images/jogadores/jogador_padrao_01.jpg";
const DEFAULT_TEAM_IMAGE = "/images/times/time_campeao_padrao_01.png";

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
      if (presence.status !== "AUSENTE") current.presences += 1;

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

function buildHighlight(stat: PlayerStats | null, title: string) {
  if (!stat) return null;
  return {
    id: stat.id,
    name: stat.name,
    posicao: title,
    foto: stat.photoUrl || DEFAULT_PLAYER_IMAGE,
    gols: stat.goals,
    assistencias: stat.assists,
    partidas: stat.games,
    presencas: stat.presences,
  };
}

export default function Home() {
  const { tenantSlug } = useRacha();
  const slug = tenantSlug || rachaConfig.slug;
  const { hasPermission } = useAuth();
  const isAdmin = hasPermission("RACHA_UPDATE");

  const [modalOpen, setModalOpen] = useState(false);
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

  const highlights = useMemo(() => {
    const championPlayers = campeaoInfo?.time?.jogadores ?? [];
    const statsByName = new Map(stats.map((stat) => [stat.name, stat]));

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

    const atacantes = stats.filter((stat) => stat.positionCode === "ATA");
    const meias = stats.filter((stat) => stat.positionCode === "MEIA");
    const zagueiros = stats.filter((stat) => stat.positionCode === "ZAG");
    const goleiros = stats.filter((stat) => stat.positionCode === "GOL");

    const atacante =
      buildFromChampion("ATA", "goals", "assists") || pickTop(atacantes, "goals", "assists");
    const meia =
      buildFromChampion("MEIA", "assists", "goals") || pickTop(meias, "assists", "goals");
    const zagueiro = buildFromChampion("ZAG", "games", "goals") || zagueiros[0] || null;
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
  }, [campeaoInfo, stats]);

  const championDate = dataReferencia
    ? new Date(dataReferencia).toLocaleDateString("pt-BR", {
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

  const highlightCards = [
    buildHighlight(highlights.atacante, "Atacante do Dia"),
    buildHighlight(highlights.meia, "Meia do Dia"),
    buildHighlight(highlights.zagueiro, "Zagueiro do Dia"),
    buildHighlight(highlights.goleiro, "Goleiro do Dia"),
  ].filter(Boolean) as Array<NonNullable<ReturnType<typeof buildHighlight>>>;

  const modalDestaques = [
    highlights.atacante
      ? {
          title: "Atacante do Dia",
          name: highlights.atacante.name,
          value: highlights.atacante.goals ? `${highlights.atacante.goals} gols` : undefined,
          image: highlights.atacante.photoUrl || DEFAULT_PLAYER_IMAGE,
        }
      : null,
    highlights.meia
      ? {
          title: "Meia do Dia",
          name: highlights.meia.name,
          value: highlights.meia.assists ? `${highlights.meia.assists} assistencias` : undefined,
          image: highlights.meia.photoUrl || DEFAULT_PLAYER_IMAGE,
        }
      : null,
    highlights.zagueiro
      ? {
          title: "Zagueiro do Dia",
          name: highlights.zagueiro.name,
          image: highlights.zagueiro.photoUrl || DEFAULT_PLAYER_IMAGE,
        }
      : null,
    highlights.goleiro
      ? {
          title: "Goleiro do Dia",
          name: highlights.goleiro.name,
          image: highlights.goleiro.photoUrl || DEFAULT_PLAYER_IMAGE,
        }
      : null,
  ].filter(Boolean) as Array<{ title: string; name: string; value?: string; image?: string }>;

  const modalArtilheiroMaestro = [
    highlights.artilheiro
      ? {
          title: "Artilheiro do Dia",
          name: highlights.artilheiro.name,
          value: highlights.artilheiro.goals ? `${highlights.artilheiro.goals} gols` : undefined,
          image: highlights.artilheiro.photoUrl || DEFAULT_PLAYER_IMAGE,
        }
      : null,
    highlights.maestro
      ? {
          title: "Maestro do Dia",
          name: highlights.maestro.name,
          value: highlights.maestro.assists
            ? `${highlights.maestro.assists} assistencias`
            : undefined,
          image: highlights.maestro.photoUrl || DEFAULT_PLAYER_IMAGE,
        }
      : null,
  ].filter(Boolean) as Array<{ title: string; name: string; value?: string; image?: string }>;

  const hasHighlights = highlightCards.length > 0;

  return (
    <>
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10 flex flex-col lg:flex-row gap-8">
        {/* CONTEUDO PRINCIPAL */}
        <div className="flex-1">
          <h1 className="sr-only">Fut7Pro: Sistema para Racha, Fut7 e Futebol Amador</h1>

          <ChampionBanner
            image={campeaoInfo?.time?.logoUrl || DEFAULT_TEAM_IMAGE}
            date={championDate}
            players={championPlayers.slice(0, 7)}
            href={`/${slug}/partidas/times-do-dia`}
          />

          {/* GRID DESTAQUES DO DIA - Desktop: Sempre visivel; Mobile: sumir e usar modal */}
          <div className="hidden lg:grid grid-cols-4 gap-4 mt-6 mb-10">
            {isLoadingHighlights ? (
              <div className="col-span-4 text-center text-gray-400">
                Carregando destaques do dia...
              </div>
            ) : hasHighlights ? (
              highlightCards.map((player) => <PlayerCard key={player.id} player={player} />)
            ) : isErrorHighlights ? (
              <div className="col-span-4 text-center text-red-400">
                Nao foi possivel carregar os destaques do dia.
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
              className="w-full bg-yellow-400 hover:bg-yellow-500 transition text-black font-bold rounded-xl py-3 text-base shadow-lg"
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
            <Link href="/atletas">
              <Card title="Conquistas" description="Colecione medalhas e evolua seu perfil." />
            </Link>
            <Link href="/estatisticas/ranking-geral">
              <Card title="Ranking" description="Compare seu desempenho com os melhores." />
            </Link>
            <Link href="/os-campeoes">
              <Card title="Campeoes" description="Veja quem se destacou nos rachas." />
            </Link>
            <Link href="/estatisticas/tira-teima">
              <Card
                title="Tira Teima"
                description="Compare jogadores lado a lado com dados reais."
              />
            </Link>
            <Link href="/estatisticas">
              <Card title="Estatisticas" description="Acompanhe sua performance em tempo real." />
            </Link>
            {/* Sorteio Inteligente so e clicavel para admin */}
            {isAdmin ? (
              <Link href="/admin/partidas/sorteio-inteligente">
                <Card
                  title="Sorteio Inteligente"
                  description="Equipes equilibradas com base no historico."
                  icon={<Shuffle size={22} className="text-[#FFCC00] -ml-1" />}
                  restricted={true}
                  isAdmin={isAdmin}
                />
              </Link>
            ) : (
              <Card
                title="Sorteio Inteligente"
                description="Equipes equilibradas com base no historico."
                icon={<Shuffle size={22} className="text-[#FFCC00] -ml-1" />}
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
    </>
  );
}
