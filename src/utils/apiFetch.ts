import { getServerSession } from "next-auth";

import { authOptions } from "@/server/auth/options";

function ensureServerSide() {
  if (typeof window !== "undefined") {
    throw new Error("authedFetch is only available on the server");
  }
}

/**
 * Server-side only. Usa a sessao para injetar Authorization e x-tenant-slug.
 * Use em server actions, Route Handlers e loaders no App Router.
 */
export async function authedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  ensureServerSide();

  const session = await getServerSession(authOptions);
  const headers = new Headers(init.headers);

  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const slug =
    session?.user?.rachaSlug ?? session?.user?.tenantSlug ?? (session as any)?.tenantSlug;
  if (slug) {
    headers.set("x-tenant-slug", slug);
  }

  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  return fetch(input, { ...init, headers });
}
