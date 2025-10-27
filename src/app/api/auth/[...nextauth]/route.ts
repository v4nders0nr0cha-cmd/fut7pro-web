import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiFetch } from "@/lib/api/fetcher";
import { prisma } from "@/server/prisma";
const isProd = process.env.NODE_ENV === "production";
const isWebDirectDbDisabled =
  process.env.DISABLE_WEB_DIRECT_DB === "true" || process.env.DISABLE_WEB_DIRECT_DB === "1";
import type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  MeResponse,
} from "@/lib/api/types";

const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || "";
// Test credentials (local dev)
const TEST_EMAIL = process.env.TEST_EMAIL?.toLowerCase().trim();
const TEST_PASSWORD = process.env.TEST_PASSWORD?.trim();
const TEST_TENANT_ID = process.env.TEST_TENANT_ID ?? "fut7pro";
const TEST_TENANT_SLUG = process.env.TEST_TENANT_SLUG ?? TEST_TENANT_ID;
const TEST_TENANT_NAME = process.env.TEST_TENANT_NAME ?? "Fut7Pro";
const TEST_USER_ID = process.env.TEST_USER_ID ?? "test-admin";
const TEST_USER_NAME = process.env.TEST_USER_NAME ?? "Administrador Demo";
const TEST_ROLE = process.env.TEST_MEMBERSHIP_ROLE ?? "ADMIN";
const TEST_MODE = Boolean(TEST_EMAIL && TEST_PASSWORD);
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
        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password).trim();

        // Short-circuit: local test credentials
        if (!isProd && TEST_MODE && email === TEST_EMAIL && password === TEST_PASSWORD) {
          const expiresIn = 3600;

          // Seed mínimo: usuario + racha (ativo) + vínculos
          try {
            if (isProd && isWebDirectDbDisabled) {
              throw new Error("web_db_disabled: test seed blocked in production");
            }
            const usuario = await prisma.usuario.upsert({
              where: { email: TEST_EMAIL! },
              update: { nome: TEST_USER_NAME, apelido: "Admin", role: "PRESIDENTE", status: "ativo" },
              create: {
                id: TEST_USER_ID,
                email: TEST_EMAIL!,
                nome: TEST_USER_NAME,
                apelido: "Admin",
                role: "PRESIDENTE",
                status: "ativo",
              },
            });

            let racha = await prisma.racha.findFirst({
              where: { OR: [{ ownerId: usuario.id }, { slug: TEST_TENANT_SLUG }] },
            });
            if (!racha) {
              racha = await prisma.racha.create({
                data: {
                  id: TEST_TENANT_ID,
                  nome: TEST_TENANT_NAME,
                  slug: TEST_TENANT_SLUG,
                  ownerId: usuario.id,
                  ativo: true,
                  status: "ATIVO",
                },
              });
            }

            const jogador = await prisma.jogador.upsert({
              where: { email: TEST_EMAIL! },
              update: { nome: TEST_USER_NAME, apelido: "Admin", posicao: "ATACANTE", status: "ativo" },
              create: {
                nome: TEST_USER_NAME,
                apelido: "Admin",
                email: TEST_EMAIL!,
                posicao: "ATACANTE",
                status: "ativo",
              },
            });

            await prisma.rachaAdmin.upsert({
              where: { rachaId_usuarioId: { rachaId: racha.id, usuarioId: usuario.id } },
              update: {},
              create: { rachaId: racha.id, usuarioId: usuario.id, role: "PRESIDENTE", status: "ativo" },
            });
            await prisma.rachaJogador.upsert({
              where: { rachaId_jogadorId: { rachaId: racha.id, jogadorId: jogador.id } },
              update: {},
              create: { rachaId: racha.id, jogadorId: jogador.id },
            });
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn("[auth] seed demo racha failed:", e);
          }

          return {
            id: TEST_USER_ID,
            email: TEST_EMAIL,
            name: TEST_USER_NAME,
            role: TEST_ROLE,
            // importante para telas admin e links do site
            rachaId: TEST_TENANT_ID,
            tenantId: TEST_TENANT_ID,
            tenantSlug: TEST_TENANT_SLUG,
            accessToken: "local-test-token",
            refreshToken: "local-test-refresh",
            expiresIn,
          } as any;
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Informe e-mail e senha.");
        }
        const payload: LoginRequest = { email, password };
        const data = await apiFetch<LoginResponse>(`${API_BASE}${AUTH_LOGIN_PATH}`, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        if (!data?.accessToken) throw new Error("Login invalido.");

        // opcional: validacao de /auth/me para preencher user atualizada
        try {
          const me = await apiFetch<MeResponse>(`${API_BASE}${AUTH_ME_PATH}`, {
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
          rachaId: (user as any).rachaId ?? null,
          tenantId: (user as any).tenantId ?? (user as any).rachaId ?? null,
          tenantSlug: (user as any).tenantSlug ?? TEST_TENANT_SLUG ?? null,
        } as any;
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
          const refreshed = await apiFetch<RefreshResponse>(`${API_BASE}${AUTH_REFRESH_PATH}`, {
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
        const t: any = token.user as any;
        session.user = {
          ...session.user,
          id: t.id,
          email: t.email ?? undefined,
          name: t.name ?? undefined,
          role: t.role,
          rachaId: t.rachaId ?? t.tenantId ?? undefined,
          tenantId: t.tenantId ?? t.rachaId ?? undefined,
          tenantSlug: t.tenantSlug ?? undefined,
        } as any;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
