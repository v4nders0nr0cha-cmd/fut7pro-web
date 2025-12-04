export interface Racha {
  id: string;
  nome: string;
  slug: string;
  ownerId?: string;
  criadoEm?: string;
  admins?: any[];
  jogadores?: any[];
  atualizadoEm?: string;
  ativo?: boolean;
  status?: string;
}

export interface Metricas {
  totalRachas: number;
  totalUsuarios: number;
  receitaMensal?: number;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role?: string;
}
