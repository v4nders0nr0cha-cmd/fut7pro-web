"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { useAdminMatches } from "@/hooks/useAdminMatches";
import { useSorteioHistorico } from "@/hooks/useSorteioHistorico";
import type { PublicMatch, PublicMatchPresence, PublicMatchTeam } from "@/types/partida";
import type { SorteioHistoricoItem } from "@/types/sorteio";

const FALLBACK_LOGO = "/images/times/time_padrao_01.png";
const FALLBACK_PLAYER = "/images/jogadores/jogador_padrao_01.jpg";
const PAGE_SIZE = 30;
const HISTORICO_LIMIT = 90;
const DEFAULT_RANGE_DAYS = 30;

const DAY_STATUS_LABELS: Record<DayStatus, string> = {
  pending: "Pendente",
  partial: "Parcial",
  complete: "Completo",
};

const DAY_STATUS_BADGES: Record<DayStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-200",
  partial: "bg-cyan-500/20 text-cyan-200",
  complete: "bg-green-600/20 text-green-200",
};

const ORIGIN_LABELS: Record<DayOrigin, string> = {
  sorteio: "Sorteio Inteligente",
  classica: "Partida Classica",
  misto: "Misto",
};

const ORIGIN_BADGES: Record<DayOrigin, string> = {
  sorteio: "bg-blue-500/20 text-blue-200",
  classica: "bg-purple-500/20 text-purple-200",
  misto: "bg-amber-500/20 text-amber-200",
};

type DayStatus = "pending" | "partial" | "complete";

type DayOrigin = "sorteio" | "classica" | "misto";

type DayFilter = DayStatus | "all";

type OriginFilter = DayOrigin | "all";

type MatchMeta = {
  match: PublicMatch;
  date: Date;
  hasResult: boolean;
  scoreA: number;
  scoreB: number;
};

type DayHighlights = {
  campeao: string | null;
  artilheiro: string | null;
  maestro: string | null;
};

type DaySummary = {
  key: string;
  date: Date;
  matches: MatchMeta[];
  total: number;
  done: number;
  status: DayStatus;
  origin: DayOrigin;
  location: string;
  hora: string;
  highlights: DayHighlights;
  lastUpdateLabel: string | null;
  searchLabel: string;
};

type GoalEvent = {
  id: string;
  teamId: string;
  scorerId: string;
  assistId: string;
};

type RosterPlayer = {
  id: string;
  name: string;
  nickname: string;
  photoUrl: string;
  position: string | null;
};

type PresencePayload = {
  id?: string;
  athleteId: string;
  teamId: string | null;
  goals: number;
  assists: number;
  status: "AUSENTE" | "TITULAR" | "SUBSTITUTO";
};

function normalizeKey(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function formatDate(value?: string | null, withTime = false) {
  if (!value) return "Data não informada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data não informada";
  return withTime ? format(date, "dd/MM/yyyy HH:mm") : format(date, "dd/MM/yyyy");
}

function parseMatchDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDayKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function parseDayKey(value?: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function buildDefaultRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - DEFAULT_RANGE_DAYS);
  return {
    start: format(start, "yyyy-MM-dd"),
    end: format(end, "yyyy-MM-dd"),
  };
}

function isWithinRange(date: Date, start?: Date | null, end?: Date | null) {
  if (start && date.getTime() < startOfDay(start).getTime()) return false;
  if (end && date.getTime() > startOfDay(end).getTime()) return false;
  return true;
}

function resolvePresenceTeamId(
  presence: PublicMatchPresence,
  teamA: PublicMatchTeam,
  teamB: PublicMatchTeam,
  fallbackA: string,
  fallbackB: string
) {
  const directId = presence.teamId ?? presence.team?.id ?? "";
  if (directId) return directId;
  const presenceTeamName = normalizeKey(presence.team?.name);
  if (presenceTeamName && presenceTeamName === normalizeKey(teamA.name)) {
    return fallbackA;
  }
  if (presenceTeamName && presenceTeamName === normalizeKey(teamB.name)) {
    return fallbackB;
  }
  return "";
}

function countPresenceGoals(match: PublicMatch, teamId: string, teamAId: string, teamBId: string) {
  return match.presences.reduce((total, presence) => {
    const resolvedTeam = resolvePresenceTeamId(
      presence,
      match.teamA,
      match.teamB,
      teamAId,
      teamBId
    );
    if (resolvedTeam !== teamId) return total;
    return total + Number(presence.goals ?? 0);
  }, 0);
}

function matchHasResult(match: PublicMatch) {
  return match.scoreA !== null && match.scoreB !== null;
}

function buildMatchMeta(match: PublicMatch): MatchMeta | null {
  const date = parseMatchDate(match.date);
  if (!date) return null;
  const teamAId = match.teamA.id ?? `${match.id}-a`;
  const teamBId = match.teamB.id ?? `${match.id}-b`;
  const goalsA = countPresenceGoals(match, teamAId, teamAId, teamBId);
  const goalsB = countPresenceGoals(match, teamBId, teamAId, teamBId);
  const scoreA = match.scoreA ?? goalsA;
  const scoreB = match.scoreB ?? goalsB;

  return {
    match,
    date,
    hasResult: matchHasResult(match),
    scoreA,
    scoreB,
  };
}

function buildDaySearchLabel(matches: MatchMeta[]) {
  const chunks: string[] = [];
  matches.forEach(({ match }) => {
    chunks.push(match.teamA.name, match.teamB.name, match.location ?? "", formatDate(match.date));
    match.presences.forEach((presence) => {
      const athlete = presence.athlete;
      if (!athlete) return;
      chunks.push(`${athlete.name} ${athlete.nickname ?? ""}`);
    });
  });
  return normalizeKey(chunks.join(" "));
}

function buildLastUpdateLabel(matches: MatchMeta[]) {
  let lastUpdate: Date | null = null;
  matches.forEach(({ match }) => {
    match.presences.forEach((presence) => {
      const updatedAt = presence.updatedAt || presence.createdAt;
      if (!updatedAt) return;
      const date = new Date(updatedAt);
      if (Number.isNaN(date.getTime())) return;
      if (!lastUpdate || date.getTime() > lastUpdate.getTime()) {
        lastUpdate = date;
      }
    });
  });
  return lastUpdate ? format(lastUpdate, "dd/MM/yyyy HH:mm") : null;
}

function buildDayHighlights(matches: MatchMeta[]): DayHighlights {
  const teamStats = new Map<
    string,
    { name: string; points: number; goalsFor: number; goalsAgainst: number }
  >();
  const playerGoals = new Map<string, { name: string; goals: number }>();
  const playerAssists = new Map<string, { name: string; assists: number }>();

  const matchesWithResult = matches.filter((item) => item.hasResult);
  if (!matchesWithResult.length) {
    return { campeao: null, artilheiro: null, maestro: null };
  }

  matchesWithResult.forEach(({ match, scoreA, scoreB }) => {
    const teamAId = match.teamA.id ?? `${match.id}-a`;
    const teamBId = match.teamB.id ?? `${match.id}-b`;

    const teamAStats = teamStats.get(teamAId) ?? {
      name: match.teamA.name || "Time A",
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
    };
    const teamBStats = teamStats.get(teamBId) ?? {
      name: match.teamB.name || "Time B",
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
    };

    teamAStats.goalsFor += scoreA;
    teamAStats.goalsAgainst += scoreB;
    teamBStats.goalsFor += scoreB;
    teamBStats.goalsAgainst += scoreA;

    if (scoreA > scoreB) {
      teamAStats.points += 3;
    } else if (scoreB > scoreA) {
      teamBStats.points += 3;
    } else {
      teamAStats.points += 1;
      teamBStats.points += 1;
    }

    teamStats.set(teamAId, teamAStats);
    teamStats.set(teamBId, teamBStats);

    match.presences.forEach((presence) => {
      const athlete = presence.athlete;
      if (!athlete || !athlete.name) return;
      const goals = Number(presence.goals ?? 0);
      const assists = Number(presence.assists ?? 0);

      if (goals > 0) {
        const current = playerGoals.get(athlete.id) ?? { name: athlete.name, goals: 0 };
        current.goals += goals;
        playerGoals.set(athlete.id, current);
      }

      if (assists > 0) {
        const current = playerAssists.get(athlete.id) ?? { name: athlete.name, assists: 0 };
        current.assists += assists;
        playerAssists.set(athlete.id, current);
      }
    });
  });

  const champion = Array.from(teamStats.values())
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const diffA = a.goalsFor - a.goalsAgainst;
      const diffB = b.goalsFor - b.goalsAgainst;
      if (diffB !== diffA) return diffB - diffA;
      return b.goalsFor - a.goalsFor;
    })
    .map((team) => team.name)[0];

  const artilheiro = Array.from(playerGoals.values())
    .sort((a, b) => {
      if (b.goals !== a.goals) return b.goals - a.goals;
      return a.name.localeCompare(b.name);
    })
    .map((player) => `${player.name} (${player.goals}g)`)[0];

  const maestro = Array.from(playerAssists.values())
    .sort((a, b) => {
      if (b.assists !== a.assists) return b.assists - a.assists;
      return a.name.localeCompare(b.name);
    })
    .map((player) => `${player.name} (${player.assists}a)`)[0];

  return {
    campeao: champion ?? null,
    artilheiro: artilheiro ?? null,
    maestro: maestro ?? null,
  };
}

function resolveSorteioDayKey(item: SorteioHistoricoItem) {
  if (item.dataPartida && /^\d{4}-\d{2}-\d{2}$/.test(item.dataPartida)) {
    const [year, month, day] = item.dataPartida.split("-").map(Number);
    return toDayKey(new Date(year, month - 1, day));
  }
  const createdAt = new Date(item.createdAt);
  if (Number.isNaN(createdAt.getTime())) return null;
  return toDayKey(createdAt);
}

function buildSorteioMap(historico: SorteioHistoricoItem[]) {
  const map = new Map<string, { count: number | null; createdAt: Date }>();
  historico.forEach((item) => {
    const key = resolveSorteioDayKey(item);
    if (!key) return;
    const createdAt = new Date(item.createdAt);
    if (Number.isNaN(createdAt.getTime())) return;
    const count = typeof item.confrontosCount === "number" ? item.confrontosCount : null;
    const existing = map.get(key);
    if (!existing || createdAt.getTime() > existing.createdAt.getTime()) {
      map.set(key, { count, createdAt });
    }
  });
  return map;
}

function resolveDayOrigin(
  dayKey: string,
  totalMatches: number,
  sorteioMap: Map<string, { count: number | null }>
) {
  const sorteioInfo = sorteioMap.get(dayKey);
  if (!sorteioInfo) return "classica" as DayOrigin;
  if (typeof sorteioInfo.count === "number" && sorteioInfo.count > 0) {
    return totalMatches > sorteioInfo.count ? "misto" : "sorteio";
  }
  return "sorteio";
}

function buildRoster(match: PublicMatch, targetTeamId: string, teamAId: string, teamBId: string) {
  const players: RosterPlayer[] = [];
  const seen = new Set<string>();
  match.presences.forEach((presence) => {
    const athleteId = presence.athleteId || presence.athlete?.id || presence.id;
    if (!athleteId || seen.has(athleteId)) return;
    const teamId = resolvePresenceTeamId(presence, match.teamA, match.teamB, teamAId, teamBId);
    if (teamId !== targetTeamId) return;
    seen.add(athleteId);
    players.push({
      id: athleteId,
      name: presence.athlete?.name || "Jogador",
      nickname: presence.athlete?.nickname || "",
      photoUrl: presence.athlete?.photoUrl || FALLBACK_PLAYER,
      position: presence.athlete?.position ?? null,
    });
  });
  return players;
}

function createEventId() {
  return `goal-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

function buildGoalEvents(match: PublicMatch, teamAId: string, teamBId: string) {
  const events: GoalEvent[] = [];
  const assistPool = new Map<string, string[]>();

  match.presences.forEach((presence) => {
    const athleteId = presence.athleteId || presence.athlete?.id;
    if (!athleteId) return;
    const teamId = resolvePresenceTeamId(presence, match.teamA, match.teamB, teamAId, teamBId);
    if (!teamId) return;

    const goals = Number(presence.goals ?? 0);
    const assists = Number(presence.assists ?? 0);

    for (let i = 0; i < goals; i += 1) {
      events.push({
        id: createEventId(),
        teamId,
        scorerId: athleteId,
        assistId: "",
      });
    }

    if (assists > 0) {
      const pool = assistPool.get(teamId) ?? [];
      for (let i = 0; i < assists; i += 1) {
        pool.push(athleteId);
      }
      assistPool.set(teamId, pool);
    }
  });

  assistPool.forEach((pool, teamId) => {
    const teamEvents = events.filter((event) => event.teamId === teamId);
    teamEvents.forEach((event) => {
      if (!event.assistId && pool.length) {
        event.assistId = pool.shift() ?? "";
      }
    });
  });

  return events;
}

function buildStats(events: GoalEvent[]) {
  const stats = new Map<string, { goals: number; assists: number }>();
  events.forEach((event) => {
    if (event.scorerId) {
      const current = stats.get(event.scorerId) ?? { goals: 0, assists: 0 };
      current.goals += 1;
      stats.set(event.scorerId, current);
    }
    if (event.assistId) {
      const current = stats.get(event.assistId) ?? { goals: 0, assists: 0 };
      current.assists += 1;
      stats.set(event.assistId, current);
    }
  });
  return stats;
}

function scoreByTeam(events: GoalEvent[], teamId: string) {
  return events.filter((event) => event.teamId === teamId && event.scorerId).length;
}

type MatchResultModalProps = {
  match: PublicMatch;
  onClose: () => void;
  onSaved: () => void;
};

function MatchResultModal({ match, onClose, onSaved }: MatchResultModalProps) {
  const teamAId = match.teamA.id ?? "team-a";
  const teamBId = match.teamB.id ?? "team-b";
  const [events, setEvents] = useState<GoalEvent[]>(() => buildGoalEvents(match, teamAId, teamBId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rosterA = useMemo(
    () => buildRoster(match, teamAId, teamAId, teamBId),
    [match, teamAId, teamBId]
  );
  const rosterB = useMemo(
    () => buildRoster(match, teamBId, teamAId, teamBId),
    [match, teamBId, teamAId]
  );
  const stats = useMemo(() => buildStats(events), [events]);

  const scoreA = scoreByTeam(events, teamAId);
  const scoreB = scoreByTeam(events, teamBId);
  const winnerLabel =
    scoreA === scoreB ? "Empate" : scoreA > scoreB ? match.teamA.name : match.teamB.name;

  const buildPresencePayload = () => {
    const presenceByAthlete = new Map(
      match.presences.map((presence) => [presence.athleteId, presence])
    );
    const eventAthletes = new Set<string>();
    events.forEach((event) => {
      if (event.scorerId) eventAthletes.add(event.scorerId);
      if (event.assistId) eventAthletes.add(event.assistId);
    });

    const presences: PresencePayload[] = match.presences.map((presence) => {
      const counts = stats.get(presence.athleteId) ?? { goals: 0, assists: 0 };
      return {
        id: presence.id,
        athleteId: presence.athleteId,
        teamId: presence.teamId ?? presence.team?.id ?? null,
        goals: counts.goals,
        assists: counts.assists,
        status: presence.status,
      };
    });

    eventAthletes.forEach((athleteId) => {
      if (presenceByAthlete.has(athleteId)) return;
      const counts = stats.get(athleteId);
      if (!counts) return;
      const event = events.find(
        (item) => item.scorerId === athleteId || item.assistId === athleteId
      );
      presences.push({
        athleteId,
        teamId: event?.teamId ?? null,
        goals: counts.goals,
        assists: counts.assists,
        status: "TITULAR",
      });
    });

    return presences;
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    if (events.some((event) => !event.scorerId)) {
      setError("Informe o autor do gol em cada lance antes de salvar.");
      setSaving(false);
      return;
    }
    try {
      const response = await fetch(`/api/partidas/${match.id}/resultado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scoreA,
          scoreB,
          presences: buildPresencePayload(),
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || "Falha ao salvar resultado");
      }

      onSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao salvar resultado";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const renderPlayers = (players: RosterPlayer[]) =>
    players.map((player) => {
      const label = player.nickname ? `${player.name} (${player.nickname})` : player.name;
      return (
        <option key={player.id} value={player.id}>
          {label}
        </option>
      );
    });

  const renderStats = (players: RosterPlayer[]) => {
    const withStats = players
      .map((player) => ({
        ...player,
        stats: stats.get(player.id) ?? { goals: 0, assists: 0 },
      }))
      .filter((player) => player.stats.goals > 0 || player.stats.assists > 0);

    if (!withStats.length) {
      return <p className="text-xs text-neutral-400">Sem gols ou assistências ainda.</p>;
    }

    return (
      <ul className="space-y-2 text-xs text-neutral-200">
        {withStats.map((player) => (
          <li key={player.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Image
                src={player.photoUrl}
                alt={player.name}
                width={28}
                height={28}
                className="rounded-full"
              />
              <span>{player.name}</span>
            </div>
            <span className="text-yellow-300">
              {player.stats.goals}g / {player.stats.assists}a
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-[#141414] p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-yellow-400">Resultado da partida</h2>
            <p className="text-sm text-neutral-400">
              {formatDate(match.date, true)} - {match.location || "Local não informado"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="self-start md:self-auto text-sm text-neutral-300 hover:text-yellow-300"
          >
            Fechar
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-center bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Image
              src={match.teamA.logoUrl || FALLBACK_LOGO}
              alt={`Logo ${match.teamA.name}`}
              width={42}
              height={42}
              className="rounded"
            />
            <div>
              <p className="text-sm text-neutral-400">Time A</p>
              <p className="text-base font-semibold">{match.teamA.name}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-400">Placar</p>
            <p className="text-3xl font-bold text-yellow-400">
              {scoreA} x {scoreB}
            </p>
            <p className="text-xs text-neutral-400 mt-1">Vencedor: {winnerLabel}</p>
          </div>
          <div className="flex items-center justify-end gap-3">
            <div className="text-right">
              <p className="text-sm text-neutral-400">Time B</p>
              <p className="text-base font-semibold">{match.teamB.name}</p>
            </div>
            <Image
              src={match.teamB.logoUrl || FALLBACK_LOGO}
              alt={`Logo ${match.teamB.name}`}
              width={42}
              height={42}
              className="rounded"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col md:flex-row gap-3">
          <button
            type="button"
            onClick={() =>
              setEvents((prev) => [
                ...prev,
                { id: createEventId(), teamId: teamAId, scorerId: "", assistId: "" },
              ])
            }
            className="flex-1 rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-yellow-400/20"
          >
            + Adicionar gol Time A
          </button>
          <button
            type="button"
            onClick={() =>
              setEvents((prev) => [
                ...prev,
                { id: createEventId(), teamId: teamBId, scorerId: "", assistId: "" },
              ])
            }
            className="flex-1 rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-yellow-400/20"
          >
            + Adicionar gol Time B
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {events.length === 0 ? (
            <div className="rounded-xl border border-neutral-800 bg-[#1a1a1a] p-4 text-sm text-neutral-400">
              Nenhum gol registrado ainda. Adicione os gols para atualizar o placar.
            </div>
          ) : (
            events.map((event, index) => {
              const isTeamA = event.teamId === teamAId;
              const teamLabel = isTeamA ? match.teamA.name : match.teamB.name;
              const teamPlayers = isTeamA ? rosterA : rosterB;

              return (
                <div
                  key={event.id}
                  className="grid grid-cols-1 md:grid-cols-[140px_1fr_1fr_auto] gap-3 items-center rounded-xl border border-neutral-800 bg-[#1a1a1a] p-3"
                >
                  <div className="text-xs text-yellow-300 font-semibold">
                    Gol {index + 1} - {teamLabel}
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Autor do gol</label>
                    <select
                      value={event.scorerId}
                      onChange={(e) =>
                        setEvents((prev) =>
                          prev.map((item) =>
                            item.id === event.id ? { ...item, scorerId: e.target.value } : item
                          )
                        )
                      }
                      className="w-full rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
                    >
                      <option value="">Selecione o jogador</option>
                      {renderPlayers(teamPlayers)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      Assistencia (opcional)
                    </label>
                    <select
                      value={event.assistId}
                      onChange={(e) =>
                        setEvents((prev) =>
                          prev.map((item) =>
                            item.id === event.id ? { ...item, assistId: e.target.value } : item
                          )
                        )
                      }
                      className="w-full rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
                    >
                      <option value="">Sem assistencia</option>
                      {renderPlayers(teamPlayers)}
                    </select>
                  </div>
                  <div className="flex md:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setEvents((prev) => prev.filter((item) => item.id !== event.id))
                      }
                      className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200 hover:bg-red-500/20"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-neutral-800 bg-[#1a1a1a] p-4">
            <h3 className="text-sm font-semibold text-yellow-300 mb-3">Time {match.teamA.name}</h3>
            {renderStats(rosterA)}
          </div>
          <div className="rounded-xl border border-neutral-800 bg-[#1a1a1a] p-4">
            <h3 className="text-sm font-semibold text-yellow-300 mb-3">Time {match.teamB.name}</h3>
            {renderStats(rosterB)}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col md:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300 disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar resultado"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HistoricoPartidasAdmin() {
  const searchParams = useSearchParams();
  const { matches, isLoading, isError, error, mutate } = useAdminMatches();
  const { historico: sorteioHistorico } = useSorteioHistorico(HISTORICO_LIMIT);
  const defaultRange = useMemo(() => buildDefaultRange(), []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DayFilter>("all");
  const [originFilter, setOriginFilter] = useState<OriginFilter>("all");
  const [rangeStart, setRangeStart] = useState(defaultRange.start);
  const [rangeEnd, setRangeEnd] = useState(defaultRange.end);
  const [selectedMatch, setSelectedMatch] = useState<PublicMatch | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    if (!searchParams) return;

    const tabParam = normalizeKey(searchParams.get("tab"));
    if (tabParam) {
      if (tabParam === "sem-resultado" || tabParam === "semresultado") {
        setStatusFilter("pending");
      } else if (tabParam === "em-andamento" || tabParam === "emandamento") {
        setStatusFilter("partial");
      } else if (tabParam === "finalizadas" || tabParam === "finalizada") {
        setStatusFilter("complete");
      }
    }

    const scopeParam = normalizeKey(searchParams.get("scope"));
    if (scopeParam === "hoje" || scopeParam === "today") {
      const todayKey = toDayKey(new Date());
      setRangeStart(todayKey);
      setRangeEnd(todayKey);
    } else if (scopeParam === "todas" || scopeParam === "all" || scopeParam === "completo") {
      setRangeStart("");
      setRangeEnd("");
    }

    const originParam = normalizeKey(searchParams.get("origem"));
    if (originParam === "sorteio" || originParam === "classica" || originParam === "misto") {
      setOriginFilter(originParam as OriginFilter);
    }
  }, [defaultRange, searchParams]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, statusFilter, originFilter, rangeStart, rangeEnd]);

  const sorteioMap = useMemo(() => buildSorteioMap(sorteioHistorico), [sorteioHistorico]);

  const matchEntries = useMemo(() => {
    return matches
      .map((match) => buildMatchMeta(match))
      .filter((item): item is MatchMeta => Boolean(item));
  }, [matches]);

  const daySummaries = useMemo(() => {
    const grouped = new Map<string, MatchMeta[]>();

    matchEntries.forEach((entry) => {
      const key = toDayKey(entry.date);
      const list = grouped.get(key) ?? [];
      list.push(entry);
      grouped.set(key, list);
    });

    const summaries: DaySummary[] = [];

    grouped.forEach((matchesOfDay, key) => {
      const sortedMatches = [...matchesOfDay].sort((a, b) => a.date.getTime() - b.date.getTime());
      const total = sortedMatches.length;
      const done = sortedMatches.filter((item) => item.hasResult).length;
      const status: DayStatus = done === 0 ? "pending" : done === total ? "complete" : "partial";
      const origin = resolveDayOrigin(key, total, sorteioMap);
      const date = startOfDay(sortedMatches[0].date);
      const firstMatch = sortedMatches[0].match;
      const location =
        sortedMatches.find((item) => item.match.location)?.match.location ||
        firstMatch.location ||
        "Local não informado";
      const hora = format(sortedMatches[0].date, "HH:mm");
      const highlights = buildDayHighlights(sortedMatches);
      const lastUpdateLabel = buildLastUpdateLabel(sortedMatches);
      const searchLabel = buildDaySearchLabel(sortedMatches);

      summaries.push({
        key,
        date,
        matches: sortedMatches,
        total,
        done,
        status,
        origin,
        location,
        hora,
        highlights,
        lastUpdateLabel,
        searchLabel,
      });
    });

    return summaries.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [matchEntries, sorteioMap]);

  const filteredDays = useMemo(() => {
    const searchValue = normalizeKey(search);
    const startDate = parseDayKey(rangeStart);
    const endDate = parseDayKey(rangeEnd);

    return daySummaries.filter((day) => {
      if (statusFilter !== "all" && day.status !== statusFilter) return false;
      if (originFilter !== "all" && day.origin !== originFilter) return false;
      if (!isWithinRange(day.date, startDate, endDate)) return false;
      if (!searchValue) return true;
      return day.searchLabel.includes(searchValue);
    });
  }, [daySummaries, originFilter, rangeEnd, rangeStart, search, statusFilter]);

  const totals = useMemo(() => {
    const total = filteredDays.length;
    const pending = filteredDays.filter((day) => day.status === "pending").length;
    const partial = filteredDays.filter((day) => day.status === "partial").length;
    const complete = filteredDays.filter((day) => day.status === "complete").length;
    return { total, pending, partial, complete };
  }, [filteredDays]);

  const todayKey = toDayKey(new Date());
  const todayDay = daySummaries.find((day) => day.key === todayKey) ?? null;
  const nextPendingDay = daySummaries.find((day) => day.status !== "complete") ?? null;
  const selectedDayKey = searchParams?.get("dia") ?? "";
  const selectedDay = selectedDayKey
    ? (daySummaries.find((day) => day.key === selectedDayKey) ?? null)
    : null;

  const buildHistoricoLink = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    const query = params.toString();
    return query ? `/admin/partidas/historico?${query}` : "/admin/partidas/historico";
  };

  const renderEmptyState = (message: string) => (
    <div className="rounded-xl border border-neutral-800 bg-[#1a1a1a] p-6 text-center text-sm text-neutral-300">
      {message}
    </div>
  );

  if (isLoading) {
    return renderEmptyState("Carregando histórico...");
  }

  if (isError) {
    return renderEmptyState(
      `Falha ao carregar histórico. ${error instanceof Error ? error.message : ""}`
    );
  }

  if (selectedDayKey && !selectedDay) {
    return (
      <div className="space-y-4">
        {renderEmptyState("Dia não encontrado ou sem partidas registradas.")}
        <Link
          href={buildHistoricoLink({ dia: null })}
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
        >
          Voltar para o histórico
        </Link>
      </div>
    );
  }

  if (selectedDay) {
    const statusLabel = DAY_STATUS_LABELS[selectedDay.status];
    const originLabel = ORIGIN_LABELS[selectedDay.origin];
    const statusBadge = DAY_STATUS_BADGES[selectedDay.status];

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-400">Histórico do dia</p>
              <h2 className="text-2xl md:text-3xl font-bold text-yellow-400">
                {format(selectedDay.date, "dd/MM/yyyy")} - {selectedDay.hora}
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                {selectedDay.location || "Local não informado"}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-300">
                <span className={`rounded-full px-3 py-1 font-semibold ${statusBadge}`}>
                  {statusLabel}
                </span>
                <span
                  className={`rounded-full px-3 py-1 font-semibold ${ORIGIN_BADGES[selectedDay.origin]}`}
                >
                  {originLabel}
                </span>
                <span className="rounded-full px-3 py-1 font-semibold bg-neutral-800 text-neutral-200">
                  {selectedDay.done} de {selectedDay.total} partidas finalizadas
                </span>
              </div>
              {selectedDay.lastUpdateLabel && (
                <p className="mt-2 text-xs text-neutral-400">
                  Última atualização: {selectedDay.lastUpdateLabel}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={buildHistoricoLink({ dia: null })}
                className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
              >
                Voltar para o histórico
              </Link>
              {selectedDay.status !== "complete" && (
                <Link
                  href={`/admin/partidas/resultados-do-dia?data=${selectedDay.key}`}
                  className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
                >
                  Continuar lancando resultados
                </Link>
              )}
              <button
                type="button"
                className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
              >
                Exportar resumo (em breve)
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-4">
            <p className="text-xs text-neutral-400">Time campeão do dia</p>
            <p className="text-base font-semibold text-yellow-300">
              {selectedDay.highlights.campeao || "Não definido"}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-4">
            <p className="text-xs text-neutral-400">Artilheiro do dia</p>
            <p className="text-base font-semibold text-yellow-300">
              {selectedDay.highlights.artilheiro || "Não definido"}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-4">
            <p className="text-xs text-neutral-400">Maestro do dia</p>
            <p className="text-base font-semibold text-yellow-300">
              {selectedDay.highlights.maestro || "Não definido"}
            </p>
          </div>
        </div>

        {selectedDay.matches.length === 0 ? (
          renderEmptyState("Nenhuma partida encontrada para este dia.")
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {selectedDay.matches.map((item, index) => {
              const { match, hasResult, scoreA, scoreB } = item;
              const scoreLabel = hasResult ? `${scoreA} x ${scoreB}` : "-- x --";
              const statusLabel = hasResult ? "Finalizada" : "Sem resultado";
              const statusClass = hasResult
                ? "bg-green-600/20 text-green-200"
                : "bg-yellow-500/20 text-yellow-200";
              const horario = format(item.date, "HH:mm");

              return (
                <div
                  key={match.id}
                  className="rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-4"
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs text-neutral-400">Rodada {index + 1}</p>
                      <p className="text-sm text-neutral-300 font-semibold">
                        {format(item.date, "dd/MM/yyyy")} - {horario}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {match.location || "Local não informado"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusClass}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={match.teamA.logoUrl || FALLBACK_LOGO}
                        alt={`Logo ${match.teamA.name}`}
                        width={38}
                        height={38}
                        className="rounded"
                      />
                      <div>
                        <p className="text-xs text-neutral-400">Time A</p>
                        <p className="text-sm font-semibold">{match.teamA.name}</p>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-lg font-bold text-yellow-400">{scoreLabel}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-neutral-400">Time B</p>
                        <p className="text-sm font-semibold">{match.teamB.name}</p>
                      </div>
                      <Image
                        src={match.teamB.logoUrl || FALLBACK_LOGO}
                        alt={`Logo ${match.teamB.name}`}
                        width={38}
                        height={38}
                        className="rounded"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-xs text-neutral-500">
                      {hasResult ? "Resultado registrado" : "Sem resultado"}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedMatch(match)}
                      className="rounded-xl bg-yellow-400 px-4 py-2 text-xs font-semibold text-black hover:bg-yellow-300"
                    >
                      {hasResult ? "Editar resultado" : "Lancar resultado"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedMatch && (
          <MatchResultModal
            match={selectedMatch}
            onClose={() => setSelectedMatch(null)}
            onSaved={() => {
              setSelectedMatch(null);
              mutate();
            }}
          />
        )}
      </div>
    );
  }

  const visibleDays = filteredDays.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-4">
          <p className="text-xs text-neutral-400">Total de dias</p>
          <p className="text-2xl font-bold text-yellow-400">{totals.total}</p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-4">
          <p className="text-xs text-neutral-400">Dias pendentes</p>
          <p className="text-2xl font-bold text-yellow-400">{totals.pending}</p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-4">
          <p className="text-xs text-neutral-400">Dias parciais</p>
          <p className="text-2xl font-bold text-yellow-400">{totals.partial}</p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-4">
          <p className="text-xs text-neutral-400">Dias completos</p>
          <p className="text-2xl font-bold text-yellow-400">{totals.complete}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={todayDay ? buildHistoricoLink({ dia: todayDay.key }) : buildHistoricoLink({})}
          className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
            todayDay
              ? "border-cyan-400 bg-cyan-400/20 text-cyan-200"
              : "border-neutral-700 bg-[#1a1a1a] text-neutral-400"
          }`}
        >
          Hoje
        </Link>
        <Link
          href={
            nextPendingDay
              ? buildHistoricoLink({ dia: nextPendingDay.key })
              : buildHistoricoLink({})
          }
          className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
            nextPendingDay
              ? "border-yellow-400 bg-yellow-400/10 text-yellow-200"
              : "border-neutral-700 bg-[#1a1a1a] text-neutral-400"
          }`}
        >
          Proximo dia pendente
        </Link>
        <button
          type="button"
          onClick={() => {
            setSearch("");
            setStatusFilter("all");
            setOriginFilter("all");
            setRangeStart("");
            setRangeEnd("");
          }}
          className="rounded-full border border-neutral-700 bg-[#1a1a1a] px-4 py-2 text-xs font-semibold text-neutral-200 hover:border-yellow-400/60"
        >
          Histórico completo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px_200px_200px_auto] gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por time, atleta, data ou local"
          className="w-full rounded-xl border border-neutral-800 bg-[#101010] px-4 py-3 text-sm text-neutral-100"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as DayFilter)}
          className="rounded-xl border border-neutral-800 bg-[#101010] px-4 py-3 text-sm text-neutral-100"
        >
          <option value="all">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="partial">Parcial</option>
          <option value="complete">Completo</option>
        </select>
        <select
          value={originFilter}
          onChange={(e) => setOriginFilter(e.target.value as OriginFilter)}
          className="rounded-xl border border-neutral-800 bg-[#101010] px-4 py-3 text-sm text-neutral-100"
        >
          <option value="all">Todas as origens</option>
          <option value="sorteio">Sorteio Inteligente</option>
          <option value="classica">Partida Classica</option>
          <option value="misto">Misto</option>
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={rangeStart}
            onChange={(e) => setRangeStart(e.target.value)}
            className="w-full rounded-xl border border-neutral-800 bg-[#101010] px-3 py-3 text-xs text-neutral-100"
          />
          <input
            type="date"
            value={rangeEnd}
            onChange={(e) => setRangeEnd(e.target.value)}
            className="w-full rounded-xl border border-neutral-800 bg-[#101010] px-3 py-3 text-xs text-neutral-100"
          />
        </div>
        <button
          type="button"
          onClick={() => mutate()}
          className="rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-4 py-3 text-sm font-semibold text-yellow-200 hover:bg-yellow-400/20"
        >
          Atualizar
        </button>
      </div>

      {filteredDays.length === 0 ? (
        renderEmptyState("Nenhum dia encontrado para os filtros atuais.")
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {visibleDays.map((day) => {
            const statusLabel = DAY_STATUS_LABELS[day.status];
            const statusBadge = DAY_STATUS_BADGES[day.status];
            const originLabel = ORIGIN_LABELS[day.origin];
            const originBadge = ORIGIN_BADGES[day.origin];

            return (
              <div key={day.key} className="rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-yellow-300">
                      {format(day.date, "dd/MM/yyyy")} - {day.hora}
                    </p>
                    <p className="text-xs text-neutral-500">{day.location}</p>
                    {day.lastUpdateLabel && (
                      <p className="text-xs text-neutral-500 mt-1">
                        Última atualização: {day.lastUpdateLabel}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusBadge}`}
                    >
                      {statusLabel}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${originBadge}`}
                    >
                      {originLabel}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-300">
                  <span className="rounded-full bg-neutral-800 px-3 py-1 font-semibold">
                    {day.done} de {day.total} partidas finalizadas
                  </span>
                </div>

                <div className="mt-4 space-y-1 text-xs text-neutral-400">
                  <p>
                    Time campeão do dia:{" "}
                    <span className="text-neutral-200">
                      {day.highlights.campeao || "Não definido"}
                    </span>
                  </p>
                  <p>
                    Artilheiro do dia:{" "}
                    <span className="text-neutral-200">
                      {day.highlights.artilheiro || "Não definido"}
                    </span>
                  </p>
                  <p>
                    Maestro do dia:{" "}
                    <span className="text-neutral-200">
                      {day.highlights.maestro || "Não definido"}
                    </span>
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={buildHistoricoLink({ dia: day.key })}
                    className="rounded-xl border border-neutral-700 px-4 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800"
                  >
                    Ver confrontos do dia
                  </Link>
                  {day.status !== "complete" && (
                    <Link
                      href={`/admin/partidas/resultados-do-dia?data=${day.key}`}
                      className="rounded-xl bg-yellow-400 px-4 py-2 text-xs font-semibold text-black hover:bg-yellow-300"
                    >
                      Continuar lancando resultados
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredDays.length > visibleCount && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="rounded-xl border border-neutral-700 px-5 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            Carregar mais dias
          </button>
        </div>
      )}
    </div>
  );
}
