import { getSession } from "next-auth/react";
import { mutate } from "swr";
import { hasUsableFut7ProSession } from "@/utils/fut7pro-session";

function normalizeSlug(slug?: string | null) {
  const normalized = slug?.trim().toLowerCase() || "";
  return normalized || null;
}

export function buildPublicAthleteMeKey(slug?: string | null) {
  const normalizedSlug = normalizeSlug(slug);
  return normalizedSlug ? `/api/me?slug=${normalizedSlug}&context=athlete` : null;
}

export function buildPublicUnreadCountKey(slug?: string | null) {
  const normalizedSlug = normalizeSlug(slug);
  return normalizedSlug ? `/api/public/${normalizedSlug}/notifications/unread-count` : null;
}

type SyncPublicAuthStateOptions = {
  publicSlug?: string | null;
  refreshSession?: () => Promise<unknown>;
  waitForProviderSession?: () => Promise<unknown>;
};

export async function syncPublicAuthState(options: SyncPublicAuthStateOptions = {}) {
  const serverSession = await getSession();
  if (!hasUsableFut7ProSession(serverSession, "authenticated")) {
    throw new Error("PUBLIC_SESSION_NOT_CONFIRMED");
  }

  const providerSession = options.refreshSession
    ? await options.refreshSession()
    : options.waitForProviderSession
      ? await options.waitForProviderSession()
      : serverSession;
  if (!hasUsableFut7ProSession(providerSession as typeof serverSession, "authenticated")) {
    throw new Error("PUBLIC_SESSION_PROVIDER_NOT_SYNCED");
  }

  const keys = [
    "/api/perfil/global",
    buildPublicAthleteMeKey(options.publicSlug),
    buildPublicUnreadCountKey(options.publicSlug),
  ].filter((key): key is string => Boolean(key));

  await Promise.all(keys.map((key) => mutate(key).catch(() => null)));

  return providerSession;
}
