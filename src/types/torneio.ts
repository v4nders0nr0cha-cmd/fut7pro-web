// src/types/torneio.ts

export type Posicao = "Goleiro" | "Zagueiro" | "Meia" | "Atacante";

export interface Jogador {
  id: string;
  nome: string;
  avatar?: string;
  posicao: Posicao;
}

// Para uso em forms/admin antes de salvar no banco
export interface DadosTorneio {
  titulo: string;
  descricao: string;
  banner: string; // Imagem em base64 após crop (upload do Admin)
  logo: string; // Logo do time campeão (base64 ou URL)
  campeoes: (Jogador | null)[];
}

// Dados persistidos no banco de dados (Prisma/PostgreSQL)
export interface Torneio {
  id: string; // ID único do torneio (UUID)
  nome: string; // Nome oficial (ex: Copa dos Campeões)
  slug: string; // Slug único (para rota dinâmica)
  ano: number; // Ano do torneio (ex: 2025)
  campeao: string; // Nome do time campeão
  banner: string; // URL/caminho do banner (padrão: imagem dos jogadores)
  logo: string; // URL/caminho/logo do time campeão
  rachaId: string; // ID do racha (multi-tenant)
  dataInicio?: string; // Data de início (ISO)
  dataFim?: string; // Data de fim (ISO)
  jogadoresCampeoes: string[]; // Lista de slugs/IDs dos campeões
  criadoEm?: string;
  atualizadoEm?: string;
}
