export interface Racha {
  id: string;
  nome: string;
  slug: string;
  ownerId?: string;
  tenantId?: string;
  tenantSlug?: string;
  criadoEm?: string;
  admins?: any[];
  jogadores?: any[];
  atualizadoEm?: string;
  ativo?: boolean;
  status?: string;
  plano?: string;
  planoStatus?: string;
  planoExpiraEm?: string;
  trialExpiraEm?: string;
  themeKey?: string;
  cnpj?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  adminsCount?: number;
  jogadoresCount?: number;
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
  name?: string;
  role?: string;
  superadmin?: boolean;
  status?: string;
  tenantId?: string;
  tenantSlug?: string;
  tenantNome?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  ativo?: boolean;
  image?: string;
  phone?: string;
}
