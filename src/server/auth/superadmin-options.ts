import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";

const API_BASE_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const response = await fetch(`${API_BASE_URL}${LOGIN_PATH}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });

          if (!response.ok) {
            let message = "Erro na autenticacao";
            try {
              const body = await response.json();
              message = (body as any)?.message || message;
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
          return null;
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
      }

      if (token.accessToken && token.refreshToken) {
        const tokenExp = (token as any).accessTokenExp ?? decodeExp(token.accessToken as string);
        const now = Math.floor(Date.now() / 1000);

        if (tokenExp && tokenExp < now + 300) {
          try {
            const response = await fetch(`${API_BASE_URL}${REFRESH_PATH}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken: token.refreshToken }),
            });

            if (response.ok) {
              const data = await response.json();
              token.accessToken = data.accessToken;
              token.refreshToken = data.refreshToken;
              (token as any).accessTokenExp = decodeExp(token.accessToken as string);
            }
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              console.log("Erro no refresh token (superadmin):", error);
            }
          }
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
