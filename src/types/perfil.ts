export interface Perfil {
  id: string;
  usuarioId?: string;
  rachaId?: string;
  tenantSlug?: string;
  nome: string;
  apelido?: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  bio?: string;
  foto?: string;
  avatar?: string;
  posicao?: string;
  posicaoSigla?: string;
  peso?: number;
  altura?: number;
  redes?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
  };
  preferenciaPosicao?: string;
  peBom?: "direito" | "esquerdo" | "ambidestro";
  gols?: number;
  assistencias?: number;
  partidas?: number;
  presencas?: number;
  rankingPontos?: number;
  conquistas?: string[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}
