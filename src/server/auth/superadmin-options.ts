import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import { inferAuthRealmFromRole } from "@/lib/auth/realm";

const API_BASE_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SUPERADMIN_REFRESH_MARGIN_SECONDS = 120;
const SUPERADMIN_EXPIRED_REFRESH_FAILURE_GRACE_MS = 120_000;
const SUPERADMIN_EXPIRED_REFRESH_MAX_RETRIES = 3;

type RefreshResult = { ok: true; accessToken: string; refreshToken: string } | { ok: false };

const superAdminRefreshFlights = new Map<string, Promise<RefreshResult>>();

const normalizeAuthPath = (value: string | undefined | null, fallback: string) => {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/auth/")) return fallback;
  const parts = trimmed.split("/");
  const last = parts[parts.length - 1].toLowerCase();
  if (["login", "refresh", "me"].includes(last)) {
    return `/auth/${last}`;
  }
  return fallback;
};

const LOGIN_PATH = normalizeAuthPath(process.env.AUTH_LOGIN_PATH, "/auth/login");
const REFRESH_PATH = normalizeAuthPath(process.env.AUTH_REFRESH_PATH, "/auth/refresh");
const ME_PATH = normalizeAuthPath(process.env.AUTH_ME_PATH, "/auth/me");

function decodeExp(token?: string | null): number | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

function resetRefreshFailureState(token: JWT) {
  delete (token as any).refreshFailureCount;
  delete (token as any).refreshFirstFailureAtMs;
}

function invalidateAuthFields(token: JWT, errorCode: string) {
  (token as any).accessToken = undefined;
  (token as any).refreshToken = undefined;
  (token as any).accessTokenExp = null;
  (token as any).error = errorCode;
  resetRefreshFailureState(token);
}

async function requestSuperAdminRefresh(refreshToken: string): Promise<RefreshResult> {
  try {
    const response = await fetch(`${API_BASE_URL}${REFRESH_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return { ok: false };
    }

    const data = await response.json().catch(() => null);
    const nextAccessToken = String((data as any)?.accessToken || "").trim();
    const nextRefreshToken = String((data as any)?.refreshToken || "").trim();
    if (!nextAccessToken || !nextRefreshToken) {
      return { ok: false };
    }

    return {
      ok: true,
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
    };
  } catch {
    return { ok: false };
  }
}

async function refreshSuperAdminTokenSingleFlight(refreshToken: string): Promise<RefreshResult> {
  const existing = superAdminRefreshFlights.get(refreshToken);
  if (existing) {
    return existing;
  }

  const promise = requestSuperAdminRefresh(refreshToken).finally(() => {
    superAdminRefreshFlights.delete(refreshToken);
  });
  superAdminRefreshFlights.set(refreshToken, promise);
  return promise;
}

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export const superAdminAuthOptions = {
  basePath: "/api/superadmin-auth",
  providers: [
    CredentialsProvider({
      name: "SuperAdmin Credentials",
      credentials: {
        email: { label: "E-mail", type: "text" },
        password: { label: "Senha", type: "password" },
        mfaCode: { label: "Codigo MFA", type: "text" },
        accessToken: { label: "Access Token", type: "text" },
        refreshToken: { label: "Refresh Token", type: "text" },
        tenantSlug: { label: "Tenant Slug", type: "text" },
        tenantId: { label: "Tenant Id", type: "text" },
        role: { label: "Role", type: "text" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if ((credentials as any)?.accessToken) {
          const accessToken = String((credentials as any).accessToken || "").trim();
          const refreshToken = String((credentials as any).refreshToken || "").trim() || null;
          if (!accessToken) {
            return null;
          }

          try {
            const meResponse = await fetch(`${API_BASE_URL}${ME_PATH}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!meResponse.ok) {
              return null;
            }

            const userData = await meResponse.json();
            const role = String(userData?.role || "").toUpperCase();
            const isSuperAdmin = role === "SUPERADMIN" || userData?.superadmin === true;
            if (!isSuperAdmin) {
              throw new Error("Acesso restrito ao superadmin");
            }

            const resolvedTenantSlug =
              userData?.tenantSlug ||
              userData?.slug ||
              userData?.tenant?.slug ||
              userData?.racha?.slug ||
              (credentials as any).tenantSlug ||
              null;
            const resolvedTenantId =
              userData?.tenantId || userData?.tenant?.id || (credentials as any).tenantId || null;
            const resolvedImage =
              userData?.image || userData?.avatar || userData?.avatarUrl || userData?.foto || null;

            return {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: "SUPERADMIN",
              tenantId: resolvedTenantId,
              tenantSlug: resolvedTenantSlug,
              accessToken,
              refreshToken,
              image: resolvedImage,
            } as any;
          } catch (error) {
            if (error instanceof Error) {
              throw error;
            }
            throw new Error("AUTH_FAILED");
          }
        }

        if (!credentials?.email || !credentials?.password) return null;
        try {
          const payload: Record<string, string> = {
            email: credentials.email,
            password: credentials.password,
          };
          const mfaCode = String((credentials as any)?.mfaCode || "").trim();
          if (mfaCode) {
            payload.mfaCode = mfaCode;
          }

          const response = await fetch(`${API_BASE_URL}${LOGIN_PATH}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            let message = "AUTH_FAILED";
            try {
              const body = await response.json();
              message = (body as any)?.code || (body as any)?.message || message;
            } catch {
              /* ignore */
            }
            throw new Error(message);
          }

          const data = await response.json();
          if (!data.accessToken) return null;

          const userResponse = await fetch(`${API_BASE_URL}${ME_PATH}`, {
            headers: { Authorization: `Bearer ${data.accessToken}` },
          });
          if (!userResponse.ok) return null;
          const userData = await userResponse.json();

          const role = (userData?.role || "").toString().toUpperCase();
          const isSuperAdmin = role === "SUPERADMIN" || userData?.superadmin === true;
          if (!isSuperAdmin) {
            throw new Error("Acesso restrito ao superadmin");
          }

          const resolvedTenantSlug =
            userData?.tenantSlug ||
            userData?.slug ||
            userData?.tenant?.slug ||
            userData?.racha?.slug ||
            null;
          const resolvedTenantId = userData?.tenantId || userData?.tenant?.id || null;
          const resolvedImage =
            userData?.image || userData?.avatar || userData?.avatarUrl || userData?.foto || null;

          return {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: "SUPERADMIN",
            tenantId: resolvedTenantId,
            tenantSlug: resolvedTenantSlug,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            image: resolvedImage,
          } as any;
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.log("Erro na autenticacao superadmin:", error);
          }
          if (error instanceof Error) {
            throw error;
          }
          throw new Error("AUTH_FAILED");
        }
      },
    }),
  ],

  cookies: {
    sessionToken: {
      name: `next-auth.session-token-superadmin${process.env.NODE_ENV === "development" ? "-dev" : ""}`,
      options: cookieOptions,
    },
    callbackUrl: {
      name: `next-auth.callback-superadmin${process.env.NODE_ENV === "development" ? "-dev" : ""}`,
      options: cookieOptions,
    },
    csrfToken: {
      name: `next-auth.csrf-token-superadmin${process.env.NODE_ENV === "development" ? "-dev" : ""}`,
      options: cookieOptions,
    },
  },

  callbacks: {
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = "SUPERADMIN";
        session.user.tenantId = token.tenantId as string;
        session.user.tenantSlug = (token as any).tenantSlug ?? null;
        session.user.accessToken = token.accessToken as string;
        session.user.refreshToken = token.refreshToken as string;
        session.user.accessTokenExp = (token as any).accessTokenExp ?? null;
        session.user.tokenError = (token as any).error ?? null;
        session.user.authRealm = "superadmin";
      }
      return session;
    },

    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = "SUPERADMIN";
        (token as any).authRealm = "superadmin";
        token.tenantId = (user as any).tenantId;
        (token as any).tenantSlug = (user as any).tenantSlug ?? null;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        (token as any).accessTokenExp = decodeExp(token.accessToken as string);
        (token as any).error = null;
        resetRefreshFailureState(token);
      }

      if (token.accessToken && token.refreshToken) {
        (token as any).authRealm =
          (token as any).authRealm ?? inferAuthRealmFromRole((token as any).role);
        const tokenExp = (token as any).accessTokenExp ?? decodeExp(token.accessToken as string);
        const now = Math.floor(Date.now() / 1000);

        if (tokenExp && tokenExp < now + SUPERADMIN_REFRESH_MARGIN_SECONDS) {
          const refreshResult = await refreshSuperAdminTokenSingleFlight(
            String(token.refreshToken)
          );

          if (refreshResult.ok) {
            token.accessToken = refreshResult.accessToken;
            token.refreshToken = refreshResult.refreshToken;
            (token as any).accessTokenExp = decodeExp(refreshResult.accessToken);
            (token as any).error = null;
            resetRefreshFailureState(token);
          } else {
            if (tokenExp <= now) {
              const nowMs = Date.now();
              const previousFailureCount = Number((token as any).refreshFailureCount || 0);
              const firstFailureAtMs = Number((token as any).refreshFirstFailureAtMs || nowMs);
              const nextFailureCount = previousFailureCount + 1;
              const withinGraceWindow =
                nowMs - firstFailureAtMs <= SUPERADMIN_EXPIRED_REFRESH_FAILURE_GRACE_MS;

              if (withinGraceWindow && nextFailureCount <= SUPERADMIN_EXPIRED_REFRESH_MAX_RETRIES) {
                (token as any).refreshFailureCount = nextFailureCount;
                (token as any).refreshFirstFailureAtMs = firstFailureAtMs;
                (token as any).error = "RefreshAccessTokenRetry";
              } else {
                invalidateAuthFields(token, "RefreshAccessTokenError");
              }
            } else {
              // Keep the current token while still valid and retry refresh on the next cycle.
              (token as any).error = "RefreshAccessTokenRetry";
            }
          }
        }
      } else if (token.accessToken) {
        const tokenExp = (token as any).accessTokenExp ?? decodeExp(token.accessToken as string);
        const now = Math.floor(Date.now() / 1000);
        if (tokenExp && tokenExp <= now) {
          invalidateAuthFields(token, "AccessTokenExpired");
        }
      }
      return token;
    },
  },

  pages: {
    signIn: "/superadmin/login",
    error: "/superadmin/login",
  },

  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60,
  },

  jwt: {
    maxAge: 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};
