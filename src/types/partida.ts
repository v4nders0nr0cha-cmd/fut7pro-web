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
  } | null;
  team: PublicMatchTeam | null;
};

export type PublicMatch = {
  id: string;
  date: string;
  location: string | null;
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
