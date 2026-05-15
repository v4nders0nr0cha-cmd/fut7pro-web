// src/types/partida.ts

export type GolOuAssistencia = {
  jogador: string;
  time: "A" | "B";
};

export type Partida = {
  id: string;
  rachaId: string;
  data: string;
  horario: string;
  local?: string;
  timeA: string;
  timeB: string;
  golsTimeA: number;
  golsTimeB: number;
  jogadoresA: string;
  jogadoresB: string;
  destaquesA?: string;
  destaquesB?: string;
  finalizada: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
  gols?: GolOuAssistencia[];
  assistencias?: GolOuAssistencia[];
};

export interface PartidaMock {
  id: string;
  data: string;
  hora: string;
  local: string;
  ano: number;
  timeCasa: string;
  logoCasa: string;
  golsCasa: number;
  timeFora: string;
  logoFora: string;
  golsFora: number;
  destaques: string[];
  status: "Concluído" | "Em andamento" | "Agendado";
  gols?: GolOuAssistencia[];
  assistencias?: GolOuAssistencia[];
}

// ==== NOVOS TIPOS PARA TIMES DO DIA E DESTAQUES ====

// IDs como string, mantendo compatibilidade com o restante do projeto
export type JogadorDoDia = {
  id: string;
  nome: string;
  apelido: string;
  foto: string;
  posicao: "Goleiro" | "Zagueiro" | "Meia" | "Atacante";
  status: "titular" | "substituto" | "ausente";
};

export type TimeDoDia = {
  id: string;
  nome: string;
  logo: string;
  cor: string;
  ehTimeCampeao?: boolean;
  jogadores: JogadorDoDia[];
};

export type DestaqueDoDia = {
  tipo: "Goleiro" | "Zagueiro" | "Meia" | "Atacante" | "Artilheiro" | "Maestro";
  jogadorId: string;
  timeId: string;
};

export type PublicMatchTeam = {
  id: string | null;
  name: string;
  logoUrl: string | null;
  color: string | null;
};

export type PublicMatchPresence = {
  id: string;
  matchId: string;
  tenantId: string | null;
  athleteId: string;
  teamId: string | null;
  status: "TITULAR" | "SUBSTITUTO" | "AUSENTE";
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  createdAt: string;
  updatedAt: string;
  athlete: {
    id: string;
    name: string;
    nickname: string | null;
    position: string | null;
    photoUrl: string | null;
    avatarUrl?: string | null;
  } | null;
  team: PublicMatchTeam | null;
};

export type PublicMatch = {
  id: string;
  date: string;
  location: string | null;
  status?: "not_started" | "in_progress" | "finished";
  scoreA: number | null;
  scoreB: number | null;
  score: { teamA: number; teamB: number };
  teamA: PublicMatchTeam;
  teamB: PublicMatchTeam;
  presences: PublicMatchPresence[];
};

export type PublicMatchesResponse = {
  slug: string;
  total: number;
  results: PublicMatch[];
};

export type MatchdayStatus = "not_started" | "in_progress" | "finished";

export type LiveAthlete = {
  id: string;
  name: string;
  nickname: string | null;
  position: string | null;
  photoUrl: string | null;
};

export type LiveTeam = PublicMatchTeam;

export type LiveEvent = {
  id: string;
  matchId: string;
  teamId: string | null;
  teamName: string;
  type: "GOAL";
  scorer: LiveAthlete | null;
  assist: LiveAthlete | null;
  minute: string | null;
  occurredAt: string | null;
  description: string;
};

export type LiveMatch = {
  id: string;
  date: string;
  location: string | null;
  status: MatchdayStatus;
  teamA: LiveTeam;
  teamB: LiveTeam;
  scoreA: number;
  scoreB: number;
  goals: LiveEvent[];
};

export type LiveStandingRow = {
  teamId: string;
  team: string;
  logoUrl: string | null;
  color: string | null;
  pts: number;
  j: number;
  v: number;
  e: number;
  d: number;
  gp: number;
  gc: number;
  sg: number;
};

export type LiveHighlightPick = {
  status: string;
  athlete: LiveAthlete | null;
  value: number;
};

export type LiveHighlights = {
  artilheiro: LiveHighlightPick;
  maestro: LiveHighlightPick;
  atacante: LiveHighlightPick;
  meia: LiveHighlightPick;
  goleiro: LiveHighlightPick;
  zagueiro: {
    status: string;
    candidates: Array<{ athlete: LiveAthlete; value: string }>;
  };
  timeCampeao: {
    status: string;
    team: string | null;
    pts: number;
    sg: number;
  };
};

export type MatchdayLiveResponse = {
  slug: string | null;
  date: string;
  status: MatchdayStatus;
  updatedAt: string | null;
  matches: LiveMatch[];
  standings: LiveStandingRow[];
  highlights: LiveHighlights;
  timeline: LiveEvent[];
};
