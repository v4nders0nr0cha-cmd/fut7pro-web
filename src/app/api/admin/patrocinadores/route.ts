import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { revalidateTag } from "next/cache";
import { authOptions, type AuthSession } from "@/server/auth/options";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const JSON_CT = "application/json; charset=utf-8";
const SPONSORS_ENDPOINT = "/api/sponsors";

type SessionUser = {
  accessToken?: string;
  tenantSlug?: string | null;
};

async function requireSession() {
  const session = (await getServerSession(authOptions)) as AuthSession | null;
  if (!session || !session.user) {
    return null;
  }
  return session.user as SessionUser;
}

function resolveTenantSlug(user: SessionUser, explicit: string | null): string | null {
  if (explicit) return explicit;
  if (typeof user.tenantSlug === "string" && user.tenantSlug.length > 0) return user.tenantSlug;
  return null;
}

function buildHeaders(
  user: SessionUser,
  tenantSlug: string | null,
  options?: { extra?: HeadersInit; withJsonContentType?: boolean }
) {
  const headers = new Headers(options?.extra);
  const token = user.accessToken;
  if (!token) {
    throw new Error("ACCESS_TOKEN_MISSING");
  }
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", JSON_CT);
  const includeContentType = options?.withJsonContentType ?? true;
  if (includeContentType && !headers.has("Content-Type")) {
    headers.set("Content-Type", JSON_CT);
  } else if (!includeContentType) {
    headers.delete("Content-Type");
  }
  if (tenantSlug) {
    headers.set("x-tenant-slug", tenantSlug);
  }
  return headers;
}

async function proxyBackend(
  input: RequestInfo,
  init?: RequestInit
): Promise<{ response: Response; body: string | null }> {
  const res = await fetch(input, init);
  const contentType = res.headers.get("content-type");
  const hasBody = contentType?.includes("application/json") ?? false;
  const text = hasBody ? await res.text() : null;
  return { response: res, body: text };
}

async function revalidateSponsors(tenantSlug: string | null) {
  if (!tenantSlug) return;
  try {
    revalidateTag(`sponsors:${tenantSlug}`);
    revalidateTag(`footer:${tenantSlug}`);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Falha ao revalidar tags de patrocinadores:", error);
    }
  }
}

function jsonResponse(body: any, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", JSON_CT);
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return NextResponse.json(body, { ...init, headers });
}

function forwardResponse(status: number, bodyText: string | null) {
  if (!bodyText || bodyText.length === 0) {
    return new NextResponse(null, {
      status,
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  }

  try {
    const json = JSON.parse(bodyText);
    return jsonResponse(json, { status });
  } catch {
    return new NextResponse(bodyText, {
      status,
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}

export async function GET(req: NextRequest) {
  const user = await requireSession();
  if (!user) {
    return jsonResponse({ error: "Não autenticado" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const explicitSlug = searchParams.get("slug");
  const tenantSlug = resolveTenantSlug(user, explicitSlug);
  if (!tenantSlug) {
    return jsonResponse({ error: "Tenant slug obrigatório" }, { status: 400 });
  }

  const base = getApiBase();
  const url = `${base}${SPONSORS_ENDPOINT}`;

  try {
    const headers = buildHeaders(user, tenantSlug, {
      extra: { "Cache-Control": "no-store" },
      withJsonContentType: false,
    });
    const { response, body } = await proxyBackend(url, { method: "GET", headers });
    return forwardResponse(response.status, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse(
      { error: "Falha ao consultar patrocinadores", details: message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await requireSession();
  if (!user) {
    return jsonResponse({ error: "Não autenticado" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const explicitSlug = searchParams.get("slug");
  const tenantSlug = resolveTenantSlug(user, explicitSlug);
  if (!tenantSlug) {
    return jsonResponse({ error: "Tenant slug obrigatório" }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    payload = undefined;
  }

  const base = getApiBase();
  const url = `${base}${SPONSORS_ENDPOINT}`;

  try {
    const headers = buildHeaders(user, tenantSlug);
    const { response, body } = await proxyBackend(url, {
      method: "POST",
      headers,
      body: payload ? JSON.stringify(payload) : undefined,
    });

    if (response.ok) {
      await revalidateSponsors(tenantSlug);
    }
    return forwardResponse(response.status, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse(
      { error: "Falha ao criar patrocinador", details: message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const user = await requireSession();
  if (!user) {
    return jsonResponse({ error: "Não autenticado" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const explicitSlug = searchParams.get("slug");
  const tenantSlug = resolveTenantSlug(user, explicitSlug);
  if (!tenantSlug) {
    return jsonResponse({ error: "Tenant slug obrigatório" }, { status: 400 });
  }

  let payload: any = null;
  try {
    payload = await req.json();
  } catch {
    payload = null;
  }

  if (!payload || typeof payload.id !== "string") {
    return jsonResponse({ error: "ID obrigatório para atualização" }, { status: 400 });
  }

  const { id, ...data } = payload;
  const base = getApiBase();
  const url = `${base}${SPONSORS_ENDPOINT}/${encodeURIComponent(id)}`;

  try {
    const headers = buildHeaders(user, tenantSlug);
    const { response, body } = await proxyBackend(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    if (response.ok) {
      await revalidateSponsors(tenantSlug);
    }
    return forwardResponse(response.status, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse(
      { error: "Falha ao atualizar patrocinador", details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const user = await requireSession();
  if (!user) {
    return jsonResponse({ error: "Não autenticado" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const explicitSlug = searchParams.get("slug");
  const tenantSlug = resolveTenantSlug(user, explicitSlug);
  if (!tenantSlug) {
    return jsonResponse({ error: "Tenant slug obrigatório" }, { status: 400 });
  }

  let targetId = searchParams.get("id");
  if (!targetId) {
    try {
      const payload = await req.json();
      if (payload && typeof payload.id === "string") {
        targetId = payload.id;
      }
    } catch {
      // ignore body parse errors
    }
  }

  if (!targetId) {
    return jsonResponse({ error: "ID obrigatório para remoção" }, { status: 400 });
  }

  const base = getApiBase();
  const url = `${base}${SPONSORS_ENDPOINT}/${encodeURIComponent(targetId)}`;

  try {
    const headers = buildHeaders(user, tenantSlug, { withJsonContentType: false });
    const { response, body } = await proxyBackend(url, {
      method: "DELETE",
      headers,
    });
    if (response.ok || response.status === 204) {
      await revalidateSponsors(tenantSlug);
    }
    return forwardResponse(response.status, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse(
      { error: "Falha ao excluir patrocinador", details: message },
      { status: 500 }
    );
  }
}
