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
  posicao: PosicaoJogador;
  position?: PosicaoJogador;
  posicaoSecundaria?: PosicaoJogador | null;
  positionSecondary?: PosicaoJogador | null;
  avatar: string;
  foto?: string;
  photoUrl?: string | null;
  status: StatusJogador;
  mensalista: boolean;
  isMember?: boolean;
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
  userId?: string | null;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
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
