export type Posicao = "Goleiro" | "Zagueiro" | "Meia" | "Atacante";

export interface TorneioJogadorCampeao {
  id?: string;
  athleteId?: string | null;
  athleteSlug: string;
  nome: string;
  posicao: Posicao | string;
  fotoUrl?: string | null;
}

export interface Torneio {
  id: string;
  nome: string;
  slug: string;
  ano: number;
  campeao?: string | null;
  descricao?: string | null;
  descricaoResumida?: string | null;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  destacarNoSite?: boolean;
  status?: "rascunho" | "publicado";
  publicadoEm?: string | null;
  tenantSlug?: string | null;
  jogadoresCampeoes?: TorneioJogadorCampeao[];
  criadoEm?: string | null;
  atualizadoEm?: string | null;
}

export type CreateTorneioPayload = Partial<
  Pick<
    Torneio,
    | "nome"
    | "slug"
    | "ano"
    | "campeao"
    | "descricao"
    | "descricaoResumida"
    | "bannerUrl"
    | "logoUrl"
    | "dataInicio"
    | "dataFim"
    | "destacarNoSite"
    | "status"
  >
> & { jogadoresCampeoes?: TorneioJogadorCampeao[] };
