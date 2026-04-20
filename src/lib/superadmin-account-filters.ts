import type { Usuario, UsuarioMembership } from "@/types/superadmin";

export const ACCOUNT_ROLE_LABELS: Record<string, string> = {
  PRESIDENTE: "Presidente",
  VICE_PRESIDENTE: "Vice-Presidente",
  DIRETOR_FUTEBOL: "Diretor de Futebol",
  DIRETOR_FINANCEIRO: "Diretor Financeiro",
  ADMIN: "Admin",
  SUPERADMIN: "SuperAdmin",
  ATLETA: "Atleta",
};

export const ACCOUNT_ROLE_OPTIONS = [
  "PRESIDENTE",
  "VICE_PRESIDENTE",
  "DIRETOR_FUTEBOL",
  "DIRETOR_FINANCEIRO",
  "ADMIN",
  "ATLETA",
] as const;

export type AccountFilters = {
  name: string;
  email: string;
  tenant: string;
  status: "" | "active" | "disabled";
  verification: "" | "verified" | "unverified";
  provider: "" | "google" | "credentials";
  role: string;
  tenantCount: "" | "0" | "1" | "2plus";
  lastLogin: "" | "today" | "7d" | "15d" | "30d" | "60d" | "90d" | "never";
  inactivity: "" | "30" | "60" | "90" | "120";
  createdFrom: string;
  createdTo: string;
  operational: "" | "abandoned" | "noTenant" | "disabledLong" | "unverifiedNoLogin";
};

export type AccountFilterChip = {
  key: keyof AccountFilters | "search";
  label: string;
};

export const DEFAULT_ACCOUNT_FILTERS: AccountFilters = {
  name: "",
  email: "",
  tenant: "",
  status: "",
  verification: "",
  provider: "",
  role: "",
  tenantCount: "",
  lastLogin: "",
  inactivity: "",
  createdFrom: "",
  createdTo: "",
  operational: "",
};

const STATUS_LABELS: Record<NonNullable<AccountFilters["status"]>, string> = {
  "": "",
  active: "Ativas",
  disabled: "Desativadas",
};

const VERIFICATION_LABELS: Record<NonNullable<AccountFilters["verification"]>, string> = {
  "": "",
  verified: "Verificadas",
  unverified: "Nao verificadas",
};

const PROVIDER_LABELS: Record<NonNullable<AccountFilters["provider"]>, string> = {
  "": "",
  google: "Google",
  credentials: "Email/senha",
};

const TENANT_COUNT_LABELS: Record<NonNullable<AccountFilters["tenantCount"]>, string> = {
  "": "",
  "0": "0 rachas",
  "1": "1 racha",
  "2plus": "2+ rachas",
};

const LAST_LOGIN_LABELS: Record<NonNullable<AccountFilters["lastLogin"]>, string> = {
  "": "",
  today: "Login hoje",
  "7d": "Login nos ultimos 7 dias",
  "15d": "Login nos ultimos 15 dias",
  "30d": "Login nos ultimos 30 dias",
  "60d": "Login nos ultimos 60 dias",
  "90d": "Login nos ultimos 90 dias",
  never: "Nunca acessaram",
};

const INACTIVITY_LABELS: Record<NonNullable<AccountFilters["inactivity"]>, string> = {
  "": "",
  "30": "Sem login ha 30 dias",
  "60": "Sem login ha 60 dias",
  "90": "Sem login ha 90 dias",
  "120": "Sem login ha 120 dias",
};

const OPERATIONAL_LABELS: Record<NonNullable<AccountFilters["operational"]>, string> = {
  "": "",
  abandoned: "Potencialmente abandonadas",
  noTenant: "Sem racha",
  disabledLong: "Desativadas ha muito tempo",
  unverifiedNoLogin: "Nao verificadas sem login",
};

function normalize(value?: string | null) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function includesNormalized(value: string | undefined | null, term: string) {
  if (!term) return true;
  return normalize(value).includes(term);
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    const [, year, month, day] = dateOnly;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function daysSince(value: Date | null, now: Date) {
  if (!value) return null;
  return Math.floor((startOfDay(now).getTime() - startOfDay(value).getTime()) / 86_400_000);
}

function isWithinDays(value: Date | null, days: number, now: Date) {
  const diff = daysSince(value, now);
  return diff !== null && diff >= 0 && diff <= days;
}

export function resolveAccountProviderKey(provider?: string | null) {
  const normalized = normalize(provider);
  if (!normalized || normalized === "credentials") return "credentials";
  if (normalized === "google") return "google";
  return normalized;
}

export function getAccountMemberships(user: Usuario): UsuarioMembership[] {
  return Array.isArray(user.memberships) ? user.memberships : [];
}

export function getAccountTenantCount(user: Usuario) {
  const tenantIds = new Set<string>();
  getAccountMemberships(user).forEach((membership) => {
    const key = membership.tenantId || membership.tenantSlug || membership.tenantNome;
    if (key) tenantIds.add(String(key));
  });
  if (user.tenantId || user.tenantSlug || user.tenantNome) {
    tenantIds.add(String(user.tenantId || user.tenantSlug || user.tenantNome));
  }
  return tenantIds.size;
}

export function getAccountTenantTerms(user: Usuario) {
  return [
    user.tenantId,
    user.tenantSlug,
    user.tenantNome,
    ...getAccountMemberships(user).flatMap((membership) => [
      membership.tenantId,
      membership.tenantSlug,
      membership.tenantNome,
    ]),
  ].filter(Boolean) as string[];
}

export function getAccountRoleTerms(user: Usuario) {
  const roles = [
    user.role,
    ...getAccountMemberships(user).map((membership) => membership.role),
  ].filter(Boolean) as string[];
  return roles.flatMap((role) => {
    const normalizedRole = String(role).toUpperCase();
    return [normalizedRole, ACCOUNT_ROLE_LABELS[normalizedRole] || normalizedRole];
  });
}

export function getAccountDeletionBlockers(user: Usuario) {
  const blockers: string[] = [];
  const tenantCount = getAccountTenantCount(user);
  if (user.superadmin) blockers.push("conta SuperAdmin");
  if (tenantCount > 0) blockers.push(`${tenantCount} racha(s) vinculado(s)`);
  return blockers;
}

export function filterSuperAdminAccounts(
  users: Usuario[],
  search: string,
  filters: AccountFilters,
  now = new Date()
) {
  const searchTerm = normalize(search);
  const nameTerm = normalize(filters.name);
  const emailTerm = normalize(filters.email);
  const tenantTerm = normalize(filters.tenant);
  const roleFilter = normalize(filters.role);
  const createdFrom = parseDate(filters.createdFrom);
  const createdTo = parseDate(filters.createdTo);

  return users.filter((user) => {
    const memberships = getAccountMemberships(user);
    const tenantCount = getAccountTenantCount(user);
    const verified = Boolean(user.emailVerifiedAt || user.emailVerified);
    const disabled = Boolean(user.disabledAt);
    const provider = resolveAccountProviderKey(user.authProvider);
    const lastLogin = parseDate(user.lastLoginAt);
    const createdAt = parseDate(user.criadoEm);
    const disabledAt = parseDate(user.disabledAt);
    const inactiveDays = daysSince(lastLogin, now);
    const neverLoggedIn = !lastLogin;

    if (searchTerm) {
      const corpus = [
        user.nome,
        user.name,
        user.nickname,
        user.email,
        provider === "google" ? "google" : "email senha credentials",
        verified ? "verificado" : "nao verificado",
        disabled ? "desativada bloqueada" : "ativa",
        ...getAccountTenantTerms(user),
        ...getAccountRoleTerms(user),
        ...memberships.map((membership) => membership.status),
      ]
        .filter(Boolean)
        .map((value) => normalize(String(value)));

      if (!corpus.some((value) => value.includes(searchTerm))) return false;
    }

    if (
      nameTerm &&
      !includesNormalized(`${user.nome || user.name || ""} ${user.nickname || ""}`, nameTerm)
    ) {
      return false;
    }
    if (emailTerm && !includesNormalized(user.email, emailTerm)) return false;
    if (
      tenantTerm &&
      !getAccountTenantTerms(user).some((term) => normalize(term).includes(tenantTerm))
    ) {
      return false;
    }
    if (filters.status === "active" && disabled) return false;
    if (filters.status === "disabled" && !disabled) return false;
    if (filters.verification === "verified" && !verified) return false;
    if (filters.verification === "unverified" && verified) return false;
    if (filters.provider && provider !== filters.provider) return false;
    if (
      roleFilter &&
      !getAccountRoleTerms(user).some((role) => normalize(role).includes(roleFilter))
    ) {
      return false;
    }
    if (filters.tenantCount === "0" && tenantCount !== 0) return false;
    if (filters.tenantCount === "1" && tenantCount !== 1) return false;
    if (filters.tenantCount === "2plus" && tenantCount < 2) return false;

    if (filters.lastLogin === "never" && !neverLoggedIn) return false;
    if (filters.lastLogin === "today" && !isWithinDays(lastLogin, 0, now)) return false;
    if (["7d", "15d", "30d", "60d", "90d"].includes(filters.lastLogin)) {
      const limit = Number(filters.lastLogin.replace("d", ""));
      if (!isWithinDays(lastLogin, limit, now)) return false;
    }

    if (filters.inactivity) {
      const limit = Number(filters.inactivity);
      if (!neverLoggedIn && (inactiveDays === null || inactiveDays < limit)) return false;
    }

    if (createdFrom && (!createdAt || createdAt < startOfDay(createdFrom))) return false;
    if (createdTo) {
      const end = new Date(createdTo);
      end.setHours(23, 59, 59, 999);
      if (!createdAt || createdAt > end) return false;
    }

    if (filters.operational === "abandoned") {
      if (tenantCount > 0 || (!neverLoggedIn && (inactiveDays === null || inactiveDays < 90))) {
        return false;
      }
    }
    if (filters.operational === "noTenant" && tenantCount !== 0) return false;
    if (filters.operational === "disabledLong") {
      const disabledDays = daysSince(disabledAt, now);
      if (!disabled || disabledDays === null || disabledDays < 60) return false;
    }
    if (filters.operational === "unverifiedNoLogin" && (verified || !neverLoggedIn)) return false;

    return true;
  });
}

export function parseAccountFiltersFromSearchParams(params: URLSearchParams): AccountFilters {
  return {
    ...DEFAULT_ACCOUNT_FILTERS,
    name: params.get("nome") || "",
    email: params.get("email") || "",
    tenant: params.get("racha") || "",
    status: parseEnum(params.get("status"), ["active", "disabled"]),
    verification: parseEnum(params.get("verificacao"), ["verified", "unverified"]),
    provider: parseEnum(params.get("acesso"), ["google", "credentials"]),
    role: params.get("funcao") || "",
    tenantCount: parseEnum(params.get("rachas"), ["0", "1", "2plus"]),
    lastLogin: parseEnum(params.get("ultimoLogin"), [
      "today",
      "7d",
      "15d",
      "30d",
      "60d",
      "90d",
      "never",
    ]),
    inactivity: parseEnum(params.get("inatividade"), ["30", "60", "90", "120"]),
    createdFrom: params.get("criadoDe") || "",
    createdTo: params.get("criadoAte") || "",
    operational: parseEnum(params.get("segmento"), [
      "abandoned",
      "noTenant",
      "disabledLong",
      "unverifiedNoLogin",
    ]),
  };
}

export function writeAccountFiltersToSearchParams(
  params: URLSearchParams,
  search: string,
  filters: AccountFilters
) {
  const mapping: Array<[string, string]> = [
    ["q", search],
    ["nome", filters.name],
    ["email", filters.email],
    ["racha", filters.tenant],
    ["status", filters.status],
    ["verificacao", filters.verification],
    ["acesso", filters.provider],
    ["funcao", filters.role],
    ["rachas", filters.tenantCount],
    ["ultimoLogin", filters.lastLogin],
    ["inatividade", filters.inactivity],
    ["criadoDe", filters.createdFrom],
    ["criadoAte", filters.createdTo],
    ["segmento", filters.operational],
  ];

  mapping.forEach(([key, value]) => {
    const normalizedValue = String(value || "").trim();
    if (normalizedValue) {
      params.set(key, normalizedValue);
    } else {
      params.delete(key);
    }
  });
}

export function getAccountFilterChips(
  search: string,
  filters: AccountFilters
): AccountFilterChip[] {
  const chips: AccountFilterChip[] = [];
  if (search.trim()) chips.push({ key: "search", label: `Busca: ${search.trim()}` });
  if (filters.name.trim()) chips.push({ key: "name", label: `Nome: ${filters.name.trim()}` });
  if (filters.email.trim()) chips.push({ key: "email", label: `E-mail: ${filters.email.trim()}` });
  if (filters.tenant.trim())
    chips.push({ key: "tenant", label: `Racha: ${filters.tenant.trim()}` });
  if (filters.status) chips.push({ key: "status", label: STATUS_LABELS[filters.status] });
  if (filters.verification) {
    chips.push({ key: "verification", label: VERIFICATION_LABELS[filters.verification] });
  }
  if (filters.provider) chips.push({ key: "provider", label: PROVIDER_LABELS[filters.provider] });
  if (filters.role) {
    const role = filters.role.toUpperCase();
    chips.push({ key: "role", label: `Funcao: ${ACCOUNT_ROLE_LABELS[role] || filters.role}` });
  }
  if (filters.tenantCount) {
    chips.push({ key: "tenantCount", label: TENANT_COUNT_LABELS[filters.tenantCount] });
  }
  if (filters.lastLogin) {
    chips.push({ key: "lastLogin", label: LAST_LOGIN_LABELS[filters.lastLogin] });
  }
  if (filters.inactivity) {
    chips.push({ key: "inactivity", label: INACTIVITY_LABELS[filters.inactivity] });
  }
  if (filters.createdFrom)
    chips.push({ key: "createdFrom", label: `Criada de ${filters.createdFrom}` });
  if (filters.createdTo) chips.push({ key: "createdTo", label: `Criada ate ${filters.createdTo}` });
  if (filters.operational) {
    chips.push({ key: "operational", label: OPERATIONAL_LABELS[filters.operational] });
  }
  return chips;
}

function parseEnum<T extends string>(value: string | null, allowed: readonly T[]): T | "" {
  return allowed.includes(value as T) ? (value as T) : "";
}
