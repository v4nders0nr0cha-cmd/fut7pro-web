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
