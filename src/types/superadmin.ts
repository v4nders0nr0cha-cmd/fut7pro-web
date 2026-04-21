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
  linkedTenants?: UsuarioTenantLink[];
  relationshipSummary?: UsuarioRelationshipSummary;
  deletion?: UsuarioDeletionSummary;
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

export interface UsuarioDeletionReason {
  code?: string;
  message?: string;
  count?: number;
}

export interface UsuarioDeletionSummary {
  eligible?: boolean;
  reasons?: UsuarioDeletionReason[];
}

export interface UsuarioRelationshipSummary {
  tenantCount?: number;
  directTenantCount?: number;
  membershipCount?: number;
  athleteCount?: number;
  adminCount?: number;
  blockingRelationshipCount?: number;
}

export interface UsuarioTenantLink {
  tenantId?: string;
  tenantSlug?: string;
  tenantNome?: string;
}

export interface UsuarioRelationship {
  id: string;
  type: "DIRECT_TENANT_LINK" | "MEMBERSHIP" | "ATHLETE" | "ADMIN" | string;
  label?: string;
  role?: string;
  status?: string;
  tenantId?: string;
  tenantSlug?: string;
  tenantNome?: string;
  blocksDeletion?: boolean;
  unlinkable?: boolean;
  unlinkRequiresTransfer?: boolean;
  unlinkBlockedReason?: string;
}
