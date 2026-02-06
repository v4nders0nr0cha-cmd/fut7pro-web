export type GlobalProfileStats = {
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  pontos: number;
  gols: number;
  assistencias: number;
};

export type GlobalProfileUser = {
  id: string;
  email: string | null;
  name: string;
  nickname?: string | null;
  avatarUrl?: string | null;
  birthDay?: number | null;
  birthMonth?: number | null;
  birthYear?: number | null;
  position?: string | null;
  positionSecondary?: string | null;
  hasPassword?: boolean;
  emailVerified?: boolean;
  emailVerifiedAt?: string | null;
  authProvider?: string | null;
  authProviderId?: string | null;
};

export type GlobalProfileMembership = {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  role: string;
  status: string;
  logoUrl?: string | null;
  isAdmin?: boolean;
  adminAllowed?: boolean;
  subscription?: {
    status?: string | null;
    statusRaw?: string | null;
    blocked?: boolean | null;
    reason?: string | null;
    trialEnd?: string | null;
    currentPeriodEnd?: string | null;
    planKey?: string | null;
    daysRemaining?: number | null;
  } | null;
};

export type GlobalTitle = {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  descricao: string;
  ano: number;
  icone?: string | null;
  tipo?: string | null;
  quadrimestre?: number | null;
};

export type GlobalProfileResponse = {
  user: GlobalProfileUser;
  stats: GlobalProfileStats;
  totalTitulos?: number;
  conquistas: {
    titulosGrandesTorneios: GlobalTitle[];
    titulosAnuais: GlobalTitle[];
    titulosQuadrimestrais: GlobalTitle[];
  };
  memberships: GlobalProfileMembership[];
};
