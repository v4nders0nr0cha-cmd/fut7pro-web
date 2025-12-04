// src/types/torneio.ts

export type Posicao = "Goleiro" | "Zagueiro" | "Meia" | "Atacante";

export interface Jogador {
  id: string;
  nome: string;
  avatar?: string;
  posicao: Posicao;
  slug?: string;
  fotoUrl?: string | null;
}

// Para uso em forms/admin antes de salvar no banco
export interface DadosTorneio {
  nome: string;
  slug: string;
  ano: number;
  descricao: string;
  descricaoResumida?: string;
  campeao?: string;
  status?: "rascunho" | "publicado";
  destacarNoSite?: boolean;
  bannerBase64?: string; // Imagem em base64 apos crop (upload do Admin)
  logoBase64?: string; // Logo do time campeao (base64 ou URL)
  jogadoresCampeoes: TorneioJogador[];
}

// Dados persistidos no banco de dados (Prisma/PostgreSQL)
export interface Torneio {
  id: string; // ID unico do torneio (UUID)
  nome: string; // Nome oficial (ex: Copa dos Campeoes)
  slug: string; // Slug unico (para rota dinamica)
  ano: number; // Ano do torneio (ex: 2025)
  campeao: string; // Nome do time campeao
  banner: string; // URL/caminho do banner (padrao: imagem dos jogadores)
  logo: string; // URL/caminho/logo do time campeao
  bannerUrl?: string; // Alias legado para compatibilidade
  logoUrl?: string; // Alias legado para compatibilidade
  rachaId: string; // ID do racha (multi-tenant)
  dataInicio?: string; // Data de inicio (ISO)
  dataFim?: string; // Data de fim (ISO)
  descricao?: string;
  descricaoResumida?: string;
  status?: "rascunho" | "publicado";
  destacarNoSite?: boolean;
  publicadoEm?: string;
  jogadoresCampeoes: Array<string | TorneioJogador>; // Lista de slugs/IDs dos campeoes
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface TorneioJogador {
  athleteId?: string;
  athleteSlug: string;
  nome: string;
  posicao: Posicao;
  fotoUrl?: string | null;
}
