// src/types/estatisticas.ts

// Tipos possíveis de ícones em conquistas de quadrimestre (emoji ou path de imagem)
export type QuadrimestreIcone = string;

// Estrutura de um item de destaque no quadrimestre
export interface QuadrimestreItem {
  titulo: string; // Ex: "Artilheiro", "Meia", "Zagueiro"
  nome: string; // Nome do atleta vencedor
  icone: QuadrimestreIcone; // Emoji ou path de imagem
  slug?: string; // Slug do atleta, usado para link no perfil
}

// Mapeia um ano com seus respectivos períodos e destaques
export type QuadrimestresAno = Record<string, QuadrimestreItem[]>;

// -----------------------------
// Tipagem para rankings gerais/quadrimestrais/anuais
export interface RankingAtleta {
  id: string; // Corrigido para string
  nome: string;
  slug: string;
  foto: string;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  gols: number;
  assistencias: number; // Campo para ranking de assistências
  // Adicione cartões, notas etc. se necessário
}

// -----------------------------
// Tipagem para classificação dos times por período
export interface TimeClassificacao {
  id: string; // Corrigido para string
  nome: string;
  logo: string; // Caminho da imagem do time
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  saldoGols: number;
}

// -----------------------------
// Tipos dos títulos de atleta (usado em conquistas individuais)
export interface TituloAtleta {
  descricao: string; // Ex: "Melhor do Ano", "Artilheiro", "Campeão Torneio"
  ano: number;
  icone: string; // Emoji ou path de imagem
}

// Objeto de conquistas de atleta (padronizado)
export interface ConquistasAtleta {
  titulosGrandesTorneios: TituloAtleta[];
  titulosAnuais: TituloAtleta[];
  titulosQuadrimestrais: TituloAtleta[];
}
