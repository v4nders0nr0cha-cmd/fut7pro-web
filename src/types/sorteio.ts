// src/types/sorteio.ts
// Tipos e interfaces para o módulo de sorteio do Fut7Pro

export type Posicao = "GOL" | "ZAG" | "MEI" | "ATA";

// Novo tipo refletindo estrutura do banco
export interface AvaliacaoEstrela {
  id?: string; // id do registro de estrela no banco
  rachaId?: string; // racha ao qual essa estrela pertence
  jogadorId?: string; // jogador avaliado
  estrelas: number; // 1-5 estrelas
  atualizadoPor?: string; // id do admin que avaliou
  adminId?: string; // compatibilidade com mocks antigos
  atualizadoEm: string; // timestamp ISO
}

// Tipo para resposta da API: pode ser um array dessas avaliações
export type AvaliacoesEstrelaResponse = AvaliacaoEstrela[];

// Participante ajustado para compatibilidade futura (inclui id do banco)
export interface Participante {
  id: string; // id do jogador
  nome: string;
  slug: string;
  foto: string;
  posicao: Posicao;
  rankingPontos: number;
  vitorias: number;
  gols: number;
  assistencias: number;
  estrelas: AvaliacaoEstrela; // Um por racha (via API busca o correto)
  mensalista: boolean;
  partidas?: number;
  // Marcadores especiais
  isFicticio?: boolean; // indica jogador sintético (ex.: goleiro fictício)
  naoRanqueavel?: boolean; // não gera estatísticas/ranking
}

export interface TimeSorteado {
  id: string;
  nome: string;
  jogadores: Participante[];
  coeficienteTotal: number; // Soma dos coeficientes dos jogadores do time
  mediaRanking?: number;
  mediaEstrelas?: number;
}

export interface ConfiguracaoRacha {
  duracaoRachaMin: number;
  duracaoPartidaMin: number;
  numTimes: number;
  jogadoresPorTime: number;
}
