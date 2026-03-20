import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const backendBase =
  process.env.BACKEND_URL || process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "";
const TENANT_CACHE_TTL_MS = Number(process.env.PUBLIC_TENANT_CACHE_TTL_MS || 15000);
const TENANT_CACHE_STALE_MS = Number(process.env.PUBLIC_TENANT_CACHE_STALE_MS || 300000);
const PUBLIC_TENANT_CACHE_CONTROL = "public, max-age=15, s-maxage=30, stale-while-revalidate=120";

type TenantCacheEntry = {
  body: string;
  contentType: string;
  status: number;
  fetchedAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __fut7proPublicTenantCache: Map<string, TenantCacheEntry> | undefined;
}

function getTenantCacheStore() {
  if (!globalThis.__fut7proPublicTenantCache) {
    globalThis.__fut7proPublicTenantCache = new Map<string, TenantCacheEntry>();
  }
  return globalThis.__fut7proPublicTenantCache;
}

function toCacheKey(slug: string) {
  return slug.trim().toLowerCase();
}

function json(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return NextResponse.json(body, { ...init, headers });
}

function tenantResponse(entry: TenantCacheEntry, cacheState: "hit" | "miss" | "stale-on-429") {
  const headers = new Headers();
  headers.set("Content-Type", entry.contentType || "application/json; charset=utf-8");
  headers.set("Cache-Control", PUBLIC_TENANT_CACHE_CONTROL);
  headers.set("Vary", "Accept-Encoding");
  headers.set("X-Fut7Pro-Cache", cacheState);
  if (cacheState === "stale-on-429") {
    headers.set("Warning", '110 - "Response is stale due to upstream throttling"');
  }

  return new NextResponse(entry.body, {
    status: entry.status,
    headers,
  });
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  if (!backendBase) {
    return json({ error: "BACKEND_URL nao configurado" }, { status: 500 });
  }

  const cacheKey = toCacheKey(params.slug);
  const cacheStore = getTenantCacheStore();
  const cached = cacheStore.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.fetchedAt <= TENANT_CACHE_TTL_MS) {
    return tenantResponse(cached, "hit");
  }

  const url = new URL(
    `${backendBase.replace(/\/+$/, "")}/public/${encodeURIComponent(params.slug)}/tenant`
  );

  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  try {
    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: {
        "x-tenant-slug": params.slug,
      },
    });
    const body = await res.text();

    if (!res.ok) {
      if (res.status === 429 && cached && now - cached.fetchedAt <= TENANT_CACHE_STALE_MS) {
        return tenantResponse(cached, "stale-on-429");
      }
      return json(
        { error: "Falha ao consultar racha", status: res.status, body },
        { status: res.status }
      );
    }

    const nextEntry: TenantCacheEntry = {
      body,
      contentType: res.headers.get("content-type") || "application/json; charset=utf-8",
      status: res.status,
      fetchedAt: now,
    };
    cacheStore.set(cacheKey, nextEntry);

    return tenantResponse(nextEntry, "miss");
  } catch (error) {
    if (cached && now - cached.fetchedAt <= TENANT_CACHE_STALE_MS) {
      return tenantResponse(cached, "stale-on-429");
    }
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return json({ error: "Falha ao consultar racha", details: message }, { status: 500 });
  } finally {
    if (cacheStore.size > 500) {
      for (const [key, entry] of cacheStore.entries()) {
        if (now - entry.fetchedAt > TENANT_CACHE_STALE_MS) {
          cacheStore.delete(key);
        }
      }
      if (cacheStore.size > 500) {
        const overflow = cacheStore.size - 500;
        const keys = [...cacheStore.keys()].slice(0, overflow);
        keys.forEach((key) => cacheStore.delete(key));
      }
    }
  }
}
