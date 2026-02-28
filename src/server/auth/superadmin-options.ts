import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";

const API_BASE_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SUPERADMIN_REFRESH_MARGIN_SECONDS = 120;

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
      },
      async authorize(credentials) {
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
      }
      return session;
    },

    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = "SUPERADMIN";
        token.tenantId = (user as any).tenantId;
        (token as any).tenantSlug = (user as any).tenantSlug ?? null;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        (token as any).accessTokenExp = decodeExp(token.accessToken as string);
        (token as any).error = null;
      }

      if (token.accessToken && token.refreshToken) {
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
          } else {
            (token as any).accessToken = undefined;
            (token as any).refreshToken = undefined;
            (token as any).accessTokenExp = null;
            (token as any).error = "RefreshAccessTokenError";
          }
        }
      } else if (token.accessToken) {
        const tokenExp = (token as any).accessTokenExp ?? decodeExp(token.accessToken as string);
        const now = Math.floor(Date.now() / 1000);
        if (tokenExp && tokenExp <= now) {
          (token as any).accessToken = undefined;
          (token as any).refreshToken = undefined;
          (token as any).accessTokenExp = null;
          (token as any).error = "AccessTokenExpired";
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
