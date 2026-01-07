"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { useAdminMatches } from "@/hooks/useAdminMatches";
import { useTimesDoDiaPublicado } from "@/hooks/useTimesDoDiaPublicado";
import type { PublicMatch, PublicMatchPresence, PublicMatchTeam } from "@/types/partida";

const FALLBACK_LOGO = "/images/times/time_padrao_01.png";
const FALLBACK_PLAYER = "/images/jogadores/jogador_padrao_01.jpg";
const OWN_GOAL_ID = "own-goal";
const NO_ASSIST_ID = "no-assist";
const UNKNOWN_GOAL_ID = "unknown-goal";
const STATUS_STORAGE_KEY = "fut7pro_match_status";
const AUTO_SAVE_ENABLED = true;

const STATUS_LABELS: Record<MatchStatus, string> = {
  not_started: "Nao realizado",
  in_progress: "Em andamento",
  finished: "Finalizada",
};

const STATUS_BADGES: Record<MatchStatus, string> = {
  not_started: "bg-yellow-500/20 text-yellow-200",
  in_progress: "bg-cyan-500/20 text-cyan-200",
  finished: "bg-green-600/20 text-green-200",
};

type MatchStatus = "not_started" | "in_progress" | "finished";
type MatchFilter = "all" | MatchStatus;

type ResultadosDoDiaAdminProps = {
  showHeader?: boolean;
  showFilters?: boolean;
};

type GoalEvent = {
  id: string;
  teamId: string;
  scorerId: string;
  assistId: string;
  isOwnGoal: boolean;
  minute: string;
  description: string;
  source: "existing" | "placeholder" | "new";
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

type MatchCard = {
  match: PublicMatch;
  date: Date | null;
  order: number;
  status: MatchStatus;
  scoreA: number;
  scoreB: number;
};

function normalizeKey(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function normalizeLabel(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function createEventId() {
  return `goal-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

function formatDate(value?: string | null, withTime = false) {
  if (!value) return "Data nao informada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data nao informada";
  return withTime ? format(date, "dd/MM/yyyy HH:mm") : format(date, "dd/MM/yyyy");
}

function formatTime(value?: Date | null) {
  if (!value) return "--:--";
  return format(value, "HH:mm");
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

function addDays(date: Date, offset: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + offset);
  return next;
}

function parsePublishedDate(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parts = trimmed.split("/");
  if (parts.length >= 3) {
    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2].trim().slice(0, 4));
    const date = new Date(year, month - 1, day);
    if (!Number.isNaN(date.getTime())) return date;
  }
  const fallback = new Date(trimmed);
  if (!Number.isNaN(fallback.getTime())) return fallback;
  return null;
}

function parseDayParam(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split("/").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  }
  return null;
}

function isSameLocalDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
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

function getCreditedTeamId(event: GoalEvent, teamAId: string, teamBId: string) {
  if (!event.isOwnGoal) return event.teamId;
  return event.teamId === teamAId ? teamBId : teamAId;
}

function scoreByTeam(events: GoalEvent[], teamId: string, teamAId: string, teamBId: string) {
  return events.filter((event) => getCreditedTeamId(event, teamAId, teamBId) === teamId).length;
}

function buildStats(events: GoalEvent[]) {
  const stats = new Map<string, { goals: number; assists: number }>();
  events.forEach((event) => {
    if (!event.scorerId) return;
    if (event.isOwnGoal) return;
    if (event.scorerId === OWN_GOAL_ID || event.scorerId === UNKNOWN_GOAL_ID) return;

    const scorer = stats.get(event.scorerId) ?? { goals: 0, assists: 0 };
    scorer.goals += 1;
    stats.set(event.scorerId, scorer);

    if (event.assistId && event.assistId !== NO_ASSIST_ID) {
      const assist = stats.get(event.assistId) ?? { goals: 0, assists: 0 };
      assist.assists += 1;
      stats.set(event.assistId, assist);
    }
  });
  return stats;
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
        assistId: NO_ASSIST_ID,
        isOwnGoal: false,
        minute: "",
        description: "",
        source: "existing",
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
      if (event.assistId === NO_ASSIST_ID && pool.length) {
        event.assistId = pool.shift() ?? NO_ASSIST_ID;
      }
    });
  });

  const scoreA = scoreByTeam(events, teamAId, teamAId, teamBId);
  const scoreB = scoreByTeam(events, teamBId, teamAId, teamBId);
  const targetScoreA = match.scoreA ?? scoreA;
  const targetScoreB = match.scoreB ?? scoreB;

  const missingA = Math.max(0, targetScoreA - scoreA);
  const missingB = Math.max(0, targetScoreB - scoreB);

  for (let i = 0; i < missingA; i += 1) {
    events.push({
      id: createEventId(),
      teamId: teamAId,
      scorerId: UNKNOWN_GOAL_ID,
      assistId: NO_ASSIST_ID,
      isOwnGoal: false,
      minute: "",
      description: "",
      source: "placeholder",
    });
  }

  for (let i = 0; i < missingB; i += 1) {
    events.push({
      id: createEventId(),
      teamId: teamBId,
      scorerId: UNKNOWN_GOAL_ID,
      assistId: NO_ASSIST_ID,
      isOwnGoal: false,
      minute: "",
      description: "",
      source: "placeholder",
    });
  }

  return events;
}

function countPresenceGoals(match: PublicMatch, teamId: string, teamAId: string, teamBId: string) {
  return match.presences.reduce((total, presence) => {
    const presenceTeamId = resolvePresenceTeamId(
      presence,
      match.teamA,
      match.teamB,
      teamAId,
      teamBId
    );
    if (presenceTeamId !== teamId) return total;
    return total + Number(presence.goals ?? 0);
  }, 0);
}

function resolveMatchStatus(
  match: PublicMatch,
  statusMap: Record<string, MatchStatus>
): MatchStatus {
  const override = statusMap[match.id];
  if (override) return override;
  if (match.scoreA === null || match.scoreB === null) {
    const teamAId = match.teamA.id ?? "team-a";
    const teamBId = match.teamB.id ?? "team-b";
    const goalsA = countPresenceGoals(match, teamAId, teamAId, teamBId);
    const goalsB = countPresenceGoals(match, teamBId, teamAId, teamBId);
    if (goalsA + goalsB > 0) return "in_progress";
    return "not_started";
  }
  return "finished";
}

function loadStatusMap() {
  if (typeof window === "undefined") return {} as Record<string, MatchStatus>;
  const raw = window.localStorage.getItem(STATUS_STORAGE_KEY);
  if (!raw) return {} as Record<string, MatchStatus>;
  try {
    const parsed = JSON.parse(raw) as Record<string, MatchStatus>;
    return parsed || {};
  } catch {
    return {} as Record<string, MatchStatus>;
  }
}

function saveStatusMap(statusMap: Record<string, MatchStatus>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(statusMap));
}

type GoalModalProps = {
  open: boolean;
  teamId: string;
  teamName: string;
  opponentName: string;
  players: RosterPlayer[];
  onClose: () => void;
  onSave: (event: GoalEvent) => void;
};

function GoalModal({
  open,
  teamId,
  teamName,
  opponentName,
  players,
  onClose,
  onSave,
}: GoalModalProps) {
  const [scorerId, setScorerId] = useState("");
  const [assistId, setAssistId] = useState(NO_ASSIST_ID);
  const [scorerQuery, setScorerQuery] = useState("");
  const [assistQuery, setAssistQuery] = useState("");
  const [useTime, setUseTime] = useState(false);
  const [minute, setMinute] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setScorerId("");
      setAssistId(NO_ASSIST_ID);
      setScorerQuery("");
      setAssistQuery("");
      setUseTime(false);
      setMinute("");
      setDescription("");
      setError(null);
    }
  }, [open]);

  const isOwnGoal = scorerId === OWN_GOAL_ID;

  useEffect(() => {
    if (isOwnGoal) {
      setAssistId(NO_ASSIST_ID);
    }
  }, [isOwnGoal]);

  const filteredScorers = useMemo(() => {
    const query = normalizeKey(scorerQuery);
    if (!query) return players;
    return players.filter((player) =>
      normalizeKey(`${player.name} ${player.nickname}`).includes(query)
    );
  }, [players, scorerQuery]);

  const filteredAssists = useMemo(() => {
    const query = normalizeKey(assistQuery);
    if (!query) return players;
    return players.filter((player) =>
      normalizeKey(`${player.name} ${player.nickname}`).includes(query)
    );
  }, [players, assistQuery]);

  if (!open) return null;

  const handleSave = () => {
    if (!scorerId) {
      setError("Selecione o jogador que fez o gol.");
      return;
    }

    const event: GoalEvent = {
      id: createEventId(),
      teamId,
      scorerId,
      assistId: isOwnGoal ? NO_ASSIST_ID : assistId || NO_ASSIST_ID,
      isOwnGoal,
      minute: useTime ? minute.trim() : "",
      description: description.trim(),
      source: "new",
    };

    onSave(event);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-[#141414] p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold text-yellow-400">Adicionar gol - {teamName}</h3>
          <button type="button" onClick={onClose} className="text-sm text-neutral-300">
            Fechar
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-2">Gol do jogador</label>
            <input
              value={scorerQuery}
              onChange={(e) => setScorerQuery(e.target.value)}
              placeholder="Buscar atleta"
              className="w-full rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-xs text-neutral-100 mb-2"
            />
            <select
              value={scorerId}
              onChange={(e) => setScorerId(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
            >
              <option value="">Selecione o jogador</option>
              <option value={OWN_GOAL_ID}>Gol contra</option>
              {filteredScorers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.nickname ? `${player.name} (${player.nickname})` : player.name}
                </option>
              ))}
            </select>
            {isOwnGoal && (
              <p className="text-xs text-yellow-200 mt-1">
                Este gol sera computado para o time {opponentName || "adversario"}.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-2">Assistencia do jogador</label>
            <input
              value={assistQuery}
              onChange={(e) => setAssistQuery(e.target.value)}
              placeholder="Buscar atleta"
              disabled={isOwnGoal}
              className="w-full rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-xs text-neutral-100 mb-2 disabled:opacity-60"
            />
            <select
              value={assistId}
              onChange={(e) => setAssistId(e.target.value)}
              disabled={isOwnGoal}
              className="w-full rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100 disabled:opacity-60"
            >
              <option value={NO_ASSIST_ID}>Sem assistencia</option>
              {filteredAssists.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.nickname ? `${player.name} (${player.nickname})` : player.name}
                </option>
              ))}
            </select>
            {isOwnGoal && (
              <p className="text-xs text-yellow-200 mt-1">Assistencia desativada em gol contra.</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="definir-tempo"
              checked={useTime}
              onChange={(e) => setUseTime(e.target.checked)}
            />
            <label htmlFor="definir-tempo" className="text-xs text-neutral-300">
              Definir tempo
            </label>
          </div>
          {useTime && (
            <input
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              placeholder="Minuto ou mm:ss"
              className="w-full rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
            />
          )}

          <div>
            <label className="block text-xs text-neutral-400 mb-2">Descricao (opcional)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: falta, rebote"
              className="w-full rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-200">
            {error}
          </div>
        )}

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
          >
            Salvar gol
          </button>
        </div>
      </div>
    </div>
  );
}

type MatchModalProps = {
  match: PublicMatch;
  status: MatchStatus;
  onStatusChange: (matchId: string, status: MatchStatus) => void;
  onClose: () => void;
  onSaved: () => void;
};

function MatchModal({ match, status, onStatusChange, onClose, onSaved }: MatchModalProps) {
  const teamAId = match.teamA.id ?? "team-a";
  const teamBId = match.teamB.id ?? "team-b";
  const [events, setEvents] = useState<GoalEvent[]>(() => buildGoalEvents(match, teamAId, teamBId));
  const [localStatus, setLocalStatus] = useState<MatchStatus>(status);
  const [goalModalTeam, setGoalModalTeam] = useState<"A" | "B" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(status === "finished");
  const [scoreMode, setScoreMode] = useState(false);
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);
  const lastSavedKey = useRef<string | null>(null);
  const didMount = useRef(false);

  useEffect(() => {
    setLocalStatus(status);
    setLocked(status === "finished");
  }, [status]);

  const rosterA = useMemo(
    () => buildRoster(match, teamAId, teamAId, teamBId),
    [match, teamAId, teamBId]
  );
  const rosterB = useMemo(
    () => buildRoster(match, teamBId, teamAId, teamBId),
    [match, teamAId, teamBId]
  );

  const playerLookup = useMemo(() => {
    const map = new Map<string, RosterPlayer>();
    [...rosterA, ...rosterB].forEach((player) => {
      map.set(player.id, player);
    });
    return map;
  }, [rosterA, rosterB]);

  const scoreA = useMemo(
    () => scoreByTeam(events, teamAId, teamAId, teamBId),
    [events, teamAId, teamBId]
  );
  const scoreB = useMemo(
    () => scoreByTeam(events, teamBId, teamAId, teamBId),
    [events, teamAId, teamBId]
  );

  const presencePayload = useMemo(() => {
    const stats = buildStats(events);
    const presenceByAthlete = new Map(
      match.presences.map((presence) => [presence.athleteId, presence])
    );

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

    const eventAthletes = new Set<string>();
    events.forEach((event) => {
      if (event.scorerId && event.scorerId !== OWN_GOAL_ID && event.scorerId !== UNKNOWN_GOAL_ID) {
        eventAthletes.add(event.scorerId);
      }
      if (event.assistId && event.assistId !== NO_ASSIST_ID) {
        eventAthletes.add(event.assistId);
      }
    });

    eventAthletes.forEach((athleteId) => {
      if (presenceByAthlete.has(athleteId)) return;
      const event = events.find(
        (item) => item.scorerId === athleteId || item.assistId === athleteId
      );
      if (!event) return;
      const counts = stats.get(athleteId) ?? { goals: 0, assists: 0 };
      presences.push({
        athleteId,
        teamId: event.teamId ?? null,
        goals: counts.goals,
        assists: counts.assists,
        status: "TITULAR",
      });
    });

    return presences;
  }, [events, match.presences]);

  const saveKey = useMemo(() => {
    const keyEvents = events
      .map((event) =>
        [
          event.teamId,
          event.scorerId,
          event.assistId,
          event.isOwnGoal ? "1" : "0",
          event.minute,
          event.description,
        ].join("|")
      )
      .join(";");
    return `${localStatus}-${keyEvents}`;
  }, [events, localStatus]);

  const persistMatch = useCallback(
    async (options?: {
      closeOnSuccess?: boolean;
      silent?: boolean;
      statusOverride?: MatchStatus;
    }) => {
      if (options?.silent && lastSavedKey.current === saveKey) return;

      const statusToPersist = options?.statusOverride ?? localStatus;
      setIsSaving(true);
      setError(null);
      try {
        const payload = {
          scoreA: statusToPersist === "not_started" ? null : scoreA,
          scoreB: statusToPersist === "not_started" ? null : scoreB,
          presences: presencePayload,
        };

        const response = await fetch(`/api/partidas/${match.id}/resultado`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const body = await response.text();
          throw new Error(body || "Falha ao salvar resultado");
        }

        lastSavedKey.current = saveKey;
        if (!options?.silent) {
          onSaved();
        }
        if (options?.closeOnSuccess) {
          onClose();
        }
      } catch (err) {
        if (!options?.silent) {
          setError(err instanceof Error ? err.message : "Falha ao salvar resultado");
        }
      } finally {
        setIsSaving(false);
      }
    },
    [localStatus, match.id, onClose, onSaved, presencePayload, saveKey, scoreA, scoreB]
  );

  useEffect(() => {
    if (!AUTO_SAVE_ENABLED) return;
    if (locked) return;
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    const timeout = setTimeout(() => {
      persistMatch({ silent: true });
    }, 700);

    return () => clearTimeout(timeout);
  }, [events, localStatus, locked, persistMatch]);

  const handleAddGoal = (team: "A" | "B") => {
    if (locked) return;
    setGoalModalTeam(team);
  };

  const handleSaveGoal = (event: GoalEvent) => {
    setEvents((prev) => [...prev, event]);
    setGoalModalTeam(null);
    if (localStatus === "not_started") {
      onStatusChange(match.id, "in_progress");
      setLocalStatus("in_progress");
      setLocked(false);
    }
  };

  const handleRemoveGoal = (eventId: string) => {
    if (locked) return;
    setEvents((prev) => prev.filter((event) => event.id !== eventId));
  };

  const handleUndoLast = () => {
    if (locked) return;
    setEvents((prev) => {
      if (!prev.length) return prev;
      const reverseIndex = [...prev].reverse().findIndex((event) => event.source !== "placeholder");
      const targetIndex = reverseIndex >= 0 ? prev.length - 1 - reverseIndex : -1;
      if (targetIndex < 0) return prev;
      return prev.filter((_, index) => index !== targetIndex);
    });
  };

  const handleReset = () => {
    if (locked) return;
    const confirmed = window.confirm("Deseja zerar o placar e remover todos os gols?");
    if (!confirmed) return;
    setEvents([]);
    onStatusChange(match.id, "not_started");
    setLocalStatus("not_started");
    setLocked(false);
  };

  const handleStatusChange = (nextStatus: MatchStatus) => {
    onStatusChange(match.id, nextStatus);
    setLocalStatus(nextStatus);
    if (nextStatus === "not_started") {
      setEvents([]);
      setLocked(false);
    }
    if (nextStatus === "in_progress") {
      setLocked(false);
    }
    if (nextStatus === "finished") {
      setLocked(true);
    }
  };

  const handleFinalize = () => {
    if (locked) return;
    setShowFinalizeConfirm(true);
  };

  const confirmFinalize = async () => {
    if (isSaving) return;
    setShowFinalizeConfirm(false);
    onStatusChange(match.id, "finished");
    setLocalStatus("finished");
    setLocked(true);
    await persistMatch({ silent: false, statusOverride: "finished" });
  };

  const handleUnlock = () => {
    const confirmed = window.confirm("Desbloquear para correcao?");
    if (!confirmed) return;
    onStatusChange(match.id, "in_progress");
    setLocalStatus("in_progress");
    setLocked(false);
  };

  const renderGoalList = (teamId: string) => {
    const teamEvents = events.filter((event) => event.teamId === teamId);
    if (!teamEvents.length) {
      return <div className="text-xs text-neutral-400">Nenhum gol lancado.</div>;
    }

    return (
      <ul className="space-y-2">
        {teamEvents.map((event, index) => {
          const scorer = playerLookup.get(event.scorerId);
          const assist = playerLookup.get(event.assistId);
          const scorerLabel =
            event.scorerId === OWN_GOAL_ID
              ? "Gol contra"
              : event.scorerId === UNKNOWN_GOAL_ID
                ? "Gol sem autor"
                : scorer?.name || "Jogador";
          const assistLabel =
            event.assistId === NO_ASSIST_ID ? "Sem assistencia" : assist?.name || "Assistencia";
          const creditedTeamId = getCreditedTeamId(event, teamAId, teamBId);
          const creditedTeamLabel =
            creditedTeamId === teamAId ? match.teamA.name : match.teamB.name;

          return (
            <li
              key={event.id}
              className="rounded-lg border border-neutral-800 bg-[#101010] px-3 py-2 text-xs text-neutral-200"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">
                    {index + 1}. {scorerLabel}
                  </div>
                  <div className="text-neutral-400">Assistencia: {assistLabel}</div>
                  {event.isOwnGoal && (
                    <div className="text-yellow-200">Conta para {creditedTeamLabel}</div>
                  )}
                  {event.minute && <div className="text-neutral-400">Tempo: {event.minute}</div>}
                  {event.description && <div className="text-neutral-400">{event.description}</div>}
                </div>
                {!locked && event.source !== "placeholder" && (
                  <button
                    type="button"
                    onClick={() => handleRemoveGoal(event.id)}
                    className="text-[10px] text-red-200"
                  >
                    Remover
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-[#141414] p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-yellow-400">Resultado da partida</h2>
            <p className="text-sm text-neutral-400">
              {formatDate(match.date, true)} - {match.location || "Local nao informado"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Status</span>
              <select
                value={localStatus}
                onChange={(e) => handleStatusChange(e.target.value as MatchStatus)}
                disabled={locked}
                className="rounded-lg border border-neutral-700 bg-[#111] px-3 py-1 text-xs text-neutral-100 disabled:opacity-60"
              >
                <option value="not_started">Nao realizado</option>
                <option value="in_progress">Em andamento</option>
                <option value="finished">Finalizada</option>
              </select>
            </div>
            {locked ? (
              <button
                type="button"
                onClick={handleUnlock}
                className="rounded-lg border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-xs text-yellow-200"
              >
                Desbloquear para correcao
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setScoreMode((prev) => !prev)}
                className="rounded-lg border border-neutral-700 px-3 py-1 text-xs text-neutral-200"
              >
                {scoreMode ? "Modo completo" : "Modo placar"}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-neutral-300 hover:text-yellow-300"
            >
              Fechar
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            type="button"
            onClick={handleUndoLast}
            disabled={locked}
            className="rounded-full border border-neutral-700 px-4 py-1 text-xs text-neutral-200 disabled:opacity-60"
          >
            Desfazer ultimo gol
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={locked}
            className="rounded-full border border-red-500/40 px-4 py-1 text-xs text-red-200 disabled:opacity-60"
          >
            Zerar placar
          </button>
          {AUTO_SAVE_ENABLED && (
            <span className="text-xs text-green-300">Auto salvar: ativado</span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-center rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-4">
          <div className="flex items-center gap-3">
            <Image
              src={match.teamA.logoUrl || FALLBACK_LOGO}
              alt={`Logo ${match.teamA.name}`}
              width={42}
              height={42}
              className="rounded"
            />
            <div>
              <p className="text-xs text-neutral-400">Time A</p>
              <p className="text-base font-semibold">{match.teamA.name}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-400">Placar</p>
            <p className="text-3xl font-bold text-yellow-400">
              {scoreA} x {scoreB}
            </p>
          </div>
          <div className="flex items-center justify-end gap-3">
            <div className="text-right">
              <p className="text-xs text-neutral-400">Time B</p>
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

        {!scoreMode && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-yellow-300">{match.teamA.name}</h3>
                <button
                  type="button"
                  onClick={() => handleAddGoal("A")}
                  disabled={locked}
                  className="rounded-lg bg-yellow-400 px-3 py-1 text-xs font-semibold text-black disabled:opacity-60"
                >
                  Adicionar gol
                </button>
              </div>
              {renderGoalList(teamAId)}
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-yellow-300">{match.teamB.name}</h3>
                <button
                  type="button"
                  onClick={() => handleAddGoal("B")}
                  disabled={locked}
                  className="rounded-lg bg-yellow-400 px-3 py-1 text-xs font-semibold text-black disabled:opacity-60"
                >
                  Adicionar gol
                </button>
              </div>
              {renderGoalList(teamBId)}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col md:flex-row gap-3">
          <button
            type="button"
            onClick={() => persistMatch({ closeOnSuccess: true })}
            disabled={isSaving}
            className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            {AUTO_SAVE_ENABLED ? "Fechar" : "Salvar e fechar"}
          </button>
          {localStatus !== "finished" && (
            <button
              type="button"
              onClick={handleFinalize}
              disabled={isSaving}
              className="flex-1 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
            >
              Finalizar partida
            </button>
          )}
        </div>
      </div>

      {showFinalizeConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-[#141414] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <FaCheckCircle className="text-yellow-300 text-xl" />
              <h3 className="text-lg font-semibold text-yellow-300">Finalizar partida</h3>
            </div>
            <p className="text-sm text-neutral-300">
              Ao finalizar, o resultado entra nos rankings, estatisticas e historico publico.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-neutral-300">
              <li>- A edicao fica bloqueada (pode desbloquear para correcao).</li>
              <li>- Vitorias, empates e derrotas sao calculados automaticamente.</li>
            </ul>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowFinalizeConfirm(false)}
                className="flex-1 rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={confirmFinalize}
                disabled={isSaving}
                className="flex-1 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300 disabled:opacity-60"
              >
                Finalizar agora
              </button>
            </div>
          </div>
        </div>
      )}

      <GoalModal
        open={goalModalTeam !== null}
        teamId={goalModalTeam === "A" ? teamAId : teamBId}
        teamName={goalModalTeam === "A" ? match.teamA.name : match.teamB.name}
        opponentName={goalModalTeam === "A" ? match.teamB.name : match.teamA.name}
        players={goalModalTeam === "A" ? rosterA : rosterB}
        onClose={() => setGoalModalTeam(null)}
        onSave={handleSaveGoal}
      />
    </div>
  );
}

export default function ResultadosDoDiaAdmin({
  showHeader = true,
  showFilters = true,
}: ResultadosDoDiaAdminProps) {
  const { matches, isLoading, isError, error, mutate } = useAdminMatches();
  const sorteioPublicado = useTimesDoDiaPublicado({ source: "admin" });
  const searchParams = useSearchParams();
  const forcedDate = useMemo(() => parseDayParam(searchParams?.get("data")), [searchParams]);
  const [statusFilter, setStatusFilter] = useState<MatchFilter>("all");
  const [statusMap, setStatusMap] = useState<Record<string, MatchStatus>>({});
  const [selectedMatch, setSelectedMatch] = useState<PublicMatch | null>(null);
  const [showPendingAlert, setShowPendingAlert] = useState(true);

  useEffect(() => {
    setStatusMap(loadStatusMap());
  }, []);

  const updateStatus = (matchId: string, status: MatchStatus) => {
    setStatusMap((prev) => {
      const next = { ...prev, [matchId]: status };
      saveStatusMap(next);
      return next;
    });
  };

  const { activeLabel, matchCards } = useMemo(() => {
    const today = startOfDay(new Date());
    const yesterday = addDays(today, -1);

    const entries = matches
      .map((match) => {
        const date = parseMatchDate(match.date);
        if (!date) return null;
        return {
          match,
          date,
          status: resolveMatchStatus(match, statusMap),
        };
      })
      .filter(Boolean) as Array<{ match: PublicMatch; date: Date; status: MatchStatus }>;

    const todayEntries = entries.filter((entry) => isSameLocalDay(entry.date, today));
    const pendingYesterday = entries.filter(
      (entry) => isSameLocalDay(entry.date, yesterday) && entry.status !== "finished"
    );
    const futureEntries = entries
      .filter((entry) => startOfDay(entry.date).getTime() > today.getTime())
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    let activeDate = today;
    let filtered: Array<{ match: PublicMatch; date: Date; status: MatchStatus }> = [];
    let activeLabelValue = "";

    if (forcedDate) {
      activeDate = startOfDay(forcedDate);
      filtered = entries.filter((entry) => isSameLocalDay(entry.date, activeDate));
      activeLabelValue = `Jogos de ${format(activeDate, "dd/MM/yyyy")}`;
    } else if (todayEntries.length > 0) {
      activeDate = today;
      filtered = todayEntries.sort((a, b) => a.date.getTime() - b.date.getTime());
      activeLabelValue = `Jogos de hoje - ${format(activeDate, "dd/MM/yyyy")}`;
    } else if (pendingYesterday.length > 0) {
      activeDate = yesterday;
      filtered = pendingYesterday.sort((a, b) => a.date.getTime() - b.date.getTime());
      activeLabelValue = `Jogos pendentes de ontem - ${format(activeDate, "dd/MM/yyyy")}`;
    } else if (futureEntries.length > 0) {
      activeDate = startOfDay(futureEntries[0].date);
      filtered = futureEntries.filter((entry) => isSameLocalDay(entry.date, activeDate));
      activeLabelValue = `Proximo jogo em ${format(activeDate, "dd/MM/yyyy")}`;
    }

    const confrontos = sorteioPublicado.data?.confrontos ?? [];
    const publishedDate =
      parsePublishedDate(sorteioPublicado.data?.dataPartida) ||
      parseMatchDate(sorteioPublicado.data?.publicadoEm);

    let orderedEntries = filtered;
    if (confrontos.length && publishedDate && isSameLocalDay(publishedDate, activeDate)) {
      const assigned = new Set<string>();
      const ordered: Array<{ entry: (typeof filtered)[number]; order: number }> = [];

      const normalizedEntries = filtered.map((entry) => ({
        entry,
        direct: `${normalizeLabel(entry.match.teamA.name)}|${normalizeLabel(
          entry.match.teamB.name
        )}`,
        reverse: `${normalizeLabel(entry.match.teamB.name)}|${normalizeLabel(
          entry.match.teamA.name
        )}`,
      }));

      confrontos.forEach((confronto, index) => {
        const key = `${normalizeLabel(confronto.timeA)}|${normalizeLabel(confronto.timeB)}`;
        const match =
          normalizedEntries.find(
            (item) => !assigned.has(item.entry.match.id) && item.direct === key
          ) ||
          normalizedEntries.find(
            (item) => !assigned.has(item.entry.match.id) && item.reverse === key
          );
        if (!match) return;
        assigned.add(match.entry.match.id);
        ordered.push({ entry: match.entry, order: confronto.ordem ?? index + 1 });
      });

      const remaining = filtered
        .filter((entry) => !assigned.has(entry.match.id))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      orderedEntries = [
        ...ordered.map((item) => ({ ...item.entry, orderOverride: item.order })),
        ...remaining,
      ] as Array<(typeof filtered)[number] & { orderOverride?: number }>;
    }

    const cards = orderedEntries.map((item, index) => {
      const teamAId = item.match.teamA.id ?? "team-a";
      const teamBId = item.match.teamB.id ?? "team-b";
      const goalsA = countPresenceGoals(item.match, teamAId, teamAId, teamBId);
      const goalsB = countPresenceGoals(item.match, teamBId, teamAId, teamBId);
      const scoreA = item.match.scoreA ?? goalsA;
      const scoreB = item.match.scoreB ?? goalsB;

      return {
        match: item.match,
        date: item.date ?? null,
        order: (item as { orderOverride?: number }).orderOverride ?? index + 1,
        status: item.status,
        scoreA,
        scoreB,
      } as MatchCard;
    });

    return {
      activeLabel: activeLabelValue,
      matchCards: cards,
    };
  }, [matches, sorteioPublicado.data, statusMap, forcedDate]);

  const pendingInfo = useMemo(() => {
    const today = startOfDay(new Date());
    const pending = matches
      .map((match) => {
        const date = parseMatchDate(match.date);
        if (!date) return null;
        return {
          date,
          status: resolveMatchStatus(match, statusMap),
        };
      })
      .filter(Boolean)
      .filter((item) => {
        const day = startOfDay((item as { date: Date }).date);
        return (
          day.getTime() < today.getTime() && (item as { status: MatchStatus }).status !== "finished"
        );
      }) as Array<{ date: Date; status: MatchStatus }>;

    if (!pending.length) return null;
    pending.sort((a, b) => a.date.getTime() - b.date.getTime());
    return {
      count: pending.length,
      oldestDate: pending[0].date,
    };
  }, [matches, statusMap]);

  const filteredCards = useMemo(() => {
    if (statusFilter === "all") return matchCards;
    return matchCards.filter((item) => item.status === statusFilter);
  }, [matchCards, statusFilter]);

  const totals = useMemo(() => {
    const total = matchCards.length;
    const notStarted = matchCards.filter((item) => item.status === "not_started").length;
    const inProgress = matchCards.filter((item) => item.status === "in_progress").length;
    const finished = matchCards.filter((item) => item.status === "finished").length;
    return { total, notStarted, inProgress, finished };
  }, [matchCards]);

  const allFinished = totals.total > 0 && totals.finished === totals.total;

  const pendingLabel = totals.notStarted > 0 ? `${totals.notStarted} partidas sem resultado` : "";

  return (
    <div className="space-y-6">
      {pendingInfo && showPendingAlert && (
        <div className="mb-2">
          <div className="relative flex items-center gap-3 rounded-lg border-l-4 border-yellow-400 bg-yellow-900/70 px-4 py-3 text-sm font-semibold text-yellow-200 shadow">
            <FaExclamationTriangle className="text-yellow-300 text-lg" />
            <span>
              Atencao: {pendingInfo.count} {pendingInfo.count === 1 ? "confronto" : "confrontos"}{" "}
              sem resultado pendente
              {pendingInfo.count === 1 ? "" : "s"} desde{" "}
              {format(pendingInfo.oldestDate, "dd/MM/yyyy")}. Publique os resultados para atualizar
              rankings e historico.
            </span>
            <button
              type="button"
              onClick={() => setShowPendingAlert(false)}
              className="absolute right-3 top-2 text-lg text-yellow-200 hover:text-white"
              aria-label="Fechar alerta"
            >
              x
            </button>
          </div>
        </div>
      )}
      {allFinished && (
        <div className="rounded-2xl border border-green-500/40 bg-green-500/10 px-4 py-4 text-sm text-green-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-green-300 text-lg" />
              <span>Veja o Time Campeao do Dia e os destaques individuais da rodada.</span>
            </div>
            <Link
              href="/admin/partidas/time-campeao-do-dia"
              className="rounded-full border border-green-400/60 bg-green-400/10 px-4 py-2 text-xs font-semibold text-green-100 hover:border-green-300 hover:bg-green-400/20"
            >
              Abrir Time Campeao do Dia
            </Link>
          </div>
        </div>
      )}
      {showHeader && (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">
              Registrar Resultados do Dia
            </h1>
            <p className="text-sm text-gray-300 mt-2">
              Lance placares e gols em tempo real. Ao finalizar, rankings e perfis sao atualizados
              automaticamente.
            </p>
            {activeLabel && <p className="mt-2 text-xs text-yellow-200">{activeLabel}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {AUTO_SAVE_ENABLED && (
              <div className="rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1 text-xs text-green-200">
                Auto salvar: ativado
              </div>
            )}
          </div>
        </div>
      )}

      {showFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {[
            { value: "all", label: "Todas" },
            { value: "not_started", label: "Sem resultado" },
            { value: "in_progress", label: "Em andamento" },
            { value: "finished", label: "Finalizadas" },
          ].map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value as MatchFilter)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                statusFilter === filter.value
                  ? "border-yellow-400 bg-yellow-400 text-black"
                  : "border-neutral-700 bg-[#1a1a1a] text-neutral-200 hover:border-yellow-400/60"
              }`}
            >
              {filter.label}
            </button>
          ))}
          {pendingLabel && <span className="text-xs text-yellow-200 ml-2">{pendingLabel}</span>}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-neutral-800 bg-[#1a1a1a] p-6 text-center text-sm text-neutral-300">
          Carregando partidas...
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-center text-sm text-red-200">
          Falha ao carregar partidas. {error instanceof Error ? error.message : ""}
        </div>
      ) : matchCards.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-8 text-center">
          <p className="text-sm text-neutral-300 mb-4">
            Nenhum confronto do dia encontrado. Quando houver jogos publicados para o dia, eles
            aparecem aqui para lancamento em tempo real.
          </p>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-[#1a1a1a] p-6 text-center text-sm text-neutral-300">
          Nenhuma partida encontrada para o filtro atual.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCards.map((item) => (
            <button
              key={item.match.id}
              type="button"
              onClick={() => setSelectedMatch(item.match)}
              className="text-left rounded-2xl border border-neutral-800 bg-[#1a1a1a] p-4 hover:border-yellow-400/50 transition"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs text-neutral-400">Rodada {item.order}</p>
                  <p className="text-sm text-neutral-300">
                    {formatDate(item.match.date)} - {formatTime(item.date)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_BADGES[item.status]}`}
                >
                  {STATUS_LABELS[item.status]}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Image
                    src={item.match.teamA.logoUrl || FALLBACK_LOGO}
                    alt={`Logo ${item.match.teamA.name}`}
                    width={38}
                    height={38}
                    className="rounded"
                  />
                  <div>
                    <p className="text-xs text-neutral-400">Time A</p>
                    <p className="text-sm font-semibold text-white">{item.match.teamA.name}</p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-lg font-bold text-yellow-400">
                    {item.scoreA} x {item.scoreB}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-neutral-400">Time B</p>
                    <p className="text-sm font-semibold text-white">{item.match.teamB.name}</p>
                  </div>
                  <Image
                    src={item.match.teamB.logoUrl || FALLBACK_LOGO}
                    alt={`Logo ${item.match.teamB.name}`}
                    width={38}
                    height={38}
                    className="rounded"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-neutral-500">Clique para abrir</span>
                <span className="text-xs text-yellow-300">Abrir</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedMatch && (
        <MatchModal
          match={selectedMatch}
          status={resolveMatchStatus(selectedMatch, statusMap)}
          onStatusChange={updateStatus}
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
