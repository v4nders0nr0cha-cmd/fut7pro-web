export type PlayerRankingType = "geral" | "artilheiros" | "assistencias";

export interface PlayerRanking {
  id: string;
  rankingId: string;
  nome: string;
  apelido?: string | null;
  slug?: string | null;
  foto?: string | null;
  posicao?: string | null;
  posicaoValor?: string | null;
  email?: string | null;
  status?: string | null;
  pontos: number;
  gols: number;
  assistencias: number;
  jogos?: number;
  vitorias?: number;
  empates?: number;
  derrotas?: number;
  cartoesAmarelos?: number;
  cartoesVermelhos?: number;
  lastMatchAt?: string | null;
  posicaoRanking: number;
  updatedAt?: string | null;
}

export interface PlayerRankingResponse {
  slug: string;
  type: PlayerRankingType;
  results: PlayerRanking[];
  total: number;
  availableYears?: number[];
  appliedPeriod?: {
    mode: "all" | "year" | "quarter" | "custom";
    year?: number;
    quarter?: number;
    start?: string | null;
    end?: string | null;
  };
}
