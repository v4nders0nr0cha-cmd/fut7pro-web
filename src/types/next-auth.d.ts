import "next-auth";
import "next-auth/jwt";
import type { Role } from "@/hooks/useAuth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
      tenantId: string;
      tenantSlug: string | null;
      accessToken: string;
      refreshToken: string;
    };
  }

  interface User {
    role?: Role;
    tenantId?: string;
    tenantSlug?: string | null;
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    tenantId?: string;
    tenantSlug?: string | null;
    accessToken?: string;
    refreshToken?: string;
  }
}
