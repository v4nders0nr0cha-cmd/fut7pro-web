export type AuthRealm = "athlete" | "admin" | "superadmin";

type SessionLike = {
  user?: {
    role?: string | null;
    authRealm?: string | null;
  } | null;
} | null;

const ATHLETE_ROLES = new Set(["ATLETA"]);
const SUPERADMIN_ROLES = new Set(["SUPERADMIN"]);

export function inferAuthRealmFromRole(role?: string | null): AuthRealm {
  const normalizedRole = String(role || "")
    .trim()
    .toUpperCase();

  if (SUPERADMIN_ROLES.has(normalizedRole)) return "superadmin";
  if (ATHLETE_ROLES.has(normalizedRole)) return "athlete";
  return "admin";
}

export function normalizeAuthRealm(value?: string | null): AuthRealm | null {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (normalized === "athlete" || normalized === "admin" || normalized === "superadmin") {
    return normalized;
  }
  return null;
}

export function resolveAuthRealm(input?: { role?: string | null; authRealm?: string | null }) {
  return normalizeAuthRealm(input?.authRealm) ?? inferAuthRealmFromRole(input?.role);
}

export function isAthleteSession(session?: SessionLike) {
  return resolveAuthRealm(session?.user ?? undefined) === "athlete";
}
