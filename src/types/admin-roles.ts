export type AdminRoleKey =
  | "PRESIDENTE"
  | "VICE_PRESIDENTE"
  | "DIRETOR_FUTEBOL"
  | "DIRETOR_FINANCEIRO";

export type AdminRoleSlot = {
  role: AdminRoleKey;
  status: "ACTIVE" | "PENDING" | "EMPTY";
  membershipId?: string | null;
  userId?: string | null;
  athleteId?: string | null;
  name?: string | null;
  nickname?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  position?: string | null;
  athleteStatus?: string | null;
  pendingInvite?: boolean;
  pendingInviteId?: string | null;
  pendingInviteExpiresAt?: string | null;
  pendingInviteAthlete?: {
    id: string;
    name: string;
    nickname?: string | null;
    avatarUrl?: string | null;
  } | null;
};

export type AdminRoleAthlete = {
  id: string;
  nome: string;
  apelido?: string | null;
  email?: string | null;
  posicao?: string | null;
  status?: string | null;
  avatarUrl?: string | null;
  userId?: string | null;
  adminRole?: AdminRoleKey | null;
  isAdmin?: boolean;
  hasUserAccount?: boolean;
  isPendingInvite?: boolean;
};

export type AdminRoleInviteStatus =
  | "LEGACY"
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED"
  | "SUPERSEDED";

export type AdminRoleInvite = {
  id: string;
  role: Exclude<AdminRoleKey, "PRESIDENTE">;
  status: AdminRoleInviteStatus;
  createdAt: string;
  expiresAt?: string | null;
  resolvedAt?: string | null;
  cancellationReason?: string | null;
  tenantName: string;
  tenantSlug: string;
  invitedByName?: string | null;
};
