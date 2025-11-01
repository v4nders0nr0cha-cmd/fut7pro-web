import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getApiBase } from "@/lib/get-api-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const JSON_CT = "application/json; charset=utf-8";
const ALLOWED_PARAMS = new Set([
  "type",
  "format",
  "limit",
  "position",
  "period",
  "year",
  "quarter",
  "start",
  "end",
]);

type SessionUser = {
  accessToken?: string;
  tenantSlug?: string | null;
};

function jsonResponse(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", JSON_CT);
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return NextResponse.json(body, { ...init, headers });
}

function resolveTenantSlug(user: SessionUser, explicit?: string | null) {
  if (explicit && explicit.trim().length > 0) {
    return explicit.trim();
  }
  if (user.tenantSlug && user.tenantSlug.trim().length > 0) {
    return user.tenantSlug.trim();
  }
  return null;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;

  if (!user || !user.accessToken) {
    return jsonResponse({ error: "Não autenticado" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const explicitSlug = searchParams.get("slug");
  const tenantSlug = resolveTenantSlug(user, explicitSlug);

  if (!tenantSlug) {
    return jsonResponse({ error: "Tenant slug obrigatório" }, { status: 400 });
  }

  const backendUrl = new URL("/rankings/export/player", getApiBase());
  ALLOWED_PARAMS.forEach((key) => {
    const value = searchParams.get(key);
    if (value && value.length > 0) {
      backendUrl.searchParams.set(key, value);
    }
  });

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${user.accessToken}`);
  headers.set("Accept", "*/*");
  headers.set("x-tenant-slug", tenantSlug);

  try {
    const backendResponse = await fetch(backendUrl, {
      headers,
      cache: "no-store",
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      try {
        const parsed = JSON.parse(errorText);
        return jsonResponse(parsed, { status: backendResponse.status });
      } catch {
        return jsonResponse(
          {
            error: "Falha ao exportar rankings",
            details: errorText || backendResponse.statusText,
          },
          { status: backendResponse.status }
        );
      }
    }

    const responseHeaders = new Headers();
    const contentType = backendResponse.headers.get("content-type");
    if (contentType) {
      responseHeaders.set("Content-Type", contentType);
    }
    const disposition = backendResponse.headers.get("content-disposition");
    if (disposition) {
      responseHeaders.set("Content-Disposition", disposition);
    }
    responseHeaders.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    responseHeaders.set("Pragma", "no-cache");
    responseHeaders.set("Expires", "0");

    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return jsonResponse(
      { error: "Erro ao contatar o backend de rankings", details: message },
      { status: 500 }
    );
  }
}
