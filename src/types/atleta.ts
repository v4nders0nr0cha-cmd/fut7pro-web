export interface AtletaBase {
  id: string;
  nome: string;
  apelido: string | null;
  slug: string;
  foto: string | null;
  posicao: string | null;
}

export interface AtletaStats {
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  gols: number;
  assistencias: number;
  mediaPontuacao: number;
}

export interface Atleta extends AtletaBase {
  stats: AtletaStats;
}

export interface HistoricoPartidaAtleta {
  partidaId: string;
  dataISO: string;
  adversario: string;
  resultado: "V" | "E" | "D";
  placar: string;
  gols: number;
  assistencias: number;
}

export type ConquistaAtleta = {
  titulo: string;
  ano?: number | null;
  tipo?: string | null;
};

export interface AtletaDetalhe extends Atleta {
  historicoRecentes: HistoricoPartidaAtleta[];
  conquistas: ConquistaAtleta[];
}
