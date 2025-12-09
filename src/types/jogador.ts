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
  email: string;
  dataNascimento?: string;
  birthDate?: string;
  nascimento?: string;
  posicao: PosicaoJogador;
  avatar: string;
  foto?: string;
  photoUrl?: string | null;
  status: StatusJogador;
  mensalista: boolean;
  isMember?: boolean;
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
};

export type AtletaPendente = {
  id: string;
  nome: string;
  email: string;
  apelido: string;
  posicao: PosicaoJogador;
  avatar: string;
};
