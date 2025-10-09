import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiFetch } from "@/lib/api/fetcher";
import type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  MeResponse,
} from "@/lib/api/types";

const BACKEND_URL = process.env.BACKEND_URL!;
const AUTH_LOGIN_PATH = process.env.AUTH_LOGIN_PATH ?? "/auth/login";
const AUTH_REFRESH_PATH = process.env.AUTH_REFRESH_PATH ?? "/auth/refresh";
const AUTH_ME_PATH = process.env.AUTH_ME_PATH ?? "/auth/me";

if (!process.env.NEXTAUTH_SECRET) {
  // eslint-disable-next-line no-console
  console.warn("NEXTAUTH_SECRET nao definido, defina-o no .env");
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "E-mail", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Informe e-mail e senha.");
        }
        const payload: LoginRequest = {
          email: String(credentials.email),
          password: String(credentials.password),
        };
        const data = await apiFetch<LoginResponse>(`${BACKEND_URL}${AUTH_LOGIN_PATH}`, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        if (!data?.accessToken) throw new Error("Login invalido.");

        // opcional: validacao de /auth/me para preencher user atualizada
        try {
          const me = await apiFetch<MeResponse>(`${BACKEND_URL}${AUTH_ME_PATH}`, {
            headers: { Authorization: `Bearer ${data.accessToken}` },
          });
          return {
            ...data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiresIn: data.expiresIn,
            // preferir dados do /me (role, rachaId, etc)
            role: me?.role ?? data.user.role,
            rachaId: me?.rachaId ?? data.user.rachaId ?? null,
          };
        } catch {
          // fallback, ainda autoriza
          return {
            ...data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiresIn: data.expiresIn,
          };
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    // use sua rota de login publica se quiser customizar
    // signIn: "/login"
  },
  debug: process.env.NEXTAUTH_DEBUG === "true",
  callbacks: {
    async jwt({ token, user }) {
      // no login inicial
      if (user) {
        const now = Date.now();
        const expiresAt = now + (user.expiresIn ?? 3600) * 1000;
        token.user = {
          id: user.id,
          email: user.email ?? null,
          name: user.name ?? null,
          role: user.role,
          rachaId: user.rachaId ?? null,
        };
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.expiresAt = expiresAt;
        return token;
      }

      // refresh automatico quando faltar menos de 30s
      const now = Date.now();
      const safetyWindowMs = 30_000;
      if (token.expiresAt && now < token.expiresAt - safetyWindowMs) {
        return token;
      }

      // tenta refresh
      if (token.refreshToken) {
        try {
          const body: RefreshRequest = { refreshToken: token.refreshToken };
          const refreshed = await apiFetch<RefreshResponse>(`${BACKEND_URL}${AUTH_REFRESH_PATH}`, {
            method: "POST",
            body: JSON.stringify(body),
          });
          token.accessToken = refreshed.accessToken;
          if (refreshed.refreshToken) token.refreshToken = refreshed.refreshToken;
          token.expiresAt = Date.now() + (refreshed.expiresIn ?? 3600) * 1000;
          return token;
        } catch {
          // falha de refresh, invalida sessao
          token.error = "RefreshAccessTokenError";
          return token;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token?.error === "RefreshAccessTokenError") {
        session.error = "RefreshAccessTokenError";
      }
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.expiresAt = token.expiresAt;
      if (token.user) {
        session.user = {
          ...session.user,
          id: token.user.id,
          email: token.user.email ?? undefined,
          name: token.user.name ?? undefined,
          role: token.user.role,
          rachaId: token.user.rachaId ?? undefined,
        };
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
