export interface CampeaoJogador {
  id: string;
  nome: string;
  slug: string;
  posicao: string;
  foto?: string;
  fotoUrl?: string;
}

export interface Campeao {
  id: string;
  ano: number;
  categoria: string;
  titulo: string;
  nome?: string;
  descricao?: string;
  descricaoCurta?: string;
  campeao: string;
  slug?: string;
  valor?: string;
  icone?: string;
  image?: string;
  logo?: string;
  status?: "rascunho" | "publicado";
  data?: string;
  badge?: string;
  href?: string;
  jogadores?: CampeaoJogador[];
  temporario?: boolean;
  tenantSlug?: string;
  metadata?: Record<string, unknown>;
}
