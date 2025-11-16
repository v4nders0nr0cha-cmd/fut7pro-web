// src/types/racha.ts

export type RoleAdmin =
  | "presidente"
  | "vicepresidente"
  | "diretorfutebol"
  | "diretorfinanceiro"
  | "leitor";

export interface Admin {
  id: string;
  usuarioId: string;
  nome?: string;
  email?: string;
  role: RoleAdmin;
  status?: "ativo" | "inativo" | "pendente";
  criadoEm?: string;
}

export interface JogadorRacha {
  id: string;
  jogadorId: string;
  nome?: string;
  apelido?: string;
  nickname?: string;
  email?: string;
  foto?: string | null;
  photoUrl?: string | null;
  mensalista?: boolean;
  isMember?: boolean;
}

export interface Racha {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
  logoUrl?: string;
  tema?: string;
  regras?: string;
  ownerId: string;
  admins: Admin[];
  jogadores: JogadorRacha[];
  criadoEm: string;
  atualizadoEm: string;
  ativo: boolean;
  financeiroVisivel?: boolean; // <-- CAMPO INCLUÍDO PARA SUPORTE AO FINANCEIRO
}
