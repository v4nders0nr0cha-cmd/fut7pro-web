import type { EstatisticasAtleta, JogoAtleta } from "@/types/atletas";
import type { ConquistasAtleta, TituloAtleta } from "@/types/estatisticas";

export interface PerfilUsuario {
  slug: string;
  foto?: string | null;
  photoUrl?: string | null;
  nome: string;
  apelido?: string | null;
  nickname?: string | null;
  posicao: string;
  status: string;
  mensalista: boolean;
  isMember: boolean;
  ultimaPartida?: string | null;
  totalJogos: number;
  estatisticas: EstatisticasAtleta;
  conquistas: ConquistasAtleta;
  historico: JogoAtleta[];
  icones?: string[];
}

export type AtualizarPerfilPayload = {
  nome?: string;
  apelido?: string;
  nickname?: string;
  posicao?: string;
  removerFoto?: boolean;
  fotoFile?: File | null;
};

export interface PerfilResponseRaw {
  slug?: string | null;
  foto?: string | null;
  photoUrl?: string | null;
  nome?: string | null;
  apelido?: string | null;
  nickname?: string | null;
  posicao?: string | null;
  status?: string | null;
  mensalista?: boolean;
  isMember?: boolean;
  ultimaPartida?: string | null;
  totalJogos?: number | null;
  estatisticas?: {
    anual?: Record<string, unknown>;
    historico?: unknown;
  };
  conquistas?: {
    titulosGrandesTorneios?: unknown;
    titulosAnuais?: unknown;
    titulosQuadrimestrais?: unknown;
  };
  historico?: unknown;
  icones?: string[];
}
