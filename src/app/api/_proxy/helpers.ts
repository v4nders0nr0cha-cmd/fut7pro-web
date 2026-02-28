import { getServerSession } from "next-auth/next";
import { getToken } from "next-auth/jwt";
import { cookies as nextCookies, headers as nextHeaders } from "next/headers";
import { authOptions } from "@/server/auth/admin-options";
import { superAdminAuthOptions } from "@/server/auth/superadmin-options";
import {
  ADMIN_ACTIVE_TENANT_COOKIE,
  LEGACY_ADMIN_ACTIVE_TENANT_COOKIE,
} from "@/lib/admin-tenant-cookie";
const TENANT_SCOPE_QUERY_KEYS = new Set(["tenantid", "tenantslug", "rachaid", "slug"]);
const BLOCKED_QUERY_KEYS = new Set([
  "include",
  "select",
  "where",
  "expand",
  "populate",
  "fields",
  "projection",
  "relations",
  "join",
  "orderby",
  "$where",
  "$select",
  "$expand",
]);
const DEFAULT_ALLOWED_QUERY_KEYS = new Set([
  "page",
  "pagesize",
  "limit",
  "offset",
  "cursor",
  "q",
  "search",
  "query",
  "status",
  "category",
  "severity",
  "priority",
  "type",
  "scope",
  "period",
  "year",
  "quarter",
  "month",
  "date",
  "from",
  "to",
  "startdate",
  "enddate",
  "sort",
  "order",
  "unread",
  "isread",
  "read",
  "count",
  "channel",
  "groupkey",
  "source",
  "view",
  "tab",
  "competencia",
  "action",
]);

type UserLike = {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string;
  tenantId?: string;
  tenantSlug?: string | null;
  accessToken?: string;
  refreshToken?: string | null;
  accessTokenExp?: number | null;
};

const ADMIN_SESSION_COOKIE_CANDIDATES = [
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
  "next-auth.session-token-dev",
];

const SUPERADMIN_SESSION_COOKIE_CANDIDATES = [
  `next-auth.session-token-superadmin${process.env.NODE_ENV === "development" ? "-dev" : ""}`,
  "next-auth.session-token-superadmin",
  "next-auth.session-token-superadmin-dev",
  "__Secure-next-auth.session-token-superadmin",
];

function resolveRequestMeta() {
  const headers = nextHeaders();
  const forwardedFor = headers.get("x-forwarded-for") || "";
  const ip = (forwardedFor.split(",")[0] || headers.get("x-real-ip") || "unknown").trim();
  const userAgent = (headers.get("user-agent") || "unknown").slice(0, 160);
  const path = headers.get("x-invoke-path") || headers.get("next-url") || "unknown";
  return { ip, userAgent, path };
}

function logSuperAdminUnauthorized(reason: string) {
  const meta = resolveRequestMeta();
  console.warn(
    `[security][superadmin][unauthorized] reason=${reason} ip=${meta.ip} path=${meta.path} ua="${meta.userAgent}"`
  );
}

type AuthScope = "admin" | "superadmin";

function resolveCookieCandidates(scope: AuthScope) {
  return scope === "superadmin"
    ? SUPERADMIN_SESSION_COOKIE_CANDIDATES
    : ADMIN_SESSION_COOKIE_CANDIDATES;
}

async function resolveTokenFromCookies(scope: AuthScope) {
  for (const cookieName of resolveCookieCandidates(scope)) {
    try {
      const token = await getToken({
        req: {
          cookies: nextCookies(),
          headers: nextHeaders(),
        } as any,
        cookieName,
      });
      if (token) {
        return token as any;
      }
    } catch {
      // ignore and try next candidate
    }
  }
  return null;
}

function tokenToUser(token: any, fallback?: UserLike | null): UserLike | null {
  if (!token) return null;
  const accessToken = String(token?.accessToken || "").trim();
  if (!accessToken) return null;

  const id = String(token?.id || token?.sub || fallback?.id || "").trim();
  if (!id) return null;

  return {
    id,
    email: (token?.email as string | null | undefined) ?? fallback?.email ?? null,
    name: (token?.name as string | null | undefined) ?? fallback?.name ?? null,
    role: (token?.role as string | undefined) ?? fallback?.role,
    tenantId: (token?.tenantId as string | undefined) ?? fallback?.tenantId,
    tenantSlug: (token?.tenantSlug as string | null | undefined) ?? fallback?.tenantSlug ?? null,
    accessToken,
    refreshToken:
      (token?.refreshToken as string | null | undefined) ?? fallback?.refreshToken ?? null,
    accessTokenExp:
      (token?.accessTokenExp as number | null | undefined) ?? fallback?.accessTokenExp ?? null,
  };
}

async function mergeTokenUser(
  sessionUser: UserLike | null,
  scope: AuthScope
): Promise<UserLike | null> {
  if (!sessionUser) return null;
  if (sessionUser.accessToken) return sessionUser;

  try {
    const token = await resolveTokenFromCookies(scope);
    const fromToken = tokenToUser(token, sessionUser);
    return fromToken ?? sessionUser;
  } catch {
    return sessionUser;
  }
}

async function resolveSessionUser(session: unknown, scope: AuthScope): Promise<UserLike | null> {
  const sessionUser = (session as any)?.user ?? null;
  const merged = await mergeTokenUser(sessionUser, scope);
  if (!merged?.accessToken) return null;
  return merged;
}

async function resolveTokenOnlyUser(scope: AuthScope): Promise<UserLike | null> {
  const token = await resolveTokenFromCookies(scope);
  return tokenToUser(token, null);
}

export async function requireUser(): Promise<UserLike | null> {
  const adminSession = await getServerSession?.(authOptions as any);
  const adminUser = await resolveSessionUser(adminSession, "admin");
  if (adminUser) {
    return adminUser;
  }

  const superAdminSession = await getServerSession?.(superAdminAuthOptions as any);
  const superAdminUser = await resolveSessionUser(superAdminSession, "superadmin");
  if (superAdminUser) {
    return superAdminUser;
  }

  return (await resolveTokenOnlyUser("admin")) ?? (await resolveTokenOnlyUser("superadmin"));
}

export async function requireSuperAdminUser(): Promise<UserLike | null> {
  const session = await getServerSession?.(superAdminAuthOptions as any);
  const user =
    (await resolveSessionUser(session, "superadmin")) ?? (await resolveTokenOnlyUser("superadmin"));
  if (!user) {
    logSuperAdminUnauthorized("missing_session");
    return null;
  }

  const role = String(user.role || "").toUpperCase();
  if (role !== "SUPERADMIN") {
    logSuperAdminUnauthorized("invalid_role");
    return null;
  }

  return user;
}

export function resolveTenantSlug(user: UserLike, slug?: string) {
  const cookieSlug =
    nextCookies().get(ADMIN_ACTIVE_TENANT_COOKIE)?.value?.trim() ||
    nextCookies().get(LEGACY_ADMIN_ACTIVE_TENANT_COOKIE)?.value?.trim();
  const sessionSlug = String(user.tenantSlug || (user as any).slug || "").trim();
  const requestedSlug = String(slug || "").trim();
  const tenantId = String(user.tenantId || "").trim();

  // Segurança multi-tenant: o escopo ativo vem do cookie/hub; não permitimos
  // que query/body do client sobrescreva um tenant já definido na sessão.
  if (cookieSlug) return cookieSlug;
  if (sessionSlug) return sessionSlug;
  if (tenantId) return tenantId;
  if (requestedSlug) return requestedSlug;
  return null;
}

export function appendSafeQueryParams(
  source: URLSearchParams,
  target: URL,
  options?: { allowTenantKeys?: boolean; allowedKeys?: string[] }
) {
  const allowed = new Set(DEFAULT_ALLOWED_QUERY_KEYS);
  if (Array.isArray(options?.allowedKeys)) {
    options?.allowedKeys.forEach((key) => {
      const normalized = String(key || "")
        .trim()
        .toLowerCase();
      if (normalized) {
        allowed.add(normalized);
      }
    });
  }

  source.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();
    if (!options?.allowTenantKeys && TENANT_SCOPE_QUERY_KEYS.has(normalizedKey)) {
      return;
    }
    if (BLOCKED_QUERY_KEYS.has(normalizedKey)) {
      return;
    }
    if (!allowed.has(normalizedKey)) {
      return;
    }
    target.searchParams.set(key, value);
  });
}

export function buildHeaders(
  user: UserLike,
  tenantSlug?: string,
  options?: { includeContentType?: boolean }
) {
  const headers: Record<string, string> = {};

  if (user.accessToken) {
    headers.Authorization = `Bearer ${user.accessToken}`;
  }

  if (tenantSlug) {
    headers["x-tenant-slug"] = tenantSlug;
    // header auxiliar para compatibilidade / diagnóstico
    headers["x-tenant-id"] = tenantSlug;
  }

  if (options?.includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

export function forwardResponse(status: number, body: string | object) {
  if (typeof body === "object") {
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(body, { status });
}

export function jsonResponse(data: object, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
}

export async function proxyBackend(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const bodyText = await response.text();

  let body: any = bodyText;
  try {
    body = JSON.parse(bodyText);
  } catch {
    // ignore JSON parse errors, fallback to text
  }

  return { response, body };
}
