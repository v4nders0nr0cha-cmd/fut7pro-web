export interface Time {
  id: string;
  nome: string;
  slug: string;
  logo: string; // Logo do time (antes escudoUrl)
  cor: string; // Cor principal do time
  corSecundaria?: string; // Cor secundária opcional
  rachaId: string;
  jogadores?: string[]; // IDs dos jogadores vinculados ao time
  criadoEm?: string;
  atualizadoEm?: string;
}
