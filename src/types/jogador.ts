export type Jogador = {
  id: string;
  nome: string;
  apelido: string;
  email: string;
  posicao: PosicaoJogador; // "goleiro", "zagueiro", "meia", "atacante"
  avatar: string; // Foto do jogador (antes era "foto")
  status: StatusJogador; // "Ativo", "Inativo", "Suspenso"
  mensalista: boolean;
  timeId: string; // Relacionamento com Time
  rachas?: unknown[]; // Relacionamento com rachas, se necessário
  createdAt?: string;
  updatedAt?: string;
};

// Enum para posição
export type PosicaoJogador = "goleiro" | "zagueiro" | "meia" | "atacante";

// Enum para status do jogador
export type StatusJogador = "Ativo" | "Inativo" | "Suspenso";

// Tipagem separada para atletas pendentes
export type AtletaPendente = {
  id: string;
  nome: string;
  email: string;
  apelido: string;
  posicao: PosicaoJogador;
  avatar: string;
};
