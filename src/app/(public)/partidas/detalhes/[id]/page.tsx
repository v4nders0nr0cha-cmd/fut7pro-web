"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { usePublicMatch } from "@/hooks/usePublicMatch";
import { usePublicLinks } from "@/hooks/usePublicLinks";

const FALLBACK_LOGO = "/images/times/time_padrao_01.png";
const FALLBACK_PLAYER = "/images/jogadores/jogador_padrao_01.jpg";

type LineupPlayer = { id: string; nome: string; foto: string };
type HighlightPlayer = {
  id: string;
  nome: string;
  foto: string;
  gols: number;
  assistencias: number;
};

export default function PartidaDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = typeof params?.id === "string" ? params.id : "";
  const { publicHref, publicSlug } = usePublicLinks();
  const { match, isLoading, isError, error } = usePublicMatch(matchId, publicSlug);

  const lineups = useMemo(() => {
    if (!match?.presences?.length) {
      return { timeA: [] as LineupPlayer[], timeB: [] as LineupPlayer[] };
    }

    const timeAPlayers: LineupPlayer[] = [];
    const timeBPlayers: LineupPlayer[] = [];
    const teamAId = match.teamA.id ?? "";
    const teamBId = match.teamB.id ?? "";

    match.presences.forEach((presence) => {
      const athlete = presence.athlete;
      const player: LineupPlayer = {
        id: athlete?.id || presence.id,
        nome: athlete?.name || "Jogador",
        foto: athlete?.photoUrl || FALLBACK_PLAYER,
      };
      const presenceTeamId = presence.teamId || presence.team?.id || "";
      const presenceTeamName = presence.team?.name || "";

      const isTeamA =
        (teamAId && presenceTeamId === teamAId) ||
        (!teamAId && presenceTeamName === match.teamA.name);
      const isTeamB =
        (teamBId && presenceTeamId === teamBId) ||
        (!teamBId && presenceTeamName === match.teamB.name);

      const target = isTeamA ? timeAPlayers : isTeamB ? timeBPlayers : timeAPlayers;
      if (target.some((entry) => entry.id === player.id)) return;
      target.push(player);
    });

    return { timeA: timeAPlayers, timeB: timeBPlayers };
  }, [match]);

  const highlights = useMemo(() => {
    if (!match?.presences?.length) {
      return {
        artilheiro: null as HighlightPlayer | null,
        maestro: null as HighlightPlayer | null,
      };
    }

    const map = new Map<string, HighlightPlayer>();
    match.presences.forEach((presence) => {
      const athlete = presence.athlete;
      const id = athlete?.id || presence.id;
      const current = map.get(id) || {
        id,
        nome: athlete?.name || "Jogador",
        foto: athlete?.photoUrl || FALLBACK_PLAYER,
        gols: 0,
        assistencias: 0,
      };

      current.gols += Number(presence.goals ?? 0);
      current.assistencias += Number(presence.assists ?? 0);
      map.set(id, current);
    });

    const players = Array.from(map.values());
    const artilheiro =
      players.filter((player) => player.gols > 0).sort((a, b) => b.gols - a.gols)[0] || null;
    const maestro =
      players
        .filter((player) => player.assistencias > 0)
        .sort((a, b) => b.assistencias - a.assistencias)[0] || null;

    return { artilheiro, maestro };
  }, [match]);

  if (isLoading) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-4 text-lg text-textoSuave">Carregando detalhes da partida...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Erro ao carregar partida</h1>
          <p className="text-red-300 text-sm break-all">{String(error)}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-base hover:bg-yellow-500 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
        <h1 className="text-2xl text-yellow-400 font-bold mb-4">Partida nao encontrada</h1>
        <p className="text-textoSuave">Verifique o ID da partida ou volte ao historico.</p>
        <Link
          href={publicHref("/partidas/historico")}
          className="mt-4 inline-block bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-base hover:bg-yellow-500 transition"
        >
          Voltar ao historico
        </Link>
      </div>
    );
  }

  const dataLabel = match.date
    ? format(new Date(match.date), "dd/MM/yyyy 'as' HH:mm")
    : "Data nao informada";
  const hasScore = match.scoreA !== null && match.scoreB !== null;
  const scoreA = hasScore ? Number(match.scoreA) : null;
  const scoreB = hasScore ? Number(match.scoreB) : null;
  const winnerLabel = hasScore
    ? scoreA === scoreB
      ? "Empate"
      : scoreA > scoreB
        ? match.teamA.name
        : match.teamB.name
    : "A definir";

  return (
    <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
      <h1 className="text-3xl font-bold text-yellow-400 mb-4">Detalhes da Partida</h1>

      <div className="bg-[#1A1A1A] rounded-2xl p-6 shadow-lg border border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <p className="text-sm text-neutral-400">Data</p>
            <p className="text-lg font-semibold">{dataLabel}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-400">Local</p>
            <p className="text-lg font-semibold">{match.location || "Nao informado"}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-400">Status</p>
            <span
              className={`px-3 py-1 rounded-xl text-xs w-fit ${
                hasScore ? "bg-green-700 text-white" : "bg-yellow-500/20 text-yellow-200"
              }`}
            >
              {hasScore ? "Finalizado" : "Aguardando resultado"}
            </span>
          </div>
          <div>
            <p className="text-sm text-neutral-400">Vencedor</p>
            <p className="text-lg font-semibold">{winnerLabel}</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 my-6">
          <div className="flex items-center gap-6 justify-center">
            <div className="flex flex-col items-center gap-1">
              <Image
                src={match.teamA.logoUrl || FALLBACK_LOGO}
                alt={`Logo do time ${match.teamA.name}`}
                width={48}
                height={48}
                className="rounded"
              />
              <span className="font-bold text-lg">{match.teamA.name}</span>
            </div>
            <span className="text-4xl font-extrabold">
              {hasScore ? scoreA : "--"}
              <span className="mx-2 text-yellow-400 font-bold">x</span>
              {hasScore ? scoreB : "--"}
            </span>
            <div className="flex flex-col items-center gap-1">
              <Image
                src={match.teamB.logoUrl || FALLBACK_LOGO}
                alt={`Logo do time ${match.teamB.name}`}
                width={48}
                height={48}
                className="rounded"
              />
              <span className="font-bold text-lg">{match.teamB.name}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <h2 className="text-lg font-bold text-yellow-400 mb-2">Artilheiro (gols)</h2>
            {highlights.artilheiro ? (
              <div className="flex items-center gap-3">
                <Image
                  src={highlights.artilheiro.foto}
                  alt={`Foto ${highlights.artilheiro.nome}`}
                  width={36}
                  height={36}
                  className="rounded-full"
                />
                <div>
                  <p className="text-sm font-semibold">{highlights.artilheiro.nome}</p>
                  <p className="text-xs text-neutral-400">{highlights.artilheiro.gols} gols</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-neutral-400">Sem dados de gols.</p>
            )}
          </div>

          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <h2 className="text-lg font-bold text-yellow-400 mb-2">Maestro (assistencias)</h2>
            {highlights.maestro ? (
              <div className="flex items-center gap-3">
                <Image
                  src={highlights.maestro.foto}
                  alt={`Foto ${highlights.maestro.nome}`}
                  width={36}
                  height={36}
                  className="rounded-full"
                />
                <div>
                  <p className="text-sm font-semibold">{highlights.maestro.nome}</p>
                  <p className="text-xs text-neutral-400">
                    {highlights.maestro.assistencias} assistencias
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-neutral-400">Sem dados de assistencias.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <h2 className="text-lg font-bold text-yellow-400 mb-2">Time {match.teamA.name}</h2>
            {lineups.timeA.length ? (
              <ul className="space-y-2 text-sm text-neutral-200">
                {lineups.timeA.map((jogador) => (
                  <li key={jogador.id} className="flex items-center gap-2">
                    <Image
                      src={jogador.foto}
                      alt={`Foto ${jogador.nome}`}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                    <span>{jogador.nome}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-neutral-400 text-sm">Jogadores nao informados.</p>
            )}
          </div>

          <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <h2 className="text-lg font-bold text-yellow-400 mb-2">Time {match.teamB.name}</h2>
            {lineups.timeB.length ? (
              <ul className="space-y-2 text-sm text-neutral-200">
                {lineups.timeB.map((jogador) => (
                  <li key={jogador.id} className="flex items-center gap-2">
                    <Image
                      src={jogador.foto}
                      alt={`Foto ${jogador.nome}`}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                    <span>{jogador.nome}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-neutral-400 text-sm">Jogadores nao informados.</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <Link
            href={publicHref("/partidas/historico")}
            className="text-sm text-yellow-400 underline hover:text-yellow-300 transition"
          >
            Voltar ao historico
          </Link>
          <Link
            href={publicHref("/partidas/times-do-dia")}
            className="text-sm text-yellow-400 underline hover:text-yellow-300 transition"
          >
            Ver Time Campeao do Dia
          </Link>
          <button
            onClick={() => router.back()}
            className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-base hover:bg-yellow-500 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
