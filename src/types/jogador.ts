export type Jogador = {
  id: string;
  nome: string;
  apelido: string;
  email: string;
  posicao: PosicaoJogador; // "goleiro", "zagueiro", "meia", "atacante"
  avatar: string; // Foto do jogador (antes era "foto")
  foto?: string; // alias legado
  status: StatusJogador; // "Ativo", "Inativo", "Suspenso"
  mensalista: boolean;
  timeId: string; // Relacionamento com Time
  rachas?: unknown[]; // Relacionamento com rachas, se necessário
  createdAt?: string;
  updatedAt?: string;
};

// Enum para posição
export type PosicaoJogador = "Goleiro" | "Zagueiro" | "Meia" | "Atacante" | "goleiro" | "zagueiro" | "meia" | "atacante";

// Enum para status do jogador
export type StatusJogador = "Ativo" | "Inativo" | "Suspenso" | "ativo" | "inativo" | "suspenso";

// Tipagem separada para atletas pendentes
export type AtletaPendente = {
  id: string;
  nome: string;
  email: string;
  apelido: string;
  posicao: PosicaoJogador;
  avatar: string;
};
