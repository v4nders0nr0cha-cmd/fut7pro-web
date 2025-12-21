import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";

type NextAuthOptionsLike = {
  providers: any[];
  callbacks?: {
    signIn?: (...args: any[]) => any;
    session?: (...args: any[]) => any;
    jwt?: (...args: any[]) => any;
  };
  pages?: { signIn?: string; error?: string };
  session?: { strategy?: "jwt"; maxAge?: number };
  jwt?: { maxAge?: number };
  secret?: string;
};

const API_BASE_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const normalizeAuthPath = (value: string | undefined | null, fallback: string) => {
  if (!value) return fallback;
  const trimmed = value.trim();
  // garante prefixo /auth/ e evita typos (ex.: /auth/Tme)
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
const GOOGLE_PATH = "/auth/google";

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

export const authOptions: NextAuthOptionsLike = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "text" },
        password: { label: "Senha", type: "password" },
        accessToken: { label: "Access Token", type: "text" },
        refreshToken: { label: "Refresh Token", type: "text" },
        tenantSlug: { label: "Tenant Slug", type: "text" },
        tenantId: { label: "Tenant Id", type: "text" },
        role: { label: "Role", type: "text" },
        name: { label: "Name", type: "text" },
        authProvider: { label: "Auth Provider", type: "text" },
      },
      async authorize(credentials) {
        // fluxo de impersonate: se vier accessToken, validar e retornar usuario direto
        if (credentials?.accessToken) {
          const accessToken = credentials.accessToken as string;
          const authProvider = (credentials as any)?.authProvider || "credentials";
          try {
            const meResponse = await fetch(`${API_BASE_URL}${ME_PATH}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            let userData: any = null;
            if (meResponse.ok) {
              userData = await meResponse.json();
            } else {
              // fallback a dados enviados
              userData = {
                id: (credentials as any).id || "impersonated",
                email: credentials.email,
                name: credentials.name,
                role: (credentials as any).role ?? "ADMIN",
                tenantId: credentials.tenantId || null,
                tenantSlug: credentials.tenantSlug || null,
              };
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

            return {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              tenantId: resolvedTenantId,
              tenantSlug: resolvedTenantSlug,
              accessToken,
              refreshToken: credentials.refreshToken || null,
              image: userData.image || userData.avatar || null,
              authProvider,
            };
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              console.log("Erro no authorize via token:", error);
            }
            return null;
          }
        }

        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Autenticação via backend JWT
          const response = await fetch(`${API_BASE_URL}${LOGIN_PATH}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            let message = "Erro na autenticacao";
            try {
              const body = await response.json();
              message = (body as any)?.message || message;
            } catch {
              // ignore parse errors
            }
            throw new Error(message);
          }

          const data = await response.json();

          if (!data.accessToken) {
            return null;
          }

          // Buscar informações do usuário no backend
          const userResponse = await fetch(`${API_BASE_URL}${ME_PATH}`, {
            headers: {
              Authorization: `Bearer ${data.accessToken}`,
            },
          });

          if (!userResponse.ok) {
            return null;
          }

          const userData = await userResponse.json();

          // tenta extrair slug/tenant de diferentes formatos que o backend possa devolver
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
            role: userData.role,
            tenantId: resolvedTenantId,
            tenantSlug: resolvedTenantSlug,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            image: resolvedImage,
            authProvider: "credentials",
          };
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.log("Erro na autenticação:", error);
          }
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Para login Google, criar usuario no backend se nao existir
      if (user?.email && account?.provider === "google") {
        const idToken = (account as any)?.id_token;
        if (!idToken) {
          return false;
        }
        try {
          const response = await fetch(`${API_BASE_URL}${GOOGLE_PATH}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              idToken,
            }),
          });

          if (!response.ok) {
            return false;
          }

          const data = await response.json();
          (user as any).accessToken = data.accessToken;
          (user as any).refreshToken = data.refreshToken;
          (user as any).role = data.role;
          (user as any).tenantId = data.tenantId;
          (user as any).tenantSlug = data.tenantSlug ?? null;
          (user as any).authProvider = "google";
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.log("Erro no login Google:", error);
          }
          return false;
        }
      }
      return true;
    },

    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as any;
        (session.user as any).tenantId = token.tenantId as string;
        (session.user as any).tenantSlug = (token as any).tenantSlug ?? null;
        (session.user as any).accessToken = token.accessToken as string;
        (session.user as any).refreshToken = token.refreshToken as string;
        (session.user as any).accessTokenExp = (token as any).accessTokenExp ?? null;
        (session.user as any).authProvider = (token as any).authProvider ?? null;
      }
      return session;
    },

    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
        (token as any).tenantSlug = (user as any).tenantSlug ?? null;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        (token as any).accessTokenExp = decodeExp(token.accessToken as string);
        (token as any).authProvider = (user as any).authProvider ?? null;
      }

      // Refresh token se necessário
      if (token.accessToken && token.refreshToken) {
        const tokenExp = (token as any).accessTokenExp ?? decodeExp(token.accessToken as string);
        const now = Math.floor(Date.now() / 1000);

        if (tokenExp && tokenExp < now + 300) {
          // 5 minutos antes de expirar
          try {
            const response = await fetch(`${API_BASE_URL}${REFRESH_PATH}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                refreshToken: token.refreshToken,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              token.accessToken = data.accessToken;
              token.refreshToken = data.refreshToken;
              (token as any).accessTokenExp = decodeExp(token.accessToken as string);
            }
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              console.log("Erro no refresh token:", error);
            }
          }
        }
      }

      return token;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60, // 24 horas
  },

  jwt: {
    maxAge: 24 * 60 * 60, // 24 horas
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };
