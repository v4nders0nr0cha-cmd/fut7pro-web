export interface Campeao {
  id: string;
  rachaId: string;
  titulo?: string;
  nome?: string;
  categoria?: string | null;
  data?: string | null;
  descricao?: string | null;
  temporada?: string | null;
  time?: string | null;
  jogadores?: string[];
  bannerUrl?: string | null;
  logoUrl?: string | null;
  criadoEm?: string;
  atualizadoEm?: string;
}
