import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Role } from "@/common/enums";
import { getApiBase } from "@/lib/get-api-base";

const API_BASE_URL = getApiBase();

export const authOptions: any = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
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
            if (process.env.NODE_ENV === "development") {
              console.log("Erro na autenticação:", response.status, response.statusText);
            }
            return null;
          }

          const data = await response.json();

          if (!data.accessToken) {
            return null;
          }

          const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${data.accessToken}`,
            },
          });

          if (!userResponse.ok) {
            return null;
          }

          const userData = await userResponse.json();

          return {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            tenantId: userData.tenantId,
            tenantSlug: userData.tenantSlug ?? null,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
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
      if (user?.email && account?.provider === "google") {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: (user as Record<string, unknown>).image,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const enriched = user as Record<string, unknown>;
            enriched.accessToken = data.accessToken;
            enriched.refreshToken = data.refreshToken;
            enriched.role = data.role;
            enriched.tenantId = data.tenantId;
            enriched.tenantSlug = data.tenantSlug ?? null;
          }
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.log("Erro no login Google:", error);
          }
        }
      }
      return true;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        const currentUser = session.user ?? ({} as Session["user"]);
        session.user = {
          ...currentUser,
          id: (token.id as string | undefined) ?? currentUser.id,
          role: (token.role as Role | undefined) ?? currentUser.role,
          tenantId: (token.tenantId as string | undefined) ?? currentUser.tenantId,
          accessToken: (token.accessToken as string | undefined) ?? currentUser.accessToken,
          refreshToken: (token.refreshToken as string | undefined) ?? currentUser.refreshToken,
          tenantSlug:
            (token.tenantSlug as string | null | undefined) ?? currentUser.tenantSlug ?? null,
        };
      }
      return session;
    },

    async jwt({ token, user }: { token: JWT; user?: User | null }) {
      if (user) {
        const typedUser = user as User;
        token.id = typedUser.id;
        token.role = typedUser.role as Role | undefined;
        token.tenantId = typedUser.tenantId;
        token.tenantSlug = typedUser.tenantSlug ?? null;
        token.accessToken = typedUser.accessToken;
        token.refreshToken = typedUser.refreshToken;
      }

      if (token.accessToken && token.refreshToken) {
        const tokenExp = (token as Record<string, unknown>).exp as number | undefined;
        const now = Math.floor(Date.now() / 1000);

        if (tokenExp && tokenExp < now + 300) {
          try {
            const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
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
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },

  jwt: {
    maxAge: 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export type AuthSession = Session;
