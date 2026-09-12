const AUTH_EMAIL_STORAGE_KEY = "fut7pro_auth_email";
const AUTH_SLUG_STORAGE_KEY = "fut7pro_auth_slug";
const AUTH_JOIN_MESSAGE_STORAGE_KEY = "fut7pro_auth_join_message";

type PublicAuthContext = {
  email: string;
  slug: string;
  joinMessage?: string | null;
};

function getStorage() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

export function persistPublicAuthContext(context: PublicAuthContext) {
  const storage = getStorage();
  if (!storage) return;

  const normalizedEmail = context.email.trim().toLowerCase();
  const normalizedSlug = context.slug.trim().toLowerCase();
  if (!normalizedEmail || !normalizedSlug) return;

  storage.setItem(AUTH_EMAIL_STORAGE_KEY, normalizedEmail);
  storage.setItem(AUTH_SLUG_STORAGE_KEY, normalizedSlug);

  const joinMessage = context.joinMessage?.trim();
  if (joinMessage) {
    storage.setItem(AUTH_JOIN_MESSAGE_STORAGE_KEY, joinMessage.slice(0, 500));
  } else {
    storage.removeItem(AUTH_JOIN_MESSAGE_STORAGE_KEY);
  }
}

export function readPublicAuthContext(currentSlug?: string | null): PublicAuthContext | null {
  const storage = getStorage();
  if (!storage) return null;

  const email = storage.getItem(AUTH_EMAIL_STORAGE_KEY)?.trim().toLowerCase() || "";
  const slug = storage.getItem(AUTH_SLUG_STORAGE_KEY)?.trim().toLowerCase() || "";
  if (!email || !slug) return null;

  const expectedSlug = currentSlug?.trim().toLowerCase() || "";
  if (expectedSlug && slug !== expectedSlug) {
    return null;
  }

  const joinMessage = storage.getItem(AUTH_JOIN_MESSAGE_STORAGE_KEY)?.trim() || null;
  return { email, slug, joinMessage };
}

export function clearPublicAuthContext() {
  const storage = getStorage();
  if (!storage) return;

  storage.removeItem(AUTH_EMAIL_STORAGE_KEY);
  storage.removeItem(AUTH_SLUG_STORAGE_KEY);
  storage.removeItem(AUTH_JOIN_MESSAGE_STORAGE_KEY);
}

type Fut7ProAccountProfile = {
  firstName?: string | null;
  name?: string | null;
  position?: string | null;
  birthDay?: number | null;
  birthMonth?: number | null;
};

export function isFut7ProAccountComplete(profile?: Fut7ProAccountProfile | null) {
  if (!profile) return false;

  const name = (profile.firstName || profile.name || "").trim();
  return Boolean(name && profile.position && profile.birthDay && profile.birthMonth);
}
