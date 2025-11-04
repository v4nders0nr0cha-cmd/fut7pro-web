import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const JSON_CT = "application/json; charset=utf-8";
export const NOTIFICATIONS_ENDPOINT = "/notificacoes";

export type SessionUser = {
  accessToken?: string;
  tenantSlug?: string | null;
  tenantId?: string | null;
};

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return null;
  }
  return session.user as SessionUser;
}

export function jsonResponse(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", JSON_CT);
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return NextResponse.json(body, { ...init, headers });
}

export function resolveTenantSlug(
  user: SessionUser,
  ...candidates: Array<string | null | undefined>
) {
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }
  if (typeof user.tenantSlug === "string" && user.tenantSlug.length > 0) {
    return user.tenantSlug;
  }
  return null;
}

export function buildHeaders(
  user: SessionUser,
  tenantSlug: string | null,
  options?: { extra?: HeadersInit; includeContentType?: boolean }
) {
  if (!user.accessToken) {
    throw new Error("ACCESS_TOKEN_MISSING");
  }

  const headers = new Headers(options?.extra);
  headers.set("Authorization", `Bearer ${user.accessToken}`);
  headers.set("Accept", JSON_CT);

  const includeContentType = options?.includeContentType ?? true;
  if (includeContentType) {
    headers.set("Content-Type", JSON_CT);
  } else {
    headers.delete("Content-Type");
  }

  if (tenantSlug) {
    headers.set("x-tenant-slug", tenantSlug);
  }

  headers.set("Cache-Control", "no-store");
  return headers;
}

export async function proxyBackend(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  const contentType = response.headers.get("content-type") ?? "";
  const hasJson = contentType.includes("application/json");
  const body = hasJson ? await response.text() : null;
  return { response, body };
}

export function forwardResponse(status: number, body: string | null) {
  if (!body) {
    return new NextResponse(null, {
      status,
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  }

  try {
    const parsed = JSON.parse(body);
    return jsonResponse(parsed, { status });
  } catch {
    return new NextResponse(body, {
      status,
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}

export function ensureTenantId(user: SessionUser, provided?: string | null) {
  if (provided && provided.length > 0) {
    return provided;
  }
  if (user.tenantId && user.tenantId.length > 0) {
    return user.tenantId;
  }
  return null;
}
