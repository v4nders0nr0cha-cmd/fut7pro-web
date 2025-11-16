import type { Athlete } from "./jogador";

export type PresenceStatus = "TITULAR" | "SUBSTITUTO" | "AUSENTE";

export interface MatchTeam {
  id: string;
  name: string;
  slug?: string | null;
  logoUrl?: string | null;
  color?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MatchPresence {
  id: string;
  matchId: string;
  tenantId: string | null;
  athleteId: string;
  teamId?: string | null;
  status: PresenceStatus;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  createdAt: string;
  updatedAt: string;
  athlete: Athlete | null;
  team?: MatchTeam | null;
}

export interface Match {
  id: string;
  tenantId: string;
  date: string;
  location?: string | null;
  teamAId?: string | null;
  teamBId?: string | null;
  scoreA?: number | null;
  scoreB?: number | null;
  score?: {
    teamA: number;
    teamB: number;
  };
  createdAt?: string;
  updatedAt?: string;
  teamA?: MatchTeam | null;
  teamB?: MatchTeam | null;
  presences: MatchPresence[];
}

export interface MatchSummary {
  id: string;
  tenantId: string;
  date: string;
  location?: string | null;
  teamAName?: string | null;
  teamBName?: string | null;
  scoreA?: number | null;
  scoreB?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PartidaGol {
  id: string;
  jogador: string;
  time: "A" | "B";
  quantidade: number;
}

export interface PartidaAssistencia {
  id: string;
  jogador: string;
  time: "A" | "B";
  quantidade: number;
}

export interface Partida {
  id: string;
  tenantId: string;
  data: string;
  ano: number;
  horario: string | null;
  local?: string | null;
  status: "Agendada" | "Em andamento" | "Concluida";
  finalizada: boolean;
  timeAId: string | null;
  timeBId: string | null;
  timeA: string;
  timeB: string;
  timeCasa: string;
  timeFora: string;
  logoCasa: string;
  logoFora: string;
  golsCasa: number | null;
  golsFora: number | null;
  golsTimeA: number | null;
  golsTimeB: number | null;
  gols: PartidaGol[];
  assistencias: PartidaAssistencia[];
  presencas: MatchPresence[];
  match: Match;
}
