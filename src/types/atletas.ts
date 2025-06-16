export interface EstatisticasAtleta {
  jogos: number;
  gols: number;
  assistencias: number;
  campeaoDia: number;
  mediaVitorias: number;
  pontuacao: number;
}

export interface Atleta {
  nome: string;
  slug: string;
  foto: string;
  posicao: string;
  status: string;
  mensalista: boolean;
  estatisticas: EstatisticasAtleta;
}
