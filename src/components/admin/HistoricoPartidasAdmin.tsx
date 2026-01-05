"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { useAdminMatches } from "@/hooks/useAdminMatches";
import type { PublicMatch, PublicMatchPresence, PublicMatchTeam } from "@/types/partida";

const FALLBACK_LOGO = "/images/times/time_padrao_01.png";
const FALLBACK_PLAYER = "/images/jogadores/jogador_padrao_01.jpg";

type MatchStatusFilter = "all" | "open" | "done";

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
  if (!value) return "Data nao informada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data nao informada";
  return withTime ? format(date, "dd/MM/yyyy HH:mm") : format(date, "dd/MM/yyyy");
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

function matchHasResult(match: PublicMatch) {
  return match.scoreA !== null && match.scoreB !== null;
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
    [match, teamAId, teamBId]
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
      return <p className="text-xs text-neutral-400">Sem gols ou assistencias ainda.</p>;
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
              {formatDate(match.date, true)} • {match.location || "Local nao informado"}
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
  const { matches, isLoading, isError, error, mutate } = useAdminMatches();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MatchStatusFilter>("all");
  const [selectedMatch, setSelectedMatch] = useState<PublicMatch | null>(null);

  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [matches]);

  const filteredMatches = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    return sortedMatches.filter((match) => {
      const isDone = matchHasResult(match);
      if (statusFilter === "done" && !isDone) return false;
      if (statusFilter === "open" && isDone) return false;

      if (!searchValue) return true;
      const dateLabel = formatDate(match.date);
      const target = `${match.teamA.name} ${match.teamB.name} ${match.location ?? ""} ${dateLabel}`
        .toLowerCase()
        .trim();
      return target.includes(searchValue);
    });
  }, [sortedMatches, search, statusFilter]);

  const totals = useMemo(() => {
    const total = matches.length;
    const done = matches.filter((match) => matchHasResult(match)).length;
    return { total, done, open: total - done };
  }, [matches]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-4">
          <p className="text-xs text-neutral-400">Total de partidas</p>
          <p className="text-2xl font-bold text-yellow-400">{totals.total}</p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-4">
          <p className="text-xs text-neutral-400">Aguardando resultado</p>
          <p className="text-2xl font-bold text-yellow-400">{totals.open}</p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-4">
          <p className="text-xs text-neutral-400">Finalizadas</p>
          <p className="text-2xl font-bold text-yellow-400">{totals.done}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_auto] gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por time, data ou local"
          className="w-full rounded-xl border border-neutral-800 bg-[#101010] px-4 py-3 text-sm text-neutral-100"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as MatchStatusFilter)}
          className="rounded-xl border border-neutral-800 bg-[#101010] px-4 py-3 text-sm text-neutral-100"
        >
          <option value="all">Todos os status</option>
          <option value="open">Sem resultado</option>
          <option value="done">Finalizados</option>
        </select>
        <button
          type="button"
          onClick={() => mutate()}
          className="rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-4 py-3 text-sm font-semibold text-yellow-200 hover:bg-yellow-400/20"
        >
          Atualizar
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-neutral-800 bg-[#1a1a1a] p-6 text-center text-sm text-neutral-300">
          Carregando partidas...
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-center text-sm text-red-200">
          Falha ao carregar partidas. {error instanceof Error ? error.message : ""}
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-[#1a1a1a] p-6 text-center text-sm text-neutral-300">
          Nenhuma partida encontrada para os filtros atuais.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredMatches.map((match) => {
            const hasResult = matchHasResult(match);
            const scoreLabel = hasResult ? `${match.scoreA} x ${match.scoreB}` : "-- x --";
            const statusLabel = hasResult ? "Finalizada" : "Aguardando resultado";

            return (
              <div
                key={match.id}
                className="rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-4"
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm text-neutral-300 font-semibold">
                      {formatDate(match.date, true)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {match.location || "Local nao informado"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                      hasResult
                        ? "bg-green-600/20 text-green-200"
                        : "bg-yellow-500/20 text-yellow-200"
                    }`}
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
