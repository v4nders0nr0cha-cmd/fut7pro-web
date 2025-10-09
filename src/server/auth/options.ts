import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import type { AuthOptions } from "next-auth/core/types";
import { normalizeAdminRole } from "./roles";

const FALLBACK_ROLE = "LEITOR";

function mapRole(role?: string | null): string {
  const adminRole = normalizeAdminRole(role);
  if (adminRole) return adminRole;
  const key = role?.trim().toUpperCase();
  return key && key.length ? key : FALLBACK_ROLE;
}

const BACKEND_URL = (
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3333"
).replace(/\/$/, "");
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

async function fetchUserProfile(accessToken: string): Promise<BackendUser | null> {
  const result = await callBackend<BackendUser>("/api/auth/me", {
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
  const login = await callBackend<BackendAuthResponse>("/api/auth/login", {
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
  const login = await callBackend<BackendAuthResponse>("/api/auth/google", {
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

  const refresh = await callBackend<BackendAuthResponse>("/api/auth/refresh", {
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
