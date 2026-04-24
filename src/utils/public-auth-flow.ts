const AUTH_EMAIL_STORAGE_KEY = "fut7pro_auth_email";
const AUTH_SLUG_STORAGE_KEY = "fut7pro_auth_slug";
const AUTH_TURNSTILE_PROOF_STORAGE_KEY = "fut7pro_auth_turnstile_proof";
const AUTH_TURNSTILE_PROOF_EXPIRES_AT_STORAGE_KEY = "fut7pro_auth_turnstile_proof_expires_at";

type PublicAuthContext = {
  email: string;
  slug: string;
  turnstileProof?: string;
  turnstileProofExpiresAt?: number;
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

  const normalizedProof = context.turnstileProof?.trim() || "";
  const normalizedProofExpiresAt =
    typeof context.turnstileProofExpiresAt === "number" &&
    Number.isFinite(context.turnstileProofExpiresAt)
      ? context.turnstileProofExpiresAt
      : null;

  if (normalizedProof && normalizedProofExpiresAt && normalizedProofExpiresAt > Date.now()) {
    storage.setItem(AUTH_TURNSTILE_PROOF_STORAGE_KEY, normalizedProof);
    storage.setItem(AUTH_TURNSTILE_PROOF_EXPIRES_AT_STORAGE_KEY, String(normalizedProofExpiresAt));
    return;
  }

  storage.removeItem(AUTH_TURNSTILE_PROOF_STORAGE_KEY);
  storage.removeItem(AUTH_TURNSTILE_PROOF_EXPIRES_AT_STORAGE_KEY);
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

  const turnstileProof = storage.getItem(AUTH_TURNSTILE_PROOF_STORAGE_KEY)?.trim() || "";
  const parsedExpiresAt = Number.parseInt(
    storage.getItem(AUTH_TURNSTILE_PROOF_EXPIRES_AT_STORAGE_KEY) || "",
    10
  );
  const hasValidProof =
    turnstileProof && Number.isFinite(parsedExpiresAt) && parsedExpiresAt > Date.now();

  if (!hasValidProof) {
    storage.removeItem(AUTH_TURNSTILE_PROOF_STORAGE_KEY);
    storage.removeItem(AUTH_TURNSTILE_PROOF_EXPIRES_AT_STORAGE_KEY);
  }

  return {
    email,
    slug,
    ...(hasValidProof ? { turnstileProof, turnstileProofExpiresAt: parsedExpiresAt } : {}),
  };
}

export function clearPublicAuthContext() {
  const storage = getStorage();
  if (!storage) return;

  storage.removeItem(AUTH_EMAIL_STORAGE_KEY);
  storage.removeItem(AUTH_SLUG_STORAGE_KEY);
  storage.removeItem(AUTH_TURNSTILE_PROOF_STORAGE_KEY);
  storage.removeItem(AUTH_TURNSTILE_PROOF_EXPIRES_AT_STORAGE_KEY);
}
