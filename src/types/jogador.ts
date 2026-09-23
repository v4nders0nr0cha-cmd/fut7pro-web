export type PosicaoJogador =
  | "Goleiro"
  | "Zagueiro"
  | "Meia"
  | "Atacante"
  | "goleiro"
  | "zagueiro"
  | "meia"
  | "atacante";

export type StatusJogador = "Ativo" | "Inativo" | "Suspenso" | "ativo" | "inativo" | "suspenso";

export type Jogador = {
  id: string;
  nome: string;
  apelido: string;
  name?: string;
  email: string;
  dataNascimento?: string;
  birthDate?: string;
  nascimento?: string;
  birthDay?: number;
  birthMonth?: number;
  birthYear?: number | null;
  birthPublic?: boolean | null;
  posicao: PosicaoJogador;
  position?: PosicaoJogador;
  posicaoSecundaria?: PosicaoJogador | null;
  positionSecondary?: PosicaoJogador | null;
  avatar: string;
  avatarUrl?: string | null;
  foto?: string;
  photoUrl?: string | null;
  status: StatusJogador;
  mensalista: boolean;
  isMember?: boolean;
  isMensalista?: boolean;
  isBot?: boolean;
  timeId: string;
  rachaId?: string;
  tenantSlug?: string;
  slug?: string;
  nickname?: string;
  gols?: number;
  assistencias?: number;
  partidas?: number;
  presencas?: number;
  rankingPontos?: number;
  rachas?: unknown[];
  createdAt?: string;
  updatedAt?: string;
  archivedAt?: string | null;
  hasHistoricalUsage?: boolean;
  canDelete?: boolean;
  presenceCount?: number;
  rankingCount?: number;
  awardCount?: number;
  athleteLevelCount?: number;
  athleteLevelHistoryCount?: number;
  championDayCount?: number;
  tournamentChampionCount?: number;
  mensalistaCompetenciaCount?: number;
  mensalistaRequestCount?: number;
  legendaryNotificationCount?: number;
  financeiroCount?: number;
  suggestionCount?: number;
  publishedSorteioCount?: number;
  userId?: string | null;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
  membershipRole?: string | null;
  membershipStatus?: string | null;
  managedByGlobalProfile?: boolean;
  isAdministrativeMember?: boolean;
  managedByAdmin?: boolean;
};

export type AtletaPendente = {
  id: string;
  nome: string;
  email: string;
  apelido: string;
  posicao: PosicaoJogador;
  posicaoSecundaria?: PosicaoJogador | null;
  avatar: string;
};
