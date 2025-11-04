export type AthletePosition = "goleiro" | "zagueiro" | "meia" | "atacante";

export type AthleteStatus = "Ativo" | "Inativo" | "Suspenso" | string;

export interface Athlete {
  id: string;
  tenantId: string;
  name: string;
  nickname?: string | null;
  email?: string | null;
  position: AthletePosition;
  photoUrl?: string | null;
  status: AthleteStatus;
  isMember: boolean;
  /**
   * Alias de compatibilidade legado - será removido após refatoração completa
   */
  mensalista?: boolean;
  slug?: string | null;
  birthDate?: string | null;
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
