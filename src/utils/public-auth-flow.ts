const AUTH_EMAIL_STORAGE_KEY = "fut7pro_auth_email";
const AUTH_SLUG_STORAGE_KEY = "fut7pro_auth_slug";

type PublicAuthContext = {
  email: string;
  slug: string;
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

  return { email, slug };
}

export function clearPublicAuthContext() {
  const storage = getStorage();
  if (!storage) return;

  storage.removeItem(AUTH_EMAIL_STORAGE_KEY);
  storage.removeItem(AUTH_SLUG_STORAGE_KEY);
}
