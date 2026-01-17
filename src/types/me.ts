export type MembershipRole =
  | "PRESIDENTE"
  | "VICE_PRESIDENTE"
  | "DIRETOR_FUTEBOL"
  | "DIRETOR_FINANCEIRO"
  | "ADMIN"
  | "SUPERADMIN"
  | "ATLETA";

export type MeAthlete = {
  id: string;
  slug: string;
  firstName: string;
  nickname?: string | null;
  position?: string | null;
  positionSecondary?: string | null;
  avatarUrl?: string | null;
  status?: string | null;
  mensalista?: boolean | null;
  birthDay?: number | null;
  birthMonth?: number | null;
  birthYear?: number | null;
  birthPublic?: boolean | null;
};

export type MeResponse = {
  user: {
    id: string;
    email: string | null;
    avatarUrl?: string | null;
  };
  tenant: {
    tenantId: string;
    tenantSlug: string;
  } | null;
  membership: {
    role: MembershipRole | string;
    status?: string | null;
  } | null;
  athlete: MeAthlete | null;
};
