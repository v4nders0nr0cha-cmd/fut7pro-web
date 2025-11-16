export type AthletePosition =
  | "goleiro"
  | "zagueiro"
  | "meia"
  | "atacante"
  | "GOL"
  | "ZAG"
  | "MEI"
  | "ATA";

export type AthleteStatus = "Ativo" | "Inativo" | "Suspenso" | string;

export interface AthleteRanking {
  id?: string;
  type?: string;
  scope?: string;
  season?: string;
  period?: string;
  points?: number;
  wins?: number;
  goals?: number;
  assists?: number;
  games?: number;
}

export interface AthleteStars {
  id?: string;
  rachaId?: string;
  jogadorId?: string;
  estrelas?: number;
  atualizadoEm?: string;
  atualizadoPor?: string;
}

export interface AthleteStarsLegacy {
  value?: number;
  updatedAt?: string;
  updatedBy?: string;
}

export interface AthleteStats {
  totalMatches?: number;
  wins?: number;
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
  averageGoalsPerMatch?: number;
  averageAssistsPerMatch?: number;
}

export interface Athlete {
  id: string;
  tenantId: string;
  name: string;
  nickname?: string | null;
  email?: string | null;
  position: AthletePosition;
  /** Compatibilidade com payloads legados */
  posicao?: string | null;
  photoUrl?: string | null;
  status: AthleteStatus;
  isMember: boolean;
  /**
   * Alias de compatibilidade legado - será removido após refatoração completa
   */
  mensalista?: boolean;
  slug?: string | null;
  birthDate?: string | null;
  rankings?: AthleteRanking[];
  estrelas?: AthleteStars | null;
  /**
   * Estrutura refletindo a nomenclatura vinda do backend (stars.*)
   * mantida para compatibilidade com clients que ainda não migraram
   * para o formato `estrelas`.
   */
  stars?: AthleteStarsLegacy | null;
  stats?: AthleteStats;
  rankingPontos?: number;
  vitorias?: number;
  gols?: number;
  assistencias?: number;
  partidas?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AthletePresenceSummary {
  totalMatches: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}

export interface AthleteWithStats extends Athlete {
  stats?: AthletePresenceSummary;
}

export interface AthleteRequest {
  id: string;
  tenantId: string;
  name: string;
  nickname?: string | null;
  email: string;
  position: AthletePosition;
  photoUrl?: string | null;
  message?: string | null;
  status: "PENDENTE" | "APROVADA" | "REJEITADA";
  createdAt: string;
  updatedAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  processedById?: string | null;
}
