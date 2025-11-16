"use client";

import { useMemo } from "react";
import { usePublicMatches } from "@/hooks/usePublicMatches";
import { rachaConfig } from "@/config/racha.config";
import type {
  Match,
  MatchPresence,
  Partida,
  PartidaAssistencia,
  PartidaGol,
} from "@/types/partida";

function resolveTeamSide(match: Match, presence: MatchPresence): "A" | "B" {
  const presenceTeamId = presence.team?.id ?? presence.teamId ?? null;
  const teamAId = match.teamA?.id ?? match.teamAId ?? null;
  const teamBId = match.teamB?.id ?? match.teamBId ?? null;

  if (presenceTeamId) {
    if (teamAId && presenceTeamId === teamAId) return "A";
    if (teamBId && presenceTeamId === teamBId) return "B";
  }

  const presenceName = presence.team?.name?.toLowerCase();
  if (presenceName) {
    const teamAName = match.teamA?.name?.toLowerCase();
    const teamBName = match.teamB?.name?.toLowerCase();
    if (teamAName && teamAName === presenceName) return "A";
    if (teamBName && teamBName === presenceName) return "B";
  }

  return "A";
}

function buildEventos(
  match: Match,
  presences: MatchPresence[]
): { gols: PartidaGol[]; assistencias: PartidaAssistencia[] } {
  const gols: PartidaGol[] = [];
  const assistencias: PartidaAssistencia[] = [];

  presences.forEach((presence) => {
    const side = resolveTeamSide(match, presence);

    if (presence.goals > 0) {
      gols.push({
        id: `${presence.id}-gols`,
        jogador: presence.athlete?.name ?? "Atleta",
        time: side,
        quantidade: presence.goals,
      });
    }

    if (presence.assists > 0) {
      assistencias.push({
        id: `${presence.id}-assistencias`,
        jogador: presence.athlete?.name ?? "Atleta",
        time: side,
        quantidade: presence.assists,
      });
    }
  });

  return { gols, assistencias };
}

function resolveTeamInfo(match: Match, side: "A" | "B") {
  const team = side === "A" ? match.teamA : match.teamB;
  const fallbackId = side === "A" ? match.teamAId : match.teamBId;

  return {
    id: team?.id ?? fallbackId ?? null,
    nome: team?.name ?? (side === "A" ? "Time A" : "Time B"),
    logo: team?.logoUrl ?? "/images/times/time_padrao_01.png",
    gols:
      match.score?.[side === "A" ? "teamA" : "teamB"] ??
      (side === "A" ? match.scoreA : match.scoreB) ??
      null,
  };
}

export function mapMatchToPartida(match: Match): Partida {
  const teamA = resolveTeamInfo(match, "A");
  const teamB = resolveTeamInfo(match, "B");
  const eventos = buildEventos(match, match.presences);

  const matchDate = new Date(match.date);
  const now = Date.now();
  const horario = matchDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const golsA = teamA.gols;
  const golsB = teamB.gols;
  const finalizada = typeof golsA === "number" && typeof golsB === "number";

  const status: Partida["status"] = finalizada
    ? "Concluida"
    : matchDate.getTime() > now
      ? "Agendada"
      : "Em andamento";

  return {
    id: match.id,
    tenantId: match.tenantId,
    data: match.date,
    ano: matchDate.getFullYear(),
    horario,
    local: match.location ?? null,
    status,
    finalizada,
    timeAId: teamA.id,
    timeBId: teamB.id,
    timeA: teamA.nome,
    timeB: teamB.nome,
    timeCasa: teamA.nome,
    timeFora: teamB.nome,
    logoCasa: teamA.logo,
    logoFora: teamB.logo,
    golsCasa: golsA,
    golsFora: golsB,
    golsTimeA: golsA,
    golsTimeB: golsB,
    gols: eventos.gols,
    assistencias: eventos.assistencias,
    presencas: match.presences,
    match,
  };
}

export function usePartidas() {
  const { matches, isLoading, isError, error, mutate } = usePublicMatches({
    slug: rachaConfig.slug,
    params: { limit: 100 },
  });

  const partidas = useMemo(() => matches.map(mapMatchToPartida), [matches]);

  const getPartidaById = (id: string) => partidas.find((partida) => partida.id === id);

  return {
    partidas,
    isLoading,
    isError,
    error,
    mutate,
    getPartidaById,
  };
}
