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

export type OwnershipTransferCandidate = {
  id: string;
  name: string;
  nickname?: string | null;
  avatarUrl?: string | null;
  position?: string | null;
  email: string;
  currentRole: AdminRoleKey | "ATLETA";
};

export type OwnershipTransferStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "EXPIRED";

export type OwnershipTransferRequest = {
  id: string;
  tenantId: string;
  tenantName?: string | null;
  tenantSlug?: string | null;
  requestedByUserId: string;
  requestedByName?: string | null;
  recipientUserId: string;
  recipientName?: string | null;
  recipientEmail?: string | null;
  recipientAthleteId?: string | null;
  status: OwnershipTransferStatus;
  expiresAt: string;
  emailSentAt?: string | null;
  emailDeliveryStatus: "PENDING" | "SENT" | "FAILED";
  deliveryAttempts: number;
  lastDeliveryError?: string | null;
  respondedAt?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};
