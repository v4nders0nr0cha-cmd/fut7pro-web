export const ADMIN_ROLES = [
  "SUPERADMIN",
  "ADMIN",
  "PRESIDENTE",
  "VICE",
  "DIRETOR_FUTEBOL",
  "DIRETOR_FINANCEIRO",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

type LegacyRoleMap = Record<string, AdminRole>;

const LEGACY_ROLES: LegacyRoleMap = {
  SUPERADMIN: "SUPERADMIN",
  ADMIN: "ADMIN",
  PRESIDENTE: "PRESIDENTE",
  VICEPRESIDENTE: "VICE",
  VICE_PRESIDENTE: "VICE",
  VICEPRESIDENT: "VICE",
  VICE: "VICE",
  DIRETORFUTEBOL: "DIRETOR_FUTEBOL",
  "DIRETOR-FUTEBOL": "DIRETOR_FUTEBOL",
  DIRETOR_FUTEBOL: "DIRETOR_FUTEBOL",
  "DIRETOR DE FUTEBOL": "DIRETOR_FUTEBOL",
  DIRETORFINANCEIRO: "DIRETOR_FINANCEIRO",
  "DIRETOR-FINANCEIRO": "DIRETOR_FINANCEIRO",
  DIRETOR_FINANCEIRO: "DIRETOR_FINANCEIRO",
  "DIRETOR DE FINANCEIRO": "DIRETOR_FINANCEIRO",
};

function toKey(role?: string | null): string | null {
  if (!role) return null;
  const key = role.trim().toUpperCase();
  return key.length ? key : null;
}

export function normalizeAdminRole(role?: string | null): AdminRole | null {
  const key = toKey(role);
  if (!key) return null;
  if ((ADMIN_ROLES as readonly string[]).includes(key)) {
    return key as AdminRole;
  }
  const mapped = LEGACY_ROLES[key];
  return mapped ?? null;
}

export function isAdminRole(role?: string | null): role is AdminRole {
  return normalizeAdminRole(role) !== null;
}
