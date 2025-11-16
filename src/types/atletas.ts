import type { ConquistasAtleta } from "@/types/estatisticas";

export interface EstatisticasSimples {
  jogos: number;
  gols: number;
  assistencias: number;
  campeaoDia: number;
  mediaVitorias: number;
  pontuacao: number;
}

// Estrutura completa para separar estatísticas por período/histórico
export interface EstatisticasAtleta {
  historico: EstatisticasSimples; // acumulado vitalício
  anual: Record<number, EstatisticasSimples>; // ex: anual[2025]
  // quadrimestre?: Record<number, Record<1 | 2 | 3, EstatisticasSimples>>;
}

export interface JogoAtleta {
  data: string; // formato: YYYY-MM-DD
  time: string;
  resultado: string; // ex: "5x3"
  gols: number;
  campeao: boolean;
  pontuacao: number;
}

export type StatusAtleta = "Ativo" | "Inativo" | "Suspenso";
export type PosicaoAtleta = "Atacante" | "Meia" | "Zagueiro" | "Goleiro";

/**
 * Modelo atualizado: Objeto agrupando conquistas do atleta.
 * - titulosGrandesTorneios: Títulos de grandes torneios (🏆)
 * - titulosAnuais: Títulos anuais (⚽, 🏆, etc)
 * - titulosQuadrimestrais: Títulos quadrimestrais (🥇, ⚽, etc)
 */
export interface Atleta {
  id: string;
  nome: string;
  /**
   * Preferir `nickname` para uso em telas; campo legado mantido por compatibilidade.
   */
  apelido?: string | null;
  nickname?: string | null;
  slug: string;
  /**
   * Utilize `photoUrl` para exibi��o. Campo legado mantido por compatibilidade.
   */
  foto: string;
  photoUrl?: string | null;
  birthDate?: string | null;
  posicao: PosicaoAtleta;
  status: StatusAtleta;
  /**
   * Utilize `isMember` como fonte da verdade; `mensalista` � legado.
   */
  mensalista: boolean;
  isMember: boolean;
  ultimaPartida?: string;

  // Soma vitalícia para assiduidade
  totalJogos: number;

  estatisticas: EstatisticasAtleta;

  historico: JogoAtleta[];

  conquistas: ConquistasAtleta; // <<< PADRÃO NOVO, obrigatório

  /**
   * Ícones de conquistas exibidos no perfil do atleta (compatibilidade visual antiga, pode remover se não usar).
   */
  icones?: string[];
}

// Helper para acesso rápido ao total de gols (vitalício)
export function getGolsTotal(atleta: Atleta): number {
  return atleta.estatisticas?.historico?.gols ?? 0;
}

// Helper para gols no ano específico
export function getGolsAno(atleta: Atleta, ano: number): number {
  return atleta.estatisticas?.anual?.[ano]?.gols ?? 0;
}
