// src/types/campeao.ts

export interface Campeao {
  id: string;
  rachaId: string;
  nome: string;
  categoria: string;
  data: string;
  descricao?: string | null;
  jogadores: string[];
  imagem?: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CreateCampeaoInput {
  rachaId: string;
  nome: string;
  categoria: string;
  data: string;
  descricao?: string;
  jogadores?: string[];
  imagem?: string;
}

export type UpdateCampeaoInput = Partial<CreateCampeaoInput>;
