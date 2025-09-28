import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const authOptions: NextAuthOptions = {
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
        rachaSlug: { label: "Racha", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Autenticação via backend JWT
          const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              rachaSlug: credentials.rachaSlug,
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

          // Buscar informações do usuário no backend
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
            tenantSlug: userData.tenantSlug,
            tenant: userData.tenant,
            membership: userData.membership,
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
    async signIn({ user, account, profile }) {
      // Para login Google, criar usuário no backend se não existir
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
              image: (user as any).image,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            (user as any).accessToken = data.accessToken;
            (user as any).refreshToken = data.refreshToken;
            (user as any).role = data.role;
            (user as any).tenantId = data.tenantId;
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
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.tenantId = token.tenantId as string;
        session.user.tenantSlug = token.tenantSlug as string;
        session.user.tenant = token.tenant as any;
        session.user.membership = token.membership as any;
        session.user.accessToken = token.accessToken as string;
        session.user.refreshToken = token.refreshToken as string;
      }
      return session;
    },

    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
        token.tenantSlug = (user as any).tenantSlug;
        token.tenant = (user as any).tenant;
        token.membership = (user as any).membership;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
      }

      // Refresh token se necessário
      if (token.accessToken && token.refreshToken) {
        const tokenExp = (token as any).exp;
        const now = Math.floor(Date.now() / 1000);

        if (tokenExp && tokenExp < now + 300) {
          // 5 minutos antes de expirar
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
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60, // 24 horas
  },

  jwt: {
    maxAge: 24 * 60 * 60, // 24 horas
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

