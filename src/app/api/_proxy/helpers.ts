import { getServerSession } from "next-auth/next";
import { getToken } from "next-auth/jwt";
import { cookies as nextCookies, headers as nextHeaders } from "next/headers";
import { authOptions } from "@/server/auth/admin-options";
import { superAdminAuthOptions } from "@/server/auth/superadmin-options";

const ACTIVE_TENANT_COOKIE = "fut7pro_active_tenant";

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

async function mergeTokenUser(sessionUser: UserLike | null): Promise<UserLike | null> {
  if (!sessionUser) return null;
  if (sessionUser.accessToken) return sessionUser;

  try {
    const token = await getToken({
      req: {
        cookies: nextCookies(),
        headers: nextHeaders(),
      } as any,
    });

    if (!token) return sessionUser;

    return {
      ...sessionUser,
      id: token.id ? String(token.id) : sessionUser.id,
      email: (token as any).email ?? sessionUser.email ?? null,
      name: (token as any).name ?? sessionUser.name ?? null,
      role: (token as any).role ?? sessionUser.role,
      tenantId: (token as any).tenantId ?? sessionUser.tenantId,
      tenantSlug: (token as any).tenantSlug ?? sessionUser.tenantSlug ?? null,
      accessToken: (token as any).accessToken ?? sessionUser.accessToken,
      refreshToken: (token as any).refreshToken ?? sessionUser.refreshToken ?? null,
      accessTokenExp: (token as any).accessTokenExp ?? sessionUser.accessTokenExp ?? null,
    };
  } catch {
    return sessionUser;
  }
}

async function resolveSessionUser(session: unknown): Promise<UserLike | null> {
  const sessionUser = (session as any)?.user ?? null;
  const merged = await mergeTokenUser(sessionUser);
  if (!merged?.accessToken) return null;
  return merged;
}

export async function requireUser(): Promise<UserLike | null> {
  let session = await getServerSession?.(authOptions as any);
  if (!session) {
    session = await getServerSession?.(superAdminAuthOptions as any);
  }
  return resolveSessionUser(session);
}

export async function requireSuperAdminUser(): Promise<UserLike | null> {
  const session = await getServerSession?.(superAdminAuthOptions as any);
  return resolveSessionUser(session);
}

export function resolveTenantSlug(user: UserLike, slug?: string) {
  const cookieSlug = nextCookies().get(ACTIVE_TENANT_COOKIE)?.value;
  return slug || cookieSlug || user.tenantSlug || (user as any).slug || user.tenantId || null;
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
