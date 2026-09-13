type SessionStatus = "authenticated" | "loading" | "unauthenticated";
type SessionLike =
  | {
      user?: Record<string, unknown> | null;
    }
  | null
  | undefined;

const TERMINAL_TOKEN_ERRORS = new Set(["RefreshAccessTokenError", "AccessTokenExpired"]);

export function hasUsableFut7ProSession(session: SessionLike, status: SessionStatus) {
  if (status !== "authenticated" || !session?.user) return false;
  const user = session.user as {
    accessToken?: string | null;
    accessTokenExp?: number | null;
    tokenError?: string | null;
  };
  const accessToken = String(user.accessToken || "").trim();
  if (!accessToken) return false;

  const tokenError = String(user.tokenError || "").trim();
  if (TERMINAL_TOKEN_ERRORS.has(tokenError)) return false;

  const exp = typeof user.accessTokenExp === "number" ? user.accessTokenExp : null;
  if (exp && exp <= Math.floor(Date.now() / 1000)) return false;

  return true;
}

export function hasTerminalFut7ProSessionError(session: SessionLike) {
  const tokenError = String(session?.user?.tokenError || "").trim();
  return TERMINAL_TOKEN_ERRORS.has(tokenError);
}
