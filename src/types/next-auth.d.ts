import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      role?: string;
      rachaId?: string | null;
    } & DefaultSession["user"];
    error?: "RefreshAccessTokenError";
  }

  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    role?: string;
    rachaId?: string | null;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number; // em segundos
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      id: string;
      email?: string | null;
      name?: string | null;
      role?: string;
      rachaId?: string | null;
    };
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number; // epoch ms
    error?: "RefreshAccessTokenError";
  }
}
