export interface Time {
  id: string;
  nome: string;
  name?: string;
  slug?: string;
  logo?: string; // Logo do time (antes escudoUrl)
  logoUrl?: string;
  cor?: string; // Cor principal do time
  color?: string;
  corSecundaria?: string; // Cor secundária opcional
  rachaId?: string;
  tenantId?: string;
  tenantSlug?: string;
  jogadores?: string[]; // IDs dos jogadores vinculados ao time
  criadoEm?: string;
  atualizadoEm?: string;
  createdAt?: string;
  updatedAt?: string;
}
