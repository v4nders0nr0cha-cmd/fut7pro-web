export interface Ranking {
  id: string;
  atletaId?: string;
  nome: string;
  slug?: string;
  foto?: string;
  fotoUrl?: string;
  time?: string;
  posicao?: string;
  pontos?: number;
  jogos?: number;
  vitorias?: number;
  empates?: number;
  derrotas?: number;
  gols?: number;
  assistencias?: number;
  aproveitamento?: number;
  periodo?: string;
  tenantSlug?: string;
  metadata?: Record<string, unknown>;
}
