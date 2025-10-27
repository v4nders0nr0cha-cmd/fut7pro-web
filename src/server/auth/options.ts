import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import type { AuthOptions } from "next-auth/core/types";
import { normalizeAdminRole } from "./roles";
import { prisma } from "@/server/prisma";

const FALLBACK_ROLE = "LEITOR";

function mapRole(role?: string | null): string {
  const adminRole = normalizeAdminRole(role);
  if (adminRole) return adminRole;
  const key = role?.trim().toUpperCase();
  return key && key.length ? key : FALLBACK_ROLE;
}

const TEST_EMAIL = process.env.TEST_EMAIL?.trim().toLowerCase() ?? null;
const TEST_PASSWORD = process.env.TEST_PASSWORD?.trim() ?? null;
const TEST_TENANT_ID = process.env.TEST_TENANT_ID ?? "fut7pro";
const TEST_TENANT_SLUG = process.env.TEST_TENANT_SLUG ?? TEST_TENANT_ID;
const TEST_TENANT_NAME = process.env.TEST_TENANT_NAME ?? "Fut7Pro";
const TEST_USER_NAME = process.env.TEST_USER_NAME ?? "Administrador Demo";
const TEST_USER_ID = process.env.TEST_USER_ID ?? "test-admin";
const TEST_USER_SLUG = process.env.TEST_USER_SLUG ?? "admin-demo";
const TEST_MEMBERSHIP_ROLE = process.env.TEST_MEMBERSHIP_ROLE ?? "ADMIN";
const TEST_MEMBERSHIP_STATUS = process.env.TEST_MEMBERSHIP_STATUS ?? "APROVADO";
const TEST_MEMBERSHIP_ID = process.env.TEST_MEMBERSHIP_ID ?? "test-membership";
const IS_TEST_LOGIN_ENABLED = Boolean(TEST_EMAIL && TEST_PASSWORD);

if (process.env.NODE_ENV !== "production") {
  console.info(
    `[auth] test credentials ${IS_TEST_LOGIN_ENABLED ? "disponíveis" : "não configuradas"}`
  );
}

const BACKEND_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_URL ||
  "http://127.0.0.1:3333"
).replace(/\/$/, "");
const AUTH_LOGIN_PATH = process.env.AUTH_LOGIN_PATH ?? "/auth/login";
const AUTH_REFRESH_PATH = process.env.AUTH_REFRESH_PATH ?? "/auth/refresh";
const AUTH_ME_PATH = process.env.AUTH_ME_PATH ?? "/auth/me";
const DEFAULT_ACCESS_TOKEN_TTL = Number(process.env.NEXTAUTH_ACCESS_TOKEN_TTL ?? 3600);
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

type BackendUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  tenantId?: string | null;
  tenantSlug?: string | null;
  tenant?: unknown;
  membership?: unknown;
};

type BackendAuthResponse = {
  accessToken: string;
  refreshToken?: string | null;
  expiresIn?: number | null;
  user?: BackendUser;
};

type BackendCallResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
};

function ensureLeadingSlash(pathname: string): string {
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

async function callBackend<T>(
  pathname: string,
  init: RequestInit = {}
): Promise<BackendCallResult<T>> {
  const url = `${BACKEND_URL}${ensureLeadingSlash(pathname)}`;
  const headers = new Headers(init.headers as HeadersInit | undefined);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  headers.set("Accept", "application/json");

  const response = await fetch(url, { ...init, headers, cache: "no-store" });
  const text = await response.text();

  let data: T | null = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // Conteúdo não JSON, mantém null
    }
  }

  return { ok: response.ok, status: response.status, data };
}

function computeExpiry(expiresIn?: number | null): number {
  const ttl =
    typeof expiresIn === "number" && Number.isFinite(expiresIn)
      ? expiresIn
      : DEFAULT_ACCESS_TOKEN_TTL;
  return Date.now() + ttl * 1000;
}

function buildTestAuthResponse(): BackendAuthResponse | null {
  if (!IS_TEST_LOGIN_ENABLED || !TEST_EMAIL) return null;

  return {
    accessToken: "local-test-token",
    refreshToken: null,
    expiresIn: DEFAULT_ACCESS_TOKEN_TTL,
    user: {
      id: TEST_USER_ID,
      name: TEST_USER_NAME,
      email: TEST_EMAIL,
      role: TEST_MEMBERSHIP_ROLE,
      tenantId: TEST_TENANT_ID,
      tenantSlug: TEST_TENANT_SLUG,
      tenant: {
        id: TEST_TENANT_ID,
        name: TEST_TENANT_NAME,
        slug: TEST_TENANT_SLUG,
      },
      membership: {
        id: TEST_MEMBERSHIP_ID,
        role: TEST_MEMBERSHIP_ROLE,
        status: TEST_MEMBERSHIP_STATUS,
        tenantId: TEST_TENANT_ID,
      },
    },
  };
}

function buildTestUserSession() {
  const payload = buildTestAuthResponse();
  if (!payload) return null;
  return buildUserFromBackend(payload, payload.user);
}

async function fetchUserProfile(accessToken: string): Promise<BackendUser | null> {
  const result = await callBackend<BackendUser>(AUTH_ME_PATH, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return result.ok ? result.data : null;
}

function buildUserFromBackend(login: BackendAuthResponse, profile?: BackendUser | null) {
  const source = profile ?? login.user ?? {};
  const id = source.id ?? login.user?.id ?? "";
  const email = source.email ?? login.user?.email ?? null;

  return {
    id: id || email || "",
    name: source.name ?? login.user?.name ?? email ?? "Usuario Fut7Pro",
    email,
    role: mapRole(source.role ?? login.user?.role),
    tenantId: source.tenantId ?? login.user?.tenantId ?? undefined,
    tenantSlug: source.tenantSlug ?? login.user?.tenantSlug ?? undefined,
    tenant: source.tenant ?? login.user?.tenant ?? undefined,
    membership: source.membership ?? login.user?.membership ?? undefined,
    accessToken: login.accessToken,
    refreshToken: login.refreshToken ?? undefined,
    accessTokenExpires: computeExpiry(login.expiresIn),
  };
}

async function authenticateWithCredentials(
  email: string,
  password: string,
  rachaSlug?: string | null
) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = (password ?? "").trim();

  if (process.env.NODE_ENV !== "production") {
    console.info("[auth] credentials attempt", {
      email: normalizedEmail,
      rachaSlug: rachaSlug ?? null,
      testMode: IS_TEST_LOGIN_ENABLED,
    });
  }

  if (IS_TEST_LOGIN_ENABLED) {
    if (normalizedEmail === TEST_EMAIL && normalizedPassword === TEST_PASSWORD) {
      if (process.env.NODE_ENV !== "production") {
        console.info("[auth] using TEST_EMAIL/TEST_PASSWORD fallback credentials");
      }
      const testUser = buildTestUserSession();
      if (testUser) {
        return testUser;
      }
    }
    if (process.env.NODE_ENV !== "production") {
      console.warn("[auth] test credentials mismatch", {
        emailMatch: normalizedEmail === TEST_EMAIL,
        passwordMatch: normalizedPassword === TEST_PASSWORD,
        expectedEmail: TEST_EMAIL,
      });
    }
  }

  const login = await callBackend<BackendAuthResponse>(AUTH_LOGIN_PATH, {
    method: "POST",
    body: JSON.stringify({ email, password, rachaSlug: rachaSlug || undefined }),
  });

  if (!login.ok || !login.data?.accessToken) {
    const message =
      (login.data as any)?.message ??
      (login.status === 401 ? "Credenciais invalidas" : "Falha ao autenticar");
    throw new Error(typeof message === "string" ? message : "Falha ao autenticar");
  }

  const profile = await fetchUserProfile(login.data.accessToken);
  return buildUserFromBackend(login.data, profile);
}

async function authenticateWithGoogle(user: {
  email: string;
  name?: string | null;
  image?: string | null;
}) {
  const login = await callBackend<BackendAuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ email: user.email, name: user.name, image: user.image }),
  });

  if (!login.ok || !login.data?.accessToken) {
    const message = (login.data as any)?.message ?? "Falha ao autenticar com Google";
    throw new Error(typeof message === "string" ? message : "Falha ao autenticar com Google");
  }

  const profile = await fetchUserProfile(login.data.accessToken);
  return buildUserFromBackend(login.data, profile);
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    return { ...token, error: "RefreshAccessTokenError" };
  }

  const refresh = await callBackend<BackendAuthResponse>(AUTH_REFRESH_PATH, {
    method: "POST",
    body: JSON.stringify({ refreshToken: token.refreshToken }),
  });

  if (!refresh.ok || !refresh.data?.accessToken) {
    return { ...token, error: "RefreshAccessTokenError" };
  }

  return {
    ...token,
    accessToken: refresh.data.accessToken,
    refreshToken: refresh.data.refreshToken ?? token.refreshToken,
    accessTokenExpires: computeExpiry(refresh.data.expiresIn),
    error: undefined,
  };
}

export const authOptions: AuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "text", placeholder: "presidente@fut7pro.com" },
        password: { label: "Senha", type: "password" },
        rachaSlug: { label: "Slug do Racha", type: "text", placeholder: "meu-racha" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Informe e-mail e senha");
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();
        const normalizedPassword = credentials.password.trim();

        if (
          IS_TEST_LOGIN_ENABLED &&
          normalizedEmail === TEST_EMAIL &&
          normalizedPassword === TEST_PASSWORD
        ) {
          if (process.env.NODE_ENV !== "production") {
            console.info("[auth] authorize() returning test user");
          }
          const testUser = buildTestUserSession();
          if (testUser) {
            return {
              ...testUser,
              email: testUser.email ?? normalizedEmail,
              refreshToken: testUser.refreshToken ?? "",
              // Sinaliza que este login é do modo teste/local
              isTestUser: true,
            } as any;
          }
        }

        const user = await authenticateWithCredentials(
          credentials.email,
          credentials.password,
          credentials.rachaSlug
        );
        return {
          ...user,
          email: user.email ?? credentials.email,
          refreshToken: user.refreshToken ?? "",
        } as any;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Seed mínimo no banco local quando usar o login de teste
      try {
        const isTest = Boolean((user as any)?.isTestUser) || (user?.email && user.email === TEST_EMAIL);
        if (isTest) {
          const email = (user?.email ?? TEST_EMAIL ?? "admin@local.test").toLowerCase();
          const userId = (user as any)?.id ?? TEST_USER_ID ?? "test-admin";
          const nome = (user?.name as string) ?? TEST_USER_NAME ?? "Administrador Demo";
          const apelido = (TEST_USER_NAME || "Admin").split(" ")[0];
          // 1) Usuario
          const usuario = await prisma.usuario.upsert({
            where: { email },
            update: { nome, apelido, role: "PRESIDENTE", status: "ativo" },
            create: {
              id: userId,
              nome,
              apelido,
              email,
              role: "PRESIDENTE",
              status: "ativo",
            },
          });

          // 2) Jogador (presidente)
          const jogador = await prisma.jogador.upsert({
            where: { email },
            update: { nome, apelido, status: "ativo" },
            create: { nome, apelido, email, posicao: "ATACANTE", status: "ativo" },
          });

          // 3) Racha
          const slug = (process.env.TEST_TENANT_SLUG ?? TEST_TENANT_SLUG ?? "demo-rachao").toLowerCase();
          const rachaNome = process.env.TEST_TENANT_NAME ?? TEST_TENANT_NAME ?? "Racha Demo";
          let racha = await prisma.racha.findFirst({ where: { OR: [{ slug }, { ownerId: usuario.id }] } });
          if (!racha) {
            racha = await prisma.racha.create({
              data: {
                nome: rachaNome,
                slug,
                ownerId: usuario.id,
                ativo: true,
                status: "ATIVO",
              },
            });
          }

          // 4) RachaAdmin (unique par)
          await prisma.rachaAdmin.upsert({
            where: { rachaId_usuarioId: { rachaId: racha.id, usuarioId: usuario.id } },
            update: {},
            create: { rachaId: racha.id, usuarioId: usuario.id, role: "PRESIDENTE", status: "ativo" },
          });

          // 5) Vincula Jogador ao Racha
          await prisma.rachaJogador.upsert({
            where: { rachaId_jogadorId: { rachaId: racha.id, jogadorId: jogador.id } },
            update: {},
            create: { rachaId: racha.id, jogadorId: jogador.id },
          });
        }
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[auth] ensure test seed failed", err);
        }
      }
      if (account?.provider === "google" && user?.email) {
        try {
          const enriched = await authenticateWithGoogle({
            email: user.email,
            name: user.name,
            image: (user as any).image,
          });

          Object.assign(user as any, {
            id: enriched.id,
            role: enriched.role,
            tenantId: enriched.tenantId,
            tenantSlug: enriched.tenantSlug,
            tenant: enriched.tenant,
            membership: enriched.membership,
            accessToken: enriched.accessToken,
            refreshToken: enriched.refreshToken ?? "",
            accessTokenExpires: enriched.accessTokenExpires,
          });
        } catch (error) {
          if (process.env.NODE_ENV !== "production") {
            console.error("[nextauth] google sign-in failed", error);
          }
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = mapRole((user as any).role) as any;
        token.tenantId = (user as any).tenantId ?? undefined;
        token.tenantSlug = (user as any).tenantSlug ?? undefined;
        token.tenant = (user as any).tenant ?? undefined;
        token.membership = (user as any).membership ?? undefined;
        token.accessToken = (user as any).accessToken ?? token.accessToken;
        token.refreshToken = (user as any).refreshToken ?? token.refreshToken;
        token.accessTokenExpires = (user as any).accessTokenExpires ?? computeExpiry();
        token.error = undefined;
      }

      // Coerção para número, evitando TS2362 e comparações com string
      const expiresAt = Number((token as any).accessTokenExpires ?? 0);
      if (!expiresAt || Date.now() < expiresAt - TOKEN_REFRESH_BUFFER_MS) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      const sessionUser = session.user as any;
      const sessionData = session as any;
      sessionUser.id = (token.id as string) ?? (token.sub as string) ?? sessionUser.id;
      sessionUser.role = (token.role as string | undefined) ?? sessionUser.role;
      sessionUser.tenantId = (token.tenantId as string | undefined) ?? sessionUser.tenantId;
      sessionUser.tenantSlug = (token.tenantSlug as string | undefined) ?? sessionUser.tenantSlug;
      sessionUser.tenant = token.tenant ?? sessionUser.tenant;
      sessionUser.membership = token.membership ?? sessionUser.membership;
      sessionUser.accessToken = token.accessToken as string;
      sessionUser.refreshToken = token.refreshToken as string;
      sessionUser.accessTokenExpires = Number(token.accessTokenExpires as number);
      sessionUser.rachaSlug = sessionUser.tenantSlug;

      sessionData.accessToken = token.accessToken as string;
      sessionData.refreshToken = token.refreshToken as string;
      sessionData.tenantSlug = sessionUser.tenantSlug;
      sessionData.rachaSlug = sessionUser.rachaSlug;
      sessionData.error = token.error as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  jwt: {
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
