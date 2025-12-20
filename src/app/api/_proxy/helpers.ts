import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authOptions as superAdminAuthOptions } from "@/app/api/superadmin-auth/[...nextauth]/route";

type UserLike = {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string;
  tenantId?: string;
  tenantSlug?: string | null;
  accessToken?: string;
};

export async function requireUser(): Promise<UserLike | null> {
  let session = await getServerSession?.(authOptions as any);
  if (!session) {
    session = await getServerSession?.(superAdminAuthOptions as any);
  }
  return (session as any)?.user ?? null;
}

export async function requireSuperAdminUser(): Promise<UserLike | null> {
  const session = await getServerSession?.(superAdminAuthOptions as any);
  return (session as any)?.user ?? null;
}

export function resolveTenantSlug(user: UserLike, slug?: string) {
  return slug || user.tenantSlug || (user as any).slug || user.tenantId || null;
}

export function buildHeaders(
  user: UserLike,
  tenantSlug?: string,
  options?: { includeContentType?: boolean }
) {
  const headers: Record<string, string> = {
    Authorization: user.accessToken ? `Bearer ${user.accessToken}` : "",
  };

  if (tenantSlug) {
    headers["x-tenant-slug"] = tenantSlug;
    // header auxiliar para compatibilidade / diagn�stico
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
