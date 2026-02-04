export interface Racha {
  id: string;
  nome: string;
  slug: string;
  isVitrine?: boolean;
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
  nickname?: string;
  avatarUrl?: string;
  role?: string;
  superadmin?: boolean;
  status?: string;
  tenantId?: string;
  tenantSlug?: string;
  tenantNome?: string;
  authProvider?: string;
  emailVerified?: boolean;
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  disabledAt?: string;
  disabledReason?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  ativo?: boolean;
  image?: string;
  phone?: string;
  memberships?: UsuarioMembership[];
}

export interface UsuarioMembership {
  id?: string;
  role?: string;
  status?: string;
  createdAt?: string;
  tenantId?: string;
  tenantSlug?: string;
  tenantNome?: string;
}
