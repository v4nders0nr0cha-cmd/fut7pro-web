"use client";

import Head from "next/head";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FaArrowLeft,
  FaBolt,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaFlagCheckered,
  FaHistory,
  FaMapMarkerAlt,
  FaPlus,
  FaTrash,
  FaUsers,
} from "react-icons/fa";
import ResultadosDoDiaAdmin from "@/components/admin/ResultadosDoDiaAdmin";
import { useAdminMatches } from "@/hooks/useAdminMatches";
import { useJogadores } from "@/hooks/useJogadores";
import { useMe } from "@/hooks/useMe";
import { useTimes } from "@/hooks/useTimes";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import { usePublicTeamRankings } from "@/hooks/usePublicTeamRankings";
import type { Jogador } from "@/types/jogador";
import type { PublicMatch } from "@/types/partida";
import type { Time } from "@/types/time";
import type { RankingAtleta } from "@/types/estatisticas";
import type { TeamRankingEntry } from "@/hooks/usePublicTeamRankings";

const RESULTS_ROUTE = "/admin/partidas/resultados-do-dia";
const TIME_CAMPEAO_ROUTE = "/admin/partidas/time-campeao-do-dia";
const MIN_TEAMS = 2;
const MAX_TEAMS = 10;

type SessionMode = "home" | "live" | "retro";
type RetroMode = "full" | "score" | "csv";

type MatchDraft = {
  id: string;
  teamAId: string;
  teamBId: string;
  playersA: string[];
  playersB: string[];
  scoreA: string;
  scoreB: string;
  date: string;
  time: string;
};

type LiveRules = {
  twoGoalsWin: boolean;
  timedMatch: boolean;
  winnerStays: boolean;
  goalieRequired: boolean;
};

type PlayerOption = {
  id: string;
  label: string;
  name: string;
  isBot: boolean;
  position: string;
  positionLabel: string;
  searchLabel: string;
};

type MatchCard = {
  match: PublicMatch;
  date: Date | null;
  scoreA: number;
  scoreB: number;
  hasResult: boolean;
};

type StandingsRow = {
  teamId: string;
  name: string;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
};

function createDraftId() {
  return `draft-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

function getBrasiliaTimeValue(date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(date);
    const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
    const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
    return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  } catch {
    const local = new Date();
    const hour = String(local.getHours()).padStart(2, "0");
    const minute = String(local.getMinutes()).padStart(2, "0");
    return `${hour}:${minute}`;
  }
}

export default function PartidaClassicaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-fundo text-white px-4 pt-[64px] md:pt-[80px] pb-24 md:pb-10">
          <div className="mx-auto max-w-6xl rounded-2xl border border-neutral-800 bg-[#151515] p-6 text-sm text-neutral-300">
            Carregando sessao de partidas classicas...
          </div>
        </div>
      }
    >
      <PartidaClassicaClient />
    </Suspense>
  );
}

function buildIsoDate(dateValue: string, timeValue: string) {
  if (!dateValue) return null;
  const time = timeValue || "00:00";
  const iso = `${dateValue}T${time}:00`;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function normalizeKey(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function normalizePosition(value?: string | null) {
  if (!value) return "";
  const cleaned = normalizeKey(value);
  if (cleaned.startsWith("gol") || cleaned.startsWith("gk") || cleaned.startsWith("gl")) {
    return "goleiro";
  }
  if (cleaned.startsWith("goal")) return "goleiro";
  if (cleaned.startsWith("zag")) return "zagueiro";
  if (cleaned.startsWith("mei")) return "meia";
  if (cleaned.startsWith("ata")) return "atacante";
  return cleaned;
}

function resolvePositionLabel(value?: string | null) {
  const normalized = normalizePosition(value);
  if (!normalized) return "";
  if (normalized === "goleiro") return "Goleiro";
  if (normalized === "zagueiro") return "Zagueiro";
  if (normalized === "meia") return "Meia";
  if (normalized === "atacante") return "Atacante";
  return normalized
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function isGoalie(player: Jogador) {
  const position = normalizePosition(player.posicao || player.position || "");
  return position === "goleiro";
}

function getPlayerLabel(player: Jogador) {
  const apelido = player.apelido || player.nickname;
  const name = player.nome || player.name || "Atleta";
  const botTag = player.isBot ? " - BOT" : "";
  if (apelido) return `${name} (${apelido})${botTag}`;
  return `${name}${botTag}`;
}

function parseMatchDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function resolvePresenceTeamId(
  presence: any,
  teamA: any,
  teamB: any,
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

function resolveMatchScore(match: PublicMatch) {
  const teamAId = match.teamA.id ?? "team-a";
  const teamBId = match.teamB.id ?? "team-b";
  const goalsA = countPresenceGoals(match, teamAId, teamAId, teamBId);
  const goalsB = countPresenceGoals(match, teamBId, teamAId, teamBId);
  const scoreA = match.scoreA ?? goalsA;
  const scoreB = match.scoreB ?? goalsB;
  const hasResult = match.scoreA !== null && match.scoreB !== null ? true : goalsA + goalsB > 0;
  return { scoreA, scoreB, hasResult };
}

function parseScore(value: string) {
  if (value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function pickTopByMetric(list: RankingAtleta[], metric: "pontos" | "gols" | "assistencias") {
  if (!list.length) return undefined;
  return [...list].sort((a, b) => (b[metric] ?? 0) - (a[metric] ?? 0))[0];
}

function pickTopByPosition(list: RankingAtleta[], positionKey: string) {
  const filtered = list.filter((entry) => {
    const pos = normalizePosition(entry.posicao ?? entry.position ?? "");
    return pos === positionKey;
  });
  return pickTopByMetric(filtered, "pontos");
}

function pickTopTeam(list: TeamRankingEntry[]) {
  if (!list.length) return undefined;
  return [...list].sort((a, b) => b.pontos - a.pontos)[0];
}

function PartidaClassicaClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryDate = searchParams?.get("data") || "";
  const defaultDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const { me } = useMe();
  const tenantId = me?.tenant?.tenantId ?? "";
  const tenantSlug = me?.tenant?.tenantSlug ?? "";

  const { times, isLoading: timesLoading } = useTimes(tenantSlug || undefined);
  const { jogadores, isLoading: jogadoresLoading } = useJogadores(tenantId, { includeBots: true });

  const [mode, setMode] = useState<SessionMode>("home");

  const [liveDate, setLiveDate] = useState(defaultDate);
  const [liveTime, setLiveTime] = useState("");
  const [liveLocation, setLiveLocation] = useState("");
  const [liveTeamCount, setLiveTeamCount] = useState(4);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [teamRosters, setTeamRosters] = useState<Record<string, string[]>>({});
  const [teamSearchMap, setTeamSearchMap] = useState<Record<string, string>>({});
  const [liveRules, setLiveRules] = useState<LiveRules>({
    twoGoalsWin: false,
    timedMatch: false,
    winnerStays: false,
    goalieRequired: false,
  });
  const [liveActive, setLiveActive] = useState(false);
  const [liveMatchIds, setLiveMatchIds] = useState<string[]>([]);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveNotice, setLiveNotice] = useState<string | null>(null);
  const [liveMatchError, setLiveMatchError] = useState<string | null>(null);
  const [creatingMatch, setCreatingMatch] = useState(false);
  const [matchTeamA, setMatchTeamA] = useState("");
  const [matchTeamB, setMatchTeamB] = useState("");
  const [matchTime, setMatchTime] = useState("");
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [nextTeamA, setNextTeamA] = useState("");
  const [nextTeamB, setNextTeamB] = useState("");
  const [nextTime, setNextTime] = useState("");
  const [nextTimeAuto, setNextTimeAuto] = useState(false);
  const [hasLiveDraft, setHasLiveDraft] = useState(false);
  const [liveDraftLoaded, setLiveDraftLoaded] = useState(false);

  const [retroYear, setRetroYear] = useState(currentYear);
  const [retroDate, setRetroDate] = useState("");
  const [retroTime, setRetroTime] = useState("");
  const [retroLocation, setRetroLocation] = useState("");
  const [retroMode, setRetroMode] = useState<RetroMode>("full");
  const [retroMatches, setRetroMatches] = useState<MatchDraft[]>([]);
  const [retroSearchMap, setRetroSearchMap] = useState<Record<string, string>>({});
  const [retroSaving, setRetroSaving] = useState(false);
  const [retroError, setRetroError] = useState<string | null>(null);
  const [retroSuccess, setRetroSuccess] = useState(false);
  const [hasRetroDraft, setHasRetroDraft] = useState(false);
  const [retroDraftLoaded, setRetroDraftLoaded] = useState(false);
  const [showFinalizeRetroModal, setShowFinalizeRetroModal] = useState(false);
  const [retroFinalizeError, setRetroFinalizeError] = useState<string | null>(null);
  const [retroFinalizeLoading, setRetroFinalizeLoading] = useState(false);
  const [retroFinalizeMessage, setRetroFinalizeMessage] = useState<string | null>(null);

  const liveStorageKey = useMemo(() => {
    if (!tenantId && !tenantSlug) return "";
    return `fut7pro.classica.live.${tenantId || tenantSlug}`;
  }, [tenantId, tenantSlug]);

  const retroStorageKey = useMemo(() => {
    if (!tenantId && !tenantSlug) return "";
    return `fut7pro.classica.retro.${tenantId || tenantSlug}`;
  }, [tenantId, tenantSlug]);

  const playerOptions = useMemo<PlayerOption[]>(() => {
    return (jogadores || [])
      .map((player) => {
        const label = getPlayerLabel(player);
        const position = normalizePosition(player.posicao || player.position || "");
        const positionLabel = resolvePositionLabel(position);
        return {
          id: player.id,
          label,
          name: player.nome || player.name || "Atleta",
          isBot: Boolean(player.isBot),
          position,
          positionLabel,
          searchLabel: normalizeKey(`${label} ${positionLabel}`),
        };
      })
      .sort((a, b) => {
        if (a.isBot !== b.isBot) return a.isBot ? 1 : -1;
        return a.name.localeCompare(b.name, "pt-BR");
      });
  }, [jogadores]);

  const playerLabelById = useMemo(() => {
    const map = new Map<string, string>();
    playerOptions.forEach((player) => map.set(player.id, player.label));
    return map;
  }, [playerOptions]);

  const playerById = useMemo(() => {
    const map = new Map<string, Jogador>();
    (jogadores || []).forEach((player) => map.set(player.id, player));
    return map;
  }, [jogadores]);

  const teamsById = useMemo(() => {
    const map = new Map<string, Time>();
    times.forEach((time) => map.set(time.id, time));
    return map;
  }, [times]);

  const selectedTeamsData = useMemo(
    () => selectedTeams.map((id) => teamsById.get(id)).filter(Boolean) as Time[],
    [selectedTeams, teamsById]
  );

  const assignedPlayers = useMemo(() => {
    const map = new Map<string, string>();
    const duplicates = new Set<string>();
    selectedTeams.forEach((teamId) => {
      const roster = teamRosters[teamId] || [];
      roster.forEach((playerId) => {
        const existing = map.get(playerId);
        if (existing && existing !== teamId) {
          duplicates.add(playerId);
        } else {
          map.set(playerId, teamId);
        }
      });
    });
    return { map, duplicates };
  }, [selectedTeams, teamRosters]);

  const liveRosterIssues = useMemo(() => {
    const issues: string[] = [];
    if (assignedPlayers.duplicates.size > 0) {
      issues.push("Ha atletas repetidos em mais de um time.");
    }
    if (liveRules.goalieRequired) {
      selectedTeams.forEach((teamId) => {
        const roster = teamRosters[teamId] || [];
        const hasGoalie = roster.some((playerId) => {
          const player = playerById.get(playerId);
          return player ? isGoalie(player) : false;
        });
        if (!hasGoalie) {
          const teamName = teamsById.get(teamId)?.nome || "Time";
          issues.push(`Goleiro obrigatorio: selecione um goleiro em ${teamName}.`);
        }
      });
    }
    return issues;
  }, [
    assignedPlayers.duplicates,
    liveRules.goalieRequired,
    playerById,
    selectedTeams,
    teamRosters,
    teamsById,
  ]);

  const liveResultsUrl = liveDate ? `${RESULTS_ROUTE}?data=${liveDate}` : RESULTS_ROUTE;
  const retroResultsUrl = retroDate ? `${RESULTS_ROUTE}?data=${retroDate}` : RESULTS_ROUTE;

  const {
    matches: adminMatches,
    isLoading: matchesLoading,
    isError: matchesError,
    error: matchesErrorObj,
    mutate: mutateMatches,
  } = useAdminMatches({ enabled: mode === "live" && liveActive });

  const sessionMatches = useMemo(() => {
    if (!liveMatchIds.length) return [] as PublicMatch[];
    const matchMap = new Map(adminMatches.map((match) => [match.id, match]));
    return liveMatchIds.map((matchId) => matchMap.get(matchId)).filter(Boolean) as PublicMatch[];
  }, [adminMatches, liveMatchIds]);

  const sessionCards = useMemo(() => {
    if (!sessionMatches.length) return [] as MatchCard[];
    return sessionMatches
      .map((match) => {
        const date = parseMatchDate(match.date);
        const { scoreA, scoreB, hasResult } = resolveMatchScore(match);
        return { match, date, scoreA, scoreB, hasResult } as MatchCard;
      })
      .filter(Boolean) as MatchCard[];
  }, [sessionMatches]);

  const pendingMatches = useMemo(
    () => sessionCards.filter((item) => !item.hasResult),
    [sessionCards]
  );

  const liveStandings = useMemo<StandingsRow[]>(() => {
    const map = new Map<string, StandingsRow>();

    const ensureTeam = (teamId: string, name: string) => {
      if (!teamId) return;
      if (!map.has(teamId)) {
        map.set(teamId, {
          teamId,
          name,
          points: 0,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDiff: 0,
        });
      }
    };

    selectedTeamsData.forEach((team) => ensureTeam(team.id, team.nome));

    sessionCards.forEach((item, index) => {
      const teamAId = item.match.teamA.id ?? `team-a-${index}`;
      const teamBId = item.match.teamB.id ?? `team-b-${index}`;
      ensureTeam(teamAId, item.match.teamA.name);
      ensureTeam(teamBId, item.match.teamB.name);
      if (!item.hasResult) return;

      const rowA = map.get(teamAId);
      const rowB = map.get(teamBId);
      if (!rowA || !rowB) return;

      const scoreA = Number(item.scoreA ?? 0);
      const scoreB = Number(item.scoreB ?? 0);

      rowA.played += 1;
      rowB.played += 1;
      rowA.goalsFor += scoreA;
      rowA.goalsAgainst += scoreB;
      rowB.goalsFor += scoreB;
      rowB.goalsAgainst += scoreA;

      if (scoreA > scoreB) {
        rowA.wins += 1;
        rowB.losses += 1;
        rowA.points += 3;
      } else if (scoreB > scoreA) {
        rowB.wins += 1;
        rowA.losses += 1;
        rowB.points += 3;
      } else {
        rowA.draws += 1;
        rowB.draws += 1;
        rowA.points += 1;
        rowB.points += 1;
      }
    });

    const rows = Array.from(map.values()).map((row) => ({
      ...row,
      goalDiff: row.goalsFor - row.goalsAgainst,
    }));

    rows.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.name.localeCompare(b.name, "pt-BR");
    });

    return rows;
  }, [selectedTeamsData, sessionCards]);

  const latestMatchInfo = useMemo(() => {
    if (!sessionCards.length) return null;
    const latest = sessionCards[sessionCards.length - 1];
    const teamAId = latest.match.teamA.id ?? "";
    const teamBId = latest.match.teamB.id ?? "";
    let winnerId = "";
    let loserId = "";
    if (latest.scoreA > latest.scoreB) {
      winnerId = teamAId;
      loserId = teamBId;
    } else if (latest.scoreB > latest.scoreA) {
      winnerId = teamBId;
      loserId = teamAId;
    }
    return { latest, teamAId, teamBId, winnerId, loserId };
  }, [sessionCards]);

  const previewSlug = mode === "retro" ? tenantSlug : "";
  const rankingAno = usePublicPlayerRankings({
    slug: previewSlug,
    type: "geral",
    period: "year",
    year: retroYear,
  });
  const rankingGols = usePublicPlayerRankings({
    slug: previewSlug,
    type: "artilheiros",
    period: "year",
    year: retroYear,
  });
  const rankingAssist = usePublicPlayerRankings({
    slug: previewSlug,
    type: "assistencias",
    period: "year",
    year: retroYear,
  });
  const rankingTimes = usePublicTeamRankings({
    slug: previewSlug,
    period: "year",
    year: retroYear,
  });

  const previewData = useMemo(() => {
    if (!previewSlug) return null;
    const topPoints = pickTopByMetric(rankingAno.rankings, "pontos");
    const topGols = pickTopByMetric(rankingGols.rankings, "gols");
    const topAssist = pickTopByMetric(rankingAssist.rankings, "assistencias");
    const topTeam = pickTopTeam(rankingTimes.teams);
    const topGoleiro = pickTopByPosition(rankingAno.rankings, "goleiro");
    const topZagueiro = pickTopByPosition(rankingAno.rankings, "zagueiro");
    const topMeia = pickTopByPosition(rankingAno.rankings, "meia");
    const topAtacante = pickTopByPosition(rankingAno.rankings, "atacante");

    const impactedPlayers = new Set<string>();
    [topPoints, topGols, topAssist, topGoleiro, topZagueiro, topMeia, topAtacante].forEach(
      (entry) => {
        if (entry?.id) impactedPlayers.add(entry.id);
      }
    );

    return {
      topPoints,
      topGols,
      topAssist,
      topTeam,
      topGoleiro,
      topZagueiro,
      topMeia,
      topAtacante,
      impactedCount: impactedPlayers.size,
    };
  }, [
    previewSlug,
    rankingAno.rankings,
    rankingGols.rankings,
    rankingAssist.rankings,
    rankingTimes.teams,
  ]);

  const previewLoading =
    rankingAno.isLoading ||
    rankingGols.isLoading ||
    rankingAssist.isLoading ||
    rankingTimes.isLoading;
  const previewError =
    rankingAno.isError || rankingGols.isError || rankingAssist.isError || rankingTimes.isError;

  useEffect(() => {
    if (!liveStorageKey || typeof window === "undefined") return;
    const raw = window.localStorage.getItem(liveStorageKey);
    if (!raw) {
      setHasLiveDraft(false);
      setLiveDraftLoaded(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as {
        date?: string;
        time?: string;
        location?: string;
        teamCount?: number;
        selectedTeams?: string[];
        teamRosters?: Record<string, string[]>;
        rules?: LiveRules;
        isActive?: boolean;
        matchIds?: string[];
      };
      if (parsed?.date) setLiveDate(parsed.date);
      if (parsed?.time) setLiveTime(parsed.time);
      if (parsed?.location) setLiveLocation(parsed.location);
      if (typeof parsed?.teamCount === "number") {
        const nextCount = Math.min(MAX_TEAMS, Math.max(MIN_TEAMS, parsed.teamCount));
        setLiveTeamCount(nextCount);
      }
      if (Array.isArray(parsed?.selectedTeams)) setSelectedTeams(parsed.selectedTeams);
      if (parsed?.teamRosters && typeof parsed.teamRosters === "object") {
        setTeamRosters(parsed.teamRosters);
      }
      if (parsed?.rules) setLiveRules(parsed.rules);
      if (typeof parsed?.isActive === "boolean") setLiveActive(parsed.isActive);
      if (Array.isArray(parsed?.matchIds)) setLiveMatchIds(parsed.matchIds);
      setHasLiveDraft(true);
    } catch {
      setHasLiveDraft(false);
    } finally {
      setLiveDraftLoaded(true);
    }
  }, [liveStorageKey]);

  useEffect(() => {
    if (!retroStorageKey || typeof window === "undefined") return;
    const raw = window.localStorage.getItem(retroStorageKey);
    if (!raw) {
      setHasRetroDraft(false);
      setRetroDraftLoaded(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as {
        date?: string;
        time?: string;
        location?: string;
        year?: number;
        mode?: RetroMode;
        matches?: MatchDraft[];
      };
      if (parsed?.date) setRetroDate(parsed.date);
      if (parsed?.time) setRetroTime(parsed.time);
      if (parsed?.location) setRetroLocation(parsed.location);
      if (typeof parsed?.year === "number") setRetroYear(parsed.year);
      if (parsed?.mode) setRetroMode(parsed.mode);
      if (Array.isArray(parsed?.matches)) setRetroMatches(parsed.matches);
      setHasRetroDraft(true);
    } catch {
      setHasRetroDraft(false);
    } finally {
      setRetroDraftLoaded(true);
    }
  }, [retroStorageKey]);

  useEffect(() => {
    if (!liveStorageKey || !liveDraftLoaded || typeof window === "undefined") return;
    const hasContent =
      liveActive ||
      selectedTeams.length > 0 ||
      liveLocation ||
      liveTime ||
      liveDate !== defaultDate ||
      liveMatchIds.length > 0;
    if (!hasContent) {
      window.localStorage.removeItem(liveStorageKey);
      setHasLiveDraft(false);
      return;
    }
    const payload = {
      date: liveDate,
      time: liveTime,
      location: liveLocation,
      teamCount: liveTeamCount,
      selectedTeams,
      teamRosters,
      rules: liveRules,
      isActive: liveActive,
      matchIds: liveMatchIds,
    };
    window.localStorage.setItem(liveStorageKey, JSON.stringify(payload));
    setHasLiveDraft(true);
  }, [
    defaultDate,
    liveActive,
    liveDate,
    liveDraftLoaded,
    liveLocation,
    liveMatchIds,
    liveRules,
    liveStorageKey,
    liveTeamCount,
    liveTime,
    selectedTeams,
    teamRosters,
  ]);

  useEffect(() => {
    if (!retroStorageKey || !retroDraftLoaded || typeof window === "undefined") return;
    const hasContent = retroMatches.length > 0 || retroDate || retroTime || retroLocation;
    if (!hasContent) {
      window.localStorage.removeItem(retroStorageKey);
      setHasRetroDraft(false);
      return;
    }
    const payload = {
      date: retroDate,
      time: retroTime,
      location: retroLocation,
      year: retroYear,
      mode: retroMode,
      matches: retroMatches,
    };
    window.localStorage.setItem(retroStorageKey, JSON.stringify(payload));
    setHasRetroDraft(true);
  }, [
    retroDate,
    retroDraftLoaded,
    retroLocation,
    retroMatches,
    retroMode,
    retroStorageKey,
    retroTime,
    retroYear,
  ]);

  useEffect(() => {
    if (!liveRules.winnerStays || !latestMatchInfo) return;
    if (nextTeamA || nextTeamB) return;
    if (!latestMatchInfo.winnerId) return;
    const benchTeams = selectedTeams.filter(
      (teamId) => teamId !== latestMatchInfo.teamAId && teamId !== latestMatchInfo.teamBId
    );
    const nextOpponent = benchTeams[0] || latestMatchInfo.loserId || "";
    setNextTeamA(latestMatchInfo.winnerId);
    setNextTeamB(nextOpponent);
  }, [latestMatchInfo, liveRules.winnerStays, nextTeamA, nextTeamB, selectedTeams]);

  const updateQueryDate = useCallback(
    (nextDate?: string) => {
      const params = new URLSearchParams(searchParams?.toString());
      if (nextDate) {
        params.set("data", nextDate);
      } else {
        params.delete("data");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    if (mode !== "live" || !liveActive || !liveDate) return;
    if (queryDate !== liveDate) updateQueryDate(liveDate);
  }, [liveActive, liveDate, mode, queryDate, updateQueryDate]);

  useEffect(() => {
    if (mode !== "live" && queryDate) updateQueryDate(undefined);
  }, [mode, queryDate, updateQueryDate]);

  useEffect(() => {
    if (mode !== "live") return;
    if (!queryDate) return;
    if (liveDate !== queryDate) setLiveDate(queryDate);
  }, [liveDate, mode, queryDate]);

  const toggleTeamSelection = (teamId: string) => {
    setSelectedTeams((prev) => {
      if (prev.includes(teamId)) {
        return prev.filter((id) => id !== teamId);
      }
      if (prev.length >= liveTeamCount) return prev;
      return [...prev, teamId];
    });
    setTeamRosters((prev) => {
      if (prev[teamId]) {
        const updated = { ...prev };
        delete updated[teamId];
        return updated;
      }
      return { ...prev, [teamId]: [] };
    });
    setTeamSearchMap((prev) => {
      const updated = { ...prev };
      delete updated[teamId];
      return updated;
    });
  };

  const toggleTeamPlayer = (teamId: string, playerId: string) => {
    setTeamRosters((prev) => {
      const current = prev[teamId] || [];
      const exists = current.includes(playerId);
      const nextList = exists ? current.filter((id) => id !== playerId) : [...current, playerId];
      return { ...prev, [teamId]: nextList };
    });
  };

  const validateLiveSetup = () => {
    if (!liveDate) return "Informe a data base da sessao.";
    if (selectedTeams.length < MIN_TEAMS) {
      return `Selecione pelo menos ${MIN_TEAMS} times.`;
    }
    if (selectedTeams.length > liveTeamCount) {
      return `Limite atual: ${liveTeamCount} times ativos. Ajuste a selecao ou aumente o limite.`;
    }
    if (!tenantId) return "Nao foi possivel identificar o racha logado.";
    for (const teamId of selectedTeams) {
      const roster = teamRosters[teamId] || [];
      if (!roster.length) {
        const teamName = teamsById.get(teamId)?.nome || "Time";
        return `Selecione atletas para ${teamName}.`;
      }
    }
    if (assignedPlayers.duplicates.size > 0) {
      return "Ha atletas repetidos em mais de um time. Ajuste a distribuicao.";
    }
    if (liveRules.goalieRequired) {
      for (const teamId of selectedTeams) {
        const roster = teamRosters[teamId] || [];
        const hasGoalie = roster.some((playerId) => {
          const player = playerById.get(playerId);
          return player ? isGoalie(player) : false;
        });
        if (!hasGoalie) {
          const teamName = teamsById.get(teamId)?.nome || "Time";
          return `Goleiro obrigatorio: selecione um goleiro em ${teamName}.`;
        }
      }
    }
    return null;
  };

  const handleSaveLiveDraft = () => {
    setLiveNotice("Rascunho salvo. Voce pode retomar esta sessao quando quiser.");
    setTimeout(() => setLiveNotice(null), 2500);
  };

  const handleDiscardLiveDraft = () => {
    setLiveDate(defaultDate);
    setLiveTime("");
    setLiveLocation("");
    setLiveTeamCount(4);
    setSelectedTeams([]);
    setTeamRosters({});
    setTeamSearchMap({});
    setLiveRules({
      twoGoalsWin: false,
      timedMatch: false,
      winnerStays: false,
      goalieRequired: false,
    });
    setLiveActive(false);
    setLiveMatchIds([]);
    setMatchTeamA("");
    setMatchTeamB("");
    setMatchTime("");
    setNextTeamA("");
    setNextTeamB("");
    setNextTime("");
    setLiveError(null);
    setLiveMatchError(null);
    if (liveStorageKey && typeof window !== "undefined") {
      window.localStorage.removeItem(liveStorageKey);
    }
    setHasLiveDraft(false);
  };

  const handleStartLiveSession = () => {
    const error = validateLiveSetup();
    if (error) {
      setLiveError(error);
      return;
    }
    setLiveError(null);
    setLiveActive(true);
    updateQueryDate(liveDate);
  };

  const createMatch = async ({
    teamAId,
    teamBId,
    dateValue,
    timeValue,
    locationValue,
    rosterA,
    rosterB,
    scoreA,
    scoreB,
  }: {
    teamAId: string;
    teamBId: string;
    dateValue: string;
    timeValue: string;
    locationValue?: string;
    rosterA: string[];
    rosterB: string[];
    scoreA?: number | null;
    scoreB?: number | null;
  }) => {
    const isoDate = buildIsoDate(dateValue, timeValue);
    if (!isoDate) {
      throw new Error("Data ou horario invalido.");
    }

    const payload: Record<string, unknown> = {
      date: isoDate,
      teamAId,
      teamBId,
    };
    if (locationValue && locationValue.trim()) payload.location = locationValue.trim();

    const response = await fetch("/api/partidas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || "Falha ao criar partida classica");
    }

    const createdMatch = (await response.json().catch(() => null)) as { id?: string } | null;
    if (!createdMatch?.id) {
      throw new Error("Resposta invalida ao criar partida classica");
    }

    const presences = [
      ...rosterA.map((athleteId) => ({
        athleteId,
        teamId: teamAId,
        goals: 0,
        assists: 0,
        status: "TITULAR",
      })),
      ...rosterB.map((athleteId) => ({
        athleteId,
        teamId: teamBId,
        goals: 0,
        assists: 0,
        status: "TITULAR",
      })),
    ];

    const resultPayload: Record<string, unknown> = {};
    if (presences.length) resultPayload.presences = presences;
    if (scoreA !== undefined && scoreA !== null) resultPayload.scoreA = scoreA;
    if (scoreB !== undefined && scoreB !== null) resultPayload.scoreB = scoreB;

    if (Object.keys(resultPayload).length) {
      const updateResponse = await fetch(`/api/partidas/${createdMatch.id}/resultado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultPayload),
      });

      if (!updateResponse.ok) {
        const body = await updateResponse.text();
        throw new Error(body || "Falha ao registrar presencas da partida");
      }
    }

    return createdMatch.id;
  };

  const handleCreateLiveMatch = async (opts: {
    teamAId: string;
    teamBId: string;
    timeValue: string;
  }) => {
    if (!liveActive) {
      setLiveMatchError("Inicie a sessao antes de cadastrar partidas.");
      return;
    }
    if (!opts.teamAId || !opts.teamBId) {
      setLiveMatchError("Selecione os times da partida.");
      return;
    }
    if (opts.teamAId === opts.teamBId) {
      setLiveMatchError("Os times nao podem ser iguais.");
      return;
    }
    const rosterA = teamRosters[opts.teamAId] || [];
    const rosterB = teamRosters[opts.teamBId] || [];
    if (!rosterA.length || !rosterB.length) {
      setLiveMatchError("Complete o elenco dos dois times antes de cadastrar a partida.");
      return;
    }

    setCreatingMatch(true);
    setLiveMatchError(null);
    try {
      const createdId = await createMatch({
        teamAId: opts.teamAId,
        teamBId: opts.teamBId,
        dateValue: liveDate,
        timeValue: opts.timeValue || liveTime,
        locationValue: liveLocation,
        rosterA,
        rosterB,
      });
      setLiveMatchIds((prev) => (prev.includes(createdId) ? prev : [...prev, createdId]));
      await mutateMatches();
      setMatchTeamA("");
      setMatchTeamB("");
      setMatchTime("");
      setShowMatchForm(false);
      setNextTeamA("");
      setNextTeamB("");
      setNextTime("");
    } catch (err) {
      setLiveMatchError(err instanceof Error ? err.message : "Falha ao salvar partida.");
    } finally {
      setCreatingMatch(false);
    }
  };

  const handleFinalizeSession = () => {
    setFinalizeError(null);
    if (!sessionCards.length) {
      setFinalizeError("Nenhuma partida cadastrada na sessao.");
      return;
    }
    if (pendingMatches.length) {
      setFinalizeError(
        `Ainda existem ${pendingMatches.length} partidas sem resultado. Finalize todas antes de concluir.`
      );
      return;
    }
    setShowFinalizeModal(true);
  };

  const confirmFinalizeSession = () => {
    setShowFinalizeModal(false);
    handleDiscardLiveDraft();
    router.push(TIME_CAMPEAO_ROUTE);
  };

  const addRetroMatch = () => {
    setRetroMatches((prev) => [
      ...prev,
      {
        id: createDraftId(),
        teamAId: "",
        teamBId: "",
        playersA: [],
        playersB: [],
        scoreA: "",
        scoreB: "",
        date: retroDate,
        time: retroTime,
      },
    ]);
  };

  const removeRetroMatch = (id: string) => {
    setRetroMatches((prev) => prev.filter((match) => match.id !== id));
    setRetroSearchMap((prev) => {
      const updated = { ...prev };
      delete updated[`${id}-A`];
      delete updated[`${id}-B`];
      return updated;
    });
  };

  const updateRetroMatch = (id: string, updates: Partial<MatchDraft>) => {
    setRetroMatches((prev) =>
      prev.map((match) => (match.id === id ? { ...match, ...updates } : match))
    );
  };

  const toggleRetroPlayer = (matchId: string, side: "A" | "B", playerId: string) => {
    setRetroMatches((prev) =>
      prev.map((match) => {
        if (match.id !== matchId) return match;
        const key = side === "A" ? "playersA" : "playersB";
        const list = match[key];
        const exists = list.includes(playerId);
        const nextList = exists ? list.filter((item) => item !== playerId) : [...list, playerId];
        return { ...match, [key]: nextList } as MatchDraft;
      })
    );
  };

  const updateRetroTeam = (matchId: string, side: "A" | "B", teamId: string) => {
    if (side === "A") {
      updateRetroMatch(matchId, { teamAId: teamId, playersA: [] });
    } else {
      updateRetroMatch(matchId, { teamBId: teamId, playersB: [] });
    }
  };

  const updateRetroSearch = (matchId: string, side: "A" | "B", value: string) => {
    setRetroSearchMap((prev) => ({ ...prev, [`${matchId}-${side}`]: value }));
  };

  const validateRetroMatches = () => {
    if (!retroMatches.length) return "Adicione pelo menos uma partida retroativa.";
    if (!tenantId) return "Nao foi possivel identificar o racha logado.";

    for (let i = 0; i < retroMatches.length; i += 1) {
      const match = retroMatches[i];
      const matchDate = match.date || retroDate;
      if (!matchDate) return `Informe a data da partida ${i + 1}.`;
      if (!match.teamAId || !match.teamBId) {
        return `Selecione os times da partida ${i + 1}.`;
      }
      if (match.teamAId === match.teamBId) {
        return `Os times da partida ${i + 1} nao podem ser iguais.`;
      }
      if (retroMode === "full") {
        if (!match.playersA.length || !match.playersB.length) {
          return `Selecione os atletas das duas equipes na partida ${i + 1}.`;
        }
        const overlap = match.playersA.filter((id) => match.playersB.includes(id));
        if (overlap.length) {
          return `Ha atletas duplicados nas equipes da partida ${i + 1}.`;
        }
      }
      if (retroMode === "score") {
        const scoreA = parseScore(match.scoreA);
        const scoreB = parseScore(match.scoreB);
        if (scoreA === null || scoreB === null) {
          return `Informe o placar final da partida ${i + 1}.`;
        }
      }
    }
    return null;
  };

  const handleSaveRetroMatches = async () => {
    const validationError = validateRetroMatches();
    if (validationError) {
      setRetroError(validationError);
      return;
    }
    if (retroMode === "csv") {
      setRetroError("Importacao CSV ainda nao esta habilitada. Use outro modo por enquanto.");
      return;
    }

    setRetroSaving(true);
    setRetroError(null);
    try {
      for (const draft of retroMatches) {
        const dateValue = draft.date || retroDate;
        const timeValue = draft.time || retroTime;
        const scoreA = parseScore(draft.scoreA);
        const scoreB = parseScore(draft.scoreB);

        await createMatch({
          teamAId: draft.teamAId,
          teamBId: draft.teamBId,
          dateValue,
          timeValue,
          locationValue: retroLocation,
          rosterA: draft.playersA,
          rosterB: draft.playersB,
          scoreA,
          scoreB,
        });
      }

      setRetroSuccess(true);
      setRetroMatches([]);
      setRetroSearchMap({});
    } catch (err) {
      setRetroError(err instanceof Error ? err.message : "Falha ao salvar partidas retroativas.");
    } finally {
      setRetroSaving(false);
    }
  };

  const handleFinalizeRetroSeason = async () => {
    if (retroFinalizeLoading) return;
    setRetroFinalizeLoading(true);
    setRetroFinalizeError(null);
    setRetroFinalizeMessage(null);
    try {
      const response = await fetch("/api/campeoes/finalizar-temporada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: retroYear }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Erro ao finalizar temporada.");
      }
      setRetroFinalizeMessage("Campeoes calculados e premiacoes aplicadas com sucesso.");
    } catch (err) {
      setRetroFinalizeError(err instanceof Error ? err.message : "Erro ao finalizar temporada.");
    } finally {
      setRetroFinalizeLoading(false);
    }
  };

  const renderRoster = (match: MatchDraft, side: "A" | "B", team: Time | undefined) => {
    const selected = side === "A" ? match.playersA : match.playersB;
    const blocked = new Set(side === "A" ? match.playersB : match.playersA);
    const searchKey = `${match.id}-${side}`;
    const query = normalizeKey(retroSearchMap[searchKey] || "");
    const filteredPlayers = playerOptions.filter((player) =>
      query ? player.searchLabel.includes(query) : true
    );

    return (
      <div className="mt-3 rounded-xl border border-neutral-800 bg-[#151515] p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-neutral-300">Atletas do {team?.nome || `Time ${side}`}</p>
          <span className="text-[11px] text-neutral-400">{selected.length} selecionados</span>
        </div>
        <input
          value={retroSearchMap[searchKey] || ""}
          onChange={(e) => updateRetroSearch(match.id, side, e.target.value)}
          placeholder="Buscar atleta"
          className="mt-2 w-full rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-xs text-neutral-100"
        />
        <div className="mt-3 max-h-40 space-y-2 overflow-y-auto">
          {filteredPlayers.length === 0 ? (
            <p className="text-xs text-neutral-500">Nenhum atleta encontrado.</p>
          ) : (
            filteredPlayers.map((player) => {
              const checked = selected.includes(player.id);
              const disabled = blocked.has(player.id);
              return (
                <label key={player.id} className="flex items-center gap-2 text-sm text-neutral-200">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleRetroPlayer(match.id, side, player.id)}
                    disabled={disabled}
                  />
                  <span className={`flex-1 ${disabled ? "opacity-50" : ""}`}>{player.label}</span>
                  {player.positionLabel && (
                    <span
                      className={`text-[11px] text-neutral-400 ${disabled ? "opacity-50" : ""}`}
                    >
                      {player.positionLabel}
                    </span>
                  )}
                </label>
              );
            })
          )}
        </div>
        {selected.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selected.map((playerId) => (
              <span
                key={playerId}
                className="rounded-full border border-neutral-700 bg-neutral-800 px-3 py-1 text-[11px] text-neutral-200"
              >
                {playerLabelById.get(playerId) || "Atleta"}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderLiveTeamRoster = (team: Time) => {
    const selected = teamRosters[team.id] || [];
    const query = normalizeKey(teamSearchMap[team.id] || "");
    const filteredPlayers = playerOptions.filter((player) =>
      query ? player.searchLabel.includes(query) : true
    );
    return (
      <div className="mt-3 rounded-xl border border-neutral-800 bg-[#151515] p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-neutral-300">Elenco do dia</p>
          <span className="text-[11px] text-neutral-400">{selected.length} selecionados</span>
        </div>
        <input
          value={teamSearchMap[team.id] || ""}
          onChange={(e) => setTeamSearchMap((prev) => ({ ...prev, [team.id]: e.target.value }))}
          placeholder="Buscar atleta"
          className="mt-2 w-full rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-xs text-neutral-100"
        />
        <div className="mt-3 max-h-44 space-y-2 overflow-y-auto">
          {filteredPlayers.length === 0 ? (
            <p className="text-xs text-neutral-500">Nenhum atleta encontrado.</p>
          ) : (
            filteredPlayers.map((player) => {
              const checked = selected.includes(player.id);
              const assignedTeam = assignedPlayers.map.get(player.id);
              const disabled = assignedTeam !== undefined && assignedTeam !== team.id;
              return (
                <label key={player.id} className="flex items-center gap-2 text-sm text-neutral-200">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTeamPlayer(team.id, player.id)}
                    disabled={disabled}
                  />
                  <span className={`flex-1 ${disabled ? "opacity-50" : ""}`}>{player.label}</span>
                  {player.positionLabel && (
                    <span
                      className={`text-[11px] text-neutral-400 ${disabled ? "opacity-50" : ""}`}
                    >
                      {player.positionLabel}
                    </span>
                  )}
                </label>
              );
            })
          )}
        </div>
        {selected.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selected.map((playerId) => (
              <span
                key={playerId}
                className="rounded-full border border-neutral-700 bg-neutral-800 px-3 py-1 text-[11px] text-neutral-200"
              >
                {playerLabelById.get(playerId) || "Atleta"}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleBackToHome = () => {
    setMode("home");
    setLiveError(null);
    setRetroError(null);
  };

  const renderHome = () => (
    <>
      <div className="flex flex-col gap-3 mb-8">
        <h1 className="text-3xl font-bold text-yellow-400">Partidas Classicas</h1>
        <p className="text-sm text-neutral-300 max-w-3xl">
          Controle manual de rodadas, ideal para rachas com formato livre ou para lancar historicos
          retroativos. Selecione o tipo de sessao e acompanhe tudo em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <button
          type="button"
          onClick={() => setMode("live")}
          className="rounded-2xl border border-neutral-800 bg-[#151515] p-6 text-left transition hover:border-yellow-400/60"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-yellow-400/10 p-3 text-yellow-300">
                <FaBolt />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-yellow-300">
                  Partidas Classicas (Atual)
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Sessao ao vivo com rodadas dinamicas, quem ganha fica e resultados em tempo real.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-yellow-400 px-3 py-1 text-[11px] font-semibold text-black">
              Iniciar sessao
            </span>
          </div>
          <ul className="mt-4 space-y-1 text-xs text-neutral-300">
            <li>- Data do dia, horarios e elenco completo.</li>
            <li>- Cadastrar partida, proxima rodada e finalizar.</li>
            <li>- Resultados integrados ao painel em tempo real.</li>
          </ul>
          {hasLiveDraft && (
            <div className="mt-4 rounded-lg border border-green-400/40 bg-green-400/10 px-3 py-2 text-xs text-green-200">
              Rascunho encontrado. Clique para continuar a sessao.
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMode("retro")}
          className="rounded-2xl border border-neutral-800 bg-[#151515] p-6 text-left transition hover:border-yellow-400/60"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-yellow-400/10 p-3 text-yellow-300">
                <FaHistory />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-yellow-300">
                  Retroagir Resultados (Historico)
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Lance partidas antigas, ajuste rankings e finalize temporadas com seguranca.
                </p>
              </div>
            </div>
            <span className="rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-[11px] font-semibold text-yellow-200">
              Criar sessao
            </span>
          </div>
          <ul className="mt-4 space-y-1 text-xs text-neutral-300">
            <li>- Datas anteriores, placar completo ou somente resultado.</li>
            <li>- Preview de campeoes antes de aplicar premiacoes.</li>
            <li>- Historico auditavel e controlado.</li>
          </ul>
          {hasRetroDraft && (
            <div className="mt-4 rounded-lg border border-green-400/40 bg-green-400/10 px-3 py-2 text-xs text-green-200">
              Rascunho historico encontrado. Clique para continuar.
            </div>
          )}
        </button>
      </div>
    </>
  );

  const renderLive = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleBackToHome}
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800"
        >
          <FaArrowLeft /> Voltar
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">
            Sessao de Partidas Classicas
          </h1>
          <p className="text-xs text-neutral-400">
            Configure a sessao atual e registre confrontos em tempo real.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-800 bg-[#151515] p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-yellow-300">Cabecalho da sessao</h2>
            <p className="text-xs text-neutral-400">
              Campos editaveis enquanto a sessao nao for finalizada.
            </p>
          </div>
          {liveActive && (
            <span className="inline-flex items-center gap-2 rounded-full border border-green-400/60 bg-green-400/10 px-3 py-1 text-xs text-green-200">
              <FaCheckCircle /> Sessao ativa
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-neutral-400 flex items-center gap-2">
              <FaCalendarAlt /> Data base
            </label>
            <input
              type="date"
              value={liveDate}
              onChange={(e) => setLiveDate(e.target.value)}
              className="rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-neutral-400 flex items-center gap-2">
              <FaClock /> Horario inicial
            </label>
            <input
              type="time"
              value={liveTime}
              onChange={(e) => setLiveTime(e.target.value)}
              className="rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-neutral-400 flex items-center gap-2">
              <FaUsers /> Times ativos
            </label>
            <select
              value={liveTeamCount}
              onChange={(e) => setLiveTeamCount(Number(e.target.value))}
              className="rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
            >
              {Array.from(
                { length: MAX_TEAMS - MIN_TEAMS + 1 },
                (_, index) => MIN_TEAMS + index
              ).map((count) => (
                <option key={count} value={count}>
                  {count} times
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-neutral-400 flex items-center gap-2">
              <FaMapMarkerAlt /> Local
            </label>
            <input
              type="text"
              value={liveLocation}
              onChange={(e) => setLiveLocation(e.target.value)}
              placeholder="Ex: Arena principal"
              className="rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="text-sm font-semibold text-yellow-300">Times e elenco do dia</h3>
              <p className="text-xs text-neutral-400">
                Selecione ate {liveTeamCount} times e distribua os atletas.
              </p>
            </div>
            <span className="text-xs text-neutral-400">{selectedTeams.length} selecionados</span>
          </div>

          {timesLoading || jogadoresLoading ? (
            <div className="rounded-xl border border-neutral-800 bg-[#1a1a1a] p-4 text-sm text-neutral-300">
              Carregando times e atletas...
            </div>
          ) : times.length === 0 ? (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
              Nenhum time cadastrado. Cadastre os times antes de criar partidas classicas.
            </div>
          ) : jogadores.length === 0 ? (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
              Nenhum atleta cadastrado. Cadastre atletas antes de montar partidas classicas.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {times.map((time) => {
                const isSelected = selectedTeams.includes(time.id);
                const limitReached = selectedTeams.length >= liveTeamCount && !isSelected;
                return (
                  <label
                    key={time.id}
                    className={`rounded-xl border px-4 py-3 text-sm transition ${
                      isSelected
                        ? "border-yellow-400/70 bg-yellow-400/10 text-yellow-100"
                        : "border-neutral-800 bg-[#101010] text-neutral-200"
                    } ${limitReached ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleTeamSelection(time.id)}
                        disabled={limitReached}
                      />
                      <span className="font-semibold">{time.nome}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {selectedTeamsData.length > 0 && (
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {selectedTeamsData.map((team) => (
                <div
                  key={team.id}
                  className="rounded-2xl border border-neutral-800 bg-[#101010] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-neutral-400">Time selecionado</p>
                      <h4 className="text-sm font-semibold text-yellow-200">{team.nome}</h4>
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      {teamRosters[team.id]?.length || 0} atletas
                    </span>
                  </div>
                  {renderLiveTeamRoster(team)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-yellow-300 mb-3">Regras opcionais do dia</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-neutral-200">
            {[
              {
                key: "twoGoalsWin",
                label: "2 gols vence",
                helper: "Partida encerra ao marcar 2 gols.",
              },
              {
                key: "timedMatch",
                label: "Tempo cronometrado",
                helper: "Partidas seguem tempo definido.",
              },
              {
                key: "winnerStays",
                label: "Quem ganha fica",
                helper: "Vencedor permanece na quadra.",
              },
              {
                key: "goalieRequired",
                label: "Goleiro obrigatorio",
                helper: "Exige pelo menos 1 goleiro por time.",
              },
            ].map((rule) => (
              <label
                key={rule.key}
                className="flex items-start gap-2 rounded-xl border border-neutral-800 bg-[#101010] p-3"
              >
                <input
                  type="checkbox"
                  checked={liveRules[rule.key as keyof LiveRules]}
                  onChange={() =>
                    setLiveRules((prev) => ({
                      ...prev,
                      [rule.key]: !prev[rule.key as keyof LiveRules],
                    }))
                  }
                />
                <div>
                  <p className="font-semibold text-neutral-100">{rule.label}</p>
                  <p className="text-xs text-neutral-400">{rule.helper}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {liveRosterIssues.length > 0 && (
          <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4 text-xs text-yellow-200 space-y-1">
            {liveRosterIssues.map((issue) => (
              <p key={issue}>- {issue}</p>
            ))}
          </div>
        )}

        {liveError && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-200">
            {liveError}
          </div>
        )}

        {liveNotice && (
          <div className="rounded-xl border border-green-500/40 bg-green-500/10 p-4 text-xs text-green-200">
            {liveNotice}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSaveLiveDraft}
            className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            Salvar rascunho
          </button>
          <button
            type="button"
            onClick={handleDiscardLiveDraft}
            className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            Descartar rascunho
          </button>
          <button
            type="button"
            onClick={handleStartLiveSession}
            className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
          >
            {liveActive ? "Sessao em andamento" : "Iniciar sessao"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-800 bg-[#151515] p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-yellow-300">Tabela de classificacao</h2>
            <p className="text-xs text-neutral-400">
              Pontuacao em tempo real baseada nos resultados desta sessao (3 pontos vitoria, 1
              empate).
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowMatchForm((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
          >
            <FaPlus /> Cadastrar partida
          </button>
        </div>

        {showMatchForm && (
          <div className="rounded-2xl border border-neutral-800 bg-[#101010] p-4 space-y-4">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <FaUsers className="text-yellow-400" />
              Rodada {liveMatchIds.length + 1}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-neutral-400">Time A</label>
                <select
                  value={matchTeamA}
                  onChange={(e) => setMatchTeamA(e.target.value)}
                  className="rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
                >
                  <option value="">Selecione</option>
                  {selectedTeamsData.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-neutral-400">Time B</label>
                <select
                  value={matchTeamB}
                  onChange={(e) => setMatchTeamB(e.target.value)}
                  className="rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
                >
                  <option value="">Selecione</option>
                  {selectedTeamsData.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-neutral-400">Horario da rodada</label>
                <input
                  type="time"
                  value={matchTime}
                  onChange={(e) => setMatchTime(e.target.value)}
                  className="rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
                />
              </div>
            </div>

            {liveMatchError && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
                {liveMatchError}
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                handleCreateLiveMatch({
                  teamAId: matchTeamA,
                  teamBId: matchTeamB,
                  timeValue: matchTime,
                })
              }
              disabled={creatingMatch}
              className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60"
            >
              {creatingMatch ? "Salvando partida..." : "Salvar partida"}
            </button>
          </div>
        )}

        <div className="rounded-2xl border border-neutral-800 bg-[#101010]">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-neutral-200">
              <thead className="bg-[#0f0f0f] text-[11px] uppercase tracking-wide text-neutral-400">
                <tr>
                  <th className="px-4 py-3 text-left">Pos</th>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-3 py-3 text-right">Pts</th>
                  <th className="px-3 py-3 text-right">J</th>
                  <th className="px-3 py-3 text-right">V</th>
                  <th className="px-3 py-3 text-right">E</th>
                  <th className="px-3 py-3 text-right">D</th>
                  <th className="px-3 py-3 text-right">GP</th>
                  <th className="px-3 py-3 text-right">GC</th>
                  <th className="px-3 py-3 text-right">SG</th>
                </tr>
              </thead>
              <tbody>
                {liveStandings.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-6 text-center text-xs text-neutral-400">
                      Selecione os times e registre resultados para ver a tabela.
                    </td>
                  </tr>
                ) : (
                  liveStandings.map((row, index) => (
                    <tr
                      key={row.teamId}
                      className={`border-t border-neutral-800 ${
                        index === 0 ? "bg-green-500/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold text-neutral-300">{index + 1}</td>
                      <td className="px-4 py-3 font-semibold text-neutral-100">{row.name}</td>
                      <td className="px-3 py-3 text-right font-semibold text-yellow-300">
                        {row.points}
                      </td>
                      <td className="px-3 py-3 text-right">{row.played}</td>
                      <td className="px-3 py-3 text-right">{row.wins}</td>
                      <td className="px-3 py-3 text-right">{row.draws}</td>
                      <td className="px-3 py-3 text-right">{row.losses}</td>
                      <td className="px-3 py-3 text-right">{row.goalsFor}</td>
                      <td className="px-3 py-3 text-right">{row.goalsAgainst}</td>
                      <td className="px-3 py-3 text-right">{row.goalDiff}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {liveActive && sessionCards.length > 0 && (
          <div className="rounded-2xl border border-neutral-800 bg-[#101010] p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-yellow-300">Cadastrar proxima rodada</h3>
              <p className="text-xs text-neutral-400">
                Selecione manualmente o proximo confronto ou use a sugestao abaixo.
              </p>
            </div>
            {liveRules.winnerStays && latestMatchInfo && (
              <div className="rounded-lg border border-neutral-700 bg-[#151515] p-3 text-xs text-neutral-300 space-y-1">
                <div className="flex items-center gap-2 text-yellow-200">
                  <FaFlagCheckered /> Rotacao sugerida
                </div>
                {latestMatchInfo.winnerId ? (
                  <>
                    <p>
                      Time vencedor:{" "}
                      <span className="text-yellow-200">
                        {teamsById.get(latestMatchInfo.winnerId)?.nome || "Time vencedor"}
                      </span>{" "}
                      fica em campo.
                    </p>
                    <p>
                      Time derrotado:{" "}
                      <span className="text-neutral-200">
                        {teamsById.get(latestMatchInfo.loserId)?.nome || "Time derrotado"}
                      </span>{" "}
                      sai para a fila.
                    </p>
                  </>
                ) : (
                  <p>Empate na ultima partida. Selecione o proximo confronto manualmente.</p>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-neutral-400">Time A</label>
                <select
                  value={nextTeamA}
                  onChange={(e) => setNextTeamA(e.target.value)}
                  className="rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
                >
                  <option value="">Selecione</option>
                  {selectedTeamsData.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-neutral-400">Time B</label>
                <select
                  value={nextTeamB}
                  onChange={(e) => setNextTeamB(e.target.value)}
                  className="rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
                >
                  <option value="">Selecione</option>
                  {selectedTeamsData.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs text-neutral-400">Horario</label>
                  <label className="flex items-center gap-2 text-[11px] text-neutral-400">
                    <input
                      type="checkbox"
                      checked={nextTimeAuto}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setNextTimeAuto(checked);
                        if (checked) setNextTime("");
                      }}
                    />
                    Horario automatico
                  </label>
                </div>
                <input
                  type="time"
                  value={nextTime}
                  onChange={(e) => setNextTime(e.target.value)}
                  disabled={nextTimeAuto}
                  className="rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
                />
                {nextTimeAuto && (
                  <span className="text-[11px] text-neutral-500">
                    Horario definido automaticamente no momento do cadastro (Brasilia).
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                handleCreateLiveMatch({
                  teamAId: nextTeamA,
                  teamBId: nextTeamB,
                  timeValue: nextTimeAuto ? getBrasiliaTimeValue() : nextTime,
                })
              }
              disabled={creatingMatch}
              className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300 disabled:opacity-60"
            >
              Cadastrar proxima rodada
            </button>
          </div>
        )}
      </section>

      {liveActive && (
        <section className="rounded-2xl border border-neutral-800 bg-[#151515] p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-yellow-300">Resultados em tempo real</h2>
              <p className="text-xs text-neutral-400">
                Os cards abaixo sao identicos ao painel de Resultados do Dia.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push(liveResultsUrl)}
              className="rounded-xl border border-neutral-700 px-4 py-2 text-xs text-neutral-200 hover:bg-neutral-800"
            >
              Abrir Resultados do Dia
            </button>
          </div>

          {matchesError && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-200">
              Falha ao carregar partidas.{" "}
              {matchesErrorObj instanceof Error ? matchesErrorObj.message : ""}
            </div>
          )}

          {matchesLoading ? (
            <div className="rounded-xl border border-neutral-800 bg-[#101010] p-4 text-sm text-neutral-300">
              Carregando resultados...
            </div>
          ) : (
            <ResultadosDoDiaAdmin
              showHeader={false}
              showFilters={false}
              matchIds={liveMatchIds}
              allowDelete
              onDeleteMatch={(matchId) =>
                setLiveMatchIds((prev) => prev.filter((id) => id !== matchId))
              }
            />
          )}
        </section>
      )}

      {liveActive && (
        <section className="rounded-2xl border border-neutral-800 bg-[#151515] p-6 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-yellow-300">Finalizacao oficial</h2>
              <p className="text-xs text-neutral-400">
                Garante que todas as rodadas foram registradas antes de publicar os destaques do
                dia.
              </p>
            </div>
            <button
              type="button"
              onClick={handleFinalizeSession}
              className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
            >
              Finalizar tudo e Registrar Resultados
            </button>
          </div>
          {finalizeError && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
              {finalizeError}
            </div>
          )}
        </section>
      )}
    </div>
  );

  const renderRetro = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleBackToHome}
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800"
        >
          <FaArrowLeft /> Voltar
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">Retroagir Resultados</h1>
          <p className="text-xs text-neutral-400">
            Lance partidas antigas sem impactar o fluxo atual e finalize temporadas com preview.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-800 bg-[#151515] p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-yellow-300">Sessao historica</h2>
          <p className="text-xs text-neutral-400">
            Defina o ano, data base e o modo de lancamento desejado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-neutral-400">Ano</label>
            <select
              value={retroYear}
              onChange={(e) => setRetroYear(Number(e.target.value))}
              className="rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
            >
              {Array.from({ length: 6 }, (_, index) => currentYear - 4 + index).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-neutral-400 flex items-center gap-2">
              <FaCalendarAlt /> Data base
            </label>
            <input
              type="date"
              value={retroDate}
              onChange={(e) => setRetroDate(e.target.value)}
              className="rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-neutral-400 flex items-center gap-2">
              <FaClock /> Horario
            </label>
            <input
              type="time"
              value={retroTime}
              onChange={(e) => setRetroTime(e.target.value)}
              className="rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-neutral-400 flex items-center gap-2">
              <FaMapMarkerAlt /> Local
            </label>
            <input
              type="text"
              value={retroLocation}
              onChange={(e) => setRetroLocation(e.target.value)}
              placeholder="Ex: Quadra antiga"
              className="rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-neutral-200">
          {[
            { key: "full", label: "Completo (placar + elenco)" },
            { key: "score", label: "Somente placar" },
            { key: "csv", label: "Importar CSV" },
          ].map((option) => (
            <label
              key={option.key}
              className={`rounded-xl border px-4 py-3 transition ${
                retroMode === option.key
                  ? "border-yellow-400/70 bg-yellow-400/10 text-yellow-100"
                  : "border-neutral-800 bg-[#101010] text-neutral-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="retro-mode"
                  value={option.key}
                  checked={retroMode === option.key}
                  onChange={() => setRetroMode(option.key as RetroMode)}
                />
                <span className="font-semibold">{option.label}</span>
              </div>
              {option.key === "full" && (
                <p className="text-xs text-neutral-400 mt-2">
                  Lance elenco completo e ajuste gols/assistencias depois em Resultados do Dia.
                </p>
              )}
              {option.key === "score" && (
                <p className="text-xs text-neutral-400 mt-2">
                  Informe apenas o placar final para agilizar o historico.
                </p>
              )}
              {option.key === "csv" && (
                <p className="text-xs text-neutral-400 mt-2">
                  Opcional. Importacao via CSV ainda nao esta habilitada.
                </p>
              )}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-800 bg-[#151515] p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-yellow-300">Partidas retroativas</h2>
            <p className="text-xs text-neutral-400">
              Cadastre confrontos com times reais e registre resultados do periodo.
            </p>
          </div>
          <button
            type="button"
            onClick={addRetroMatch}
            className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
          >
            <FaPlus /> Adicionar partida
          </button>
        </div>

        {timesLoading || jogadoresLoading ? (
          <div className="rounded-xl border border-neutral-800 bg-[#101010] p-4 text-sm text-neutral-300">
            Carregando times e atletas...
          </div>
        ) : times.length === 0 ? (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
            Nenhum time cadastrado. Cadastre os times antes de criar partidas classicas.
          </div>
        ) : jogadores.length === 0 ? (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
            Nenhum atleta cadastrado. Cadastre atletas antes de montar partidas classicas.
          </div>
        ) : null}

        <div className="space-y-5">
          {retroMatches.map((match, index) => {
            const teamA = times.find((time) => time.id === match.teamAId);
            const teamB = times.find((time) => time.id === match.teamBId);

            return (
              <div
                key={match.id}
                className="rounded-2xl border border-neutral-800 bg-[#101010] p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-neutral-300">
                    <FaUsers className="text-yellow-400" /> Partida {index + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRetroMatch(match.id)}
                    className="text-xs text-red-200 hover:text-red-300"
                  >
                    <FaTrash /> Remover
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-neutral-400">Data</label>
                    <input
                      type="date"
                      value={match.date}
                      onChange={(e) => updateRetroMatch(match.id, { date: e.target.value })}
                      className="rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-neutral-400">Horario</label>
                    <input
                      type="time"
                      value={match.time}
                      onChange={(e) => updateRetroMatch(match.id, { time: e.target.value })}
                      className="rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-neutral-400">Placar A</label>
                    <input
                      type="number"
                      min={0}
                      value={match.scoreA}
                      onChange={(e) => updateRetroMatch(match.id, { scoreA: e.target.value })}
                      className="rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-neutral-400">Placar B</label>
                    <input
                      type="number"
                      min={0}
                      value={match.scoreB}
                      onChange={(e) => updateRetroMatch(match.id, { scoreB: e.target.value })}
                      className="rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-neutral-400 mb-2 block">Time A</label>
                    <select
                      value={match.teamAId}
                      onChange={(e) => updateRetroTeam(match.id, "A", e.target.value)}
                      className="w-full rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
                    >
                      <option value="">Selecione o time A</option>
                      {times.map((time) => (
                        <option key={time.id} value={time.id}>
                          {time.nome}
                        </option>
                      ))}
                    </select>
                    {retroMode !== "score" && renderRoster(match, "A", teamA)}
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 mb-2 block">Time B</label>
                    <select
                      value={match.teamBId}
                      onChange={(e) => updateRetroTeam(match.id, "B", e.target.value)}
                      className="w-full rounded-lg border border-neutral-700 bg-[#111] px-3 py-2 text-sm text-neutral-100"
                    >
                      <option value="">Selecione o time B</option>
                      {times.map((time) => (
                        <option key={time.id} value={time.id}>
                          {time.nome}
                        </option>
                      ))}
                    </select>
                    {retroMode !== "score" && renderRoster(match, "B", teamB)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {retroError && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-200">
            {retroError}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSaveRetroMatches}
            disabled={retroSaving}
            className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60"
          >
            {retroSaving ? "Salvando historico..." : "Salvar historico"}
          </button>
          <button
            type="button"
            onClick={() => router.push(retroResultsUrl)}
            className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            Abrir Resultados do Dia
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-800 bg-[#151515] p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-yellow-300">Campeoes e premiacoes do ano</h2>
            <p className="text-xs text-neutral-400">
              Preview do impacto antes de aplicar as premiacoes retroativas.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowFinalizeRetroModal(true)}
            className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
          >
            Calcular campeoes e aplicar premiacoes
          </button>
        </div>

        {!previewSlug ? (
          <div className="rounded-xl border border-neutral-800 bg-[#101010] p-4 text-sm text-neutral-300">
            Informe o racha ativo para visualizar o preview de campeoes.
          </div>
        ) : previewLoading ? (
          <div className="rounded-xl border border-neutral-800 bg-[#101010] p-4 text-sm text-neutral-300">
            Carregando preview do ano {retroYear}...
          </div>
        ) : previewError ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            Nao foi possivel carregar o preview. Verifique as estatisticas do ano selecionado.
          </div>
        ) : previewData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-neutral-200">
            <div className="rounded-xl border border-neutral-800 bg-[#101010] p-4">
              <p className="text-xs text-neutral-400">Campeao do ano</p>
              <p className="text-yellow-200 font-semibold">
                {previewData.topTeam?.nome || "Em processamento"}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-[#101010] p-4">
              <p className="text-xs text-neutral-400">Melhor do ano</p>
              <p className="text-yellow-200 font-semibold">
                {previewData.topPoints?.nome || "Em processamento"}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-[#101010] p-4">
              <p className="text-xs text-neutral-400">Artilheiro do ano</p>
              <p className="text-yellow-200 font-semibold">
                {previewData.topGols?.nome || "Em processamento"}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-[#101010] p-4">
              <p className="text-xs text-neutral-400">Maestro do ano</p>
              <p className="text-yellow-200 font-semibold">
                {previewData.topAssist?.nome || "Em processamento"}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-[#101010] p-4">
              <p className="text-xs text-neutral-400">Melhores por posicao</p>
              <div className="mt-2 space-y-1 text-xs text-neutral-200">
                <p>Goleiro: {previewData.topGoleiro?.nome || "Em processamento"}</p>
                <p>Zagueiro: {previewData.topZagueiro?.nome || "Em processamento"}</p>
                <p>Meia: {previewData.topMeia?.nome || "Em processamento"}</p>
                <p>Atacante: {previewData.topAtacante?.nome || "Em processamento"}</p>
              </div>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-[#101010] p-4">
              <p className="text-xs text-neutral-400">Perfis impactados</p>
              <p className="text-yellow-200 font-semibold">
                {previewData.impactedCount} atletas receberao icones
              </p>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );

  return (
    <>
      <Head>
        <title>Partidas Classicas | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Orquestre partidas classicas em tempo real ou retroaja resultados historicos com controle total."
        />
        <meta
          name="keywords"
          content="partida classica, sessao de jogos, resultados, retroativo, painel admin, fut7pro"
        />
      </Head>

      <main className="min-h-screen bg-fundo text-white px-4 pt-[64px] md:pt-[80px] pb-24 md:pb-10">
        <div className="mx-auto max-w-6xl">{mode === "home" ? renderHome() : null}</div>
        <div className="mx-auto max-w-6xl">{mode === "live" ? renderLive() : null}</div>
        <div className="mx-auto max-w-6xl">{mode === "retro" ? renderRetro() : null}</div>
      </main>

      {showFinalizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-[#141414] p-6">
            <div className="flex items-center gap-3 mb-3">
              <FaCheckCircle className="text-yellow-300 text-xl" />
              <h3 className="text-lg font-semibold text-yellow-300">Finalizar sessao</h3>
            </div>
            <p className="text-sm text-neutral-300">
              Isso vai consolidar os resultados do dia e liberar os destaques para o Time Campeao.
            </p>
            <p className="mt-3 text-xs text-neutral-400">
              Todas as partidas ja estao finalizadas. Deseja continuar?
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowFinalizeModal(false)}
                className="flex-1 rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={confirmFinalizeSession}
                className="flex-1 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
              >
                Finalizar agora
              </button>
            </div>
          </div>
        </div>
      )}

      {showFinalizeRetroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-[#141414] p-6">
            <div className="flex items-center gap-3 mb-3">
              <FaExclamationTriangle className="text-yellow-300 text-xl" />
              <h3 className="text-lg font-semibold text-yellow-300">Finalizar temporada</h3>
            </div>
            <p className="text-sm text-neutral-300">
              Essa acao aplica premiacoes do ano {retroYear} e bloqueia alteracoes sem permissao.
            </p>
            {retroFinalizeError && (
              <div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-200">
                {retroFinalizeError}
              </div>
            )}
            {retroFinalizeMessage && (
              <div className="mt-3 rounded-lg border border-green-500/40 bg-green-500/10 p-2 text-xs text-green-200">
                {retroFinalizeMessage}
              </div>
            )}
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowFinalizeRetroModal(false)}
                className="flex-1 rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleFinalizeRetroSeason}
                disabled={retroFinalizeLoading}
                className="flex-1 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300 disabled:opacity-60"
              >
                {retroFinalizeLoading ? "Processando..." : "Confirmar finalizacao"}
              </button>
            </div>
          </div>
        </div>
      )}

      {retroSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="rounded-2xl border border-green-500/40 bg-[#101010] p-6 text-center shadow-xl">
            <FaCheckCircle className="mx-auto mb-3 text-4xl text-green-400" />
            <h2 className="text-xl font-semibold text-green-300 mb-2">
              Historico salvo com sucesso!
            </h2>
            <p className="text-sm text-neutral-300">
              As partidas foram registradas e ja aparecem no painel.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setRetroSuccess(false);
                  router.push(retroResultsUrl);
                }}
                className="flex-1 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
              >
                Abrir Resultados do Dia
              </button>
              <button
                type="button"
                onClick={() => setRetroSuccess(false)}
                className="flex-1 rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
