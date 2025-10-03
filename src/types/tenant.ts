// src/types/tenant.ts
// Tipos para o sistema multi-tenant do Fut7Pro

export type MembershipStatus = "APROVADO" | "PENDENTE" | "SUSPENSO";
export type MembershipRole = "ATLETA" | "ADMIN";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  autoJoinEnabled: boolean;
  createdAt: string;
  updatedAt?: string;
  description?: string;
  logoUrl?: string;
  theme?: string;
  rules?: string;
  ownerId: string;
  active: boolean;
}

export interface Membership {
  id: string;
  tenantId: string;
  userId: string;
  role: MembershipRole;
  status: MembershipStatus;
  createdAt: string;
  updatedAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface JwtPayload {
  sub: string; // userId
  role: "ADMIN" | "SUPERADMIN";
  email: string;
  name: string;
  rachaId?: string;
  tenantId?: string;
  tenantSlug?: string;
}

export interface TenantContextType {
  tenant: Tenant | null;
  membership: Membership | null;
  loading: boolean;
  error: string | null;
  setTenant: (tenant: Tenant | null) => void;
  setMembership: (membership: Membership | null) => void;
  clearTenant: () => void;
  refreshTenant: () => Promise<void>;
}

export interface CreateTenantData {
  name: string;
  slug: string;
  subdomain: string;
  autoJoinEnabled: boolean;
  description?: string;
  rules?: string;
}

export interface UpdateTenantData {
  name?: string;
  description?: string;
  rules?: string;
  autoJoinEnabled?: boolean;
  theme?: string;
}

export interface InviteUserData {
  email: string;
  role: MembershipRole;
}

export interface UpdateMembershipData {
  role?: MembershipRole;
  status?: MembershipStatus;
}
