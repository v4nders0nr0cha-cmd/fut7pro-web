import { getSession } from "next-auth/react";
import { mutate } from "swr";

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
};

export async function syncPublicAuthState(options: SyncPublicAuthStateOptions = {}) {
  const refreshSession = options.refreshSession;

  try {
    if (refreshSession) {
      await refreshSession();
    } else {
      await getSession();
    }
  } catch {
    await getSession().catch(() => null);
  }

  const keys = [
    "/api/perfil/global",
    buildPublicAthleteMeKey(options.publicSlug),
    buildPublicUnreadCountKey(options.publicSlug),
  ].filter((key): key is string => Boolean(key));

  await Promise.all(keys.map((key) => mutate(key).catch(() => null)));
}
