// src/types/torneio.ts

export type Posicao = "Goleiro" | "Zagueiro" | "Meia" | "Atacante";

export interface TorneioJogador {
  athleteId?: string;
  athleteSlug: string;
  nome: string;
  posicao: Posicao;
  fotoUrl?: string | null;
}

export interface DadosTorneio {
  id?: string;
  rachaId?: string;
  slug?: string;
  nome: string;
  ano: number;
  descricao: string;
  descricaoResumida?: string;
  campeao?: string;
  status?: "rascunho" | "publicado";
  destacarNoSite?: boolean;
  bannerBase64?: string;
  logoBase64?: string;
  jogadoresCampeoes: TorneioJogador[];
  premioTotal?: number;
  premioMvp?: string;
  premioGoleiro?: string;
}

export interface Torneio {
  id: string;
  nome: string;
  slug: string;
  ano: number;
  campeao: string;
  campeaoId?: string;
  viceCampeao?: string;
  terceiroLugar?: string;
  mvp?: string;
  melhorGoleiro?: string;
  banner: string;
  logo: string;
  bannerUrl?: string;
  logoUrl?: string;
  rachaId: string;
  tenantId?: string;
  tenantSlug?: string;
  dataInicio?: string;
  dataFim?: string;
  descricao?: string;
  descricaoResumida?: string;
  status?: "rascunho" | "publicado";
  destacarNoSite?: boolean;
  publicadoEm?: string;
  jogadoresCampeoes: TorneioJogador[];
  criadoEm?: string;
  atualizadoEm?: string;
  premioTotal?: number;
  inscricaoValor?: number;
  inscritos?: number;
  capacidade?: number;
}
