"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { Role } from "@prisma/client";
import { safeCallbackUrl } from "@/lib/url";

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
  tenantId?: string | null;
  tenantSlug?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
}

type LoginOptions = {
  callbackUrl?: string;
  autoRedirect?: boolean;
};

export interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, options?: LoginOptions) => Promise<boolean>;
  loginWithGoogle: (callbackUrl?: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: Role | Role[]) => boolean;
  hasPermission: (permission: string) => boolean;
  requireAuth: (callbackUrl?: string, loginPath?: string) => void;
  requireRole: (role: Role | Role[], redirectTo?: string) => void;
  requirePermission: (permission: string, redirectTo?: string) => void;
}

function buildLoginTarget(loginPath: string, callbackUrl?: string): string {
  if (!callbackUrl) return loginPath;
  const safePath = safeCallbackUrl(callbackUrl, loginPath);
  if (safePath === loginPath) return loginPath;
  const separator = loginPath.includes("?") ? "&" : "?";
  return `${loginPath}${separator}callbackUrl=${encodeURIComponent(safePath)}`;
}

// Mapeamento de roles para permissões
const ROLE_PERMISSIONS: Record<Role, string[]> = {
  ATLETA: ["USER_READ", "RACHA_READ", "ANALYTICS_READ"],
  ADMIN: [
    "USER_READ",
    "USER_CREATE",
    "USER_UPDATE",
    "RACHA_READ",
    "RACHA_UPDATE",
    "RACHA_MANAGE_ADMINS",
    "FINANCE_READ",
    "FINANCE_CREATE",
    "FINANCE_UPDATE",
    "CONFIG_READ",
    "CONFIG_UPDATE",
    "ANALYTICS_READ",
    "REPORTS_GENERATE",
    "SUPPORT_READ",
    "SUPPORT_CREATE",
    "SUPPORT_UPDATE",
  ],
  SUPERADMIN: [
    "USER_READ",
    "USER_CREATE",
    "USER_UPDATE",
    "USER_DELETE",
    "USER_MANAGE_ROLES",
    "RACHA_READ",
    "RACHA_CREATE",
    "RACHA_UPDATE",
    "RACHA_DELETE",
    "RACHA_MANAGE_ADMINS",
    "FINANCE_READ",
    "FINANCE_CREATE",
    "FINANCE_UPDATE",
    "FINANCE_DELETE",
    "FINANCE_APPROVE",
    "CONFIG_READ",
    "CONFIG_UPDATE",
    "CONFIG_SYSTEM",
    "ANALYTICS_READ",
    "REPORTS_GENERATE",
    "SUPERADMIN_CREATE",
    "SUPERADMIN_UPDATE",
    "SUPERADMIN_DELETE",
    "AUDIT_READ",
    "AUDIT_CREATE",
    "AUDIT_EXPORT",
    "SUPPORT_READ",
    "SUPPORT_CREATE",
    "SUPPORT_UPDATE",
    "SUPPORT_DELETE",
  ],
  GERENTE: [
    "USER_READ",
    "USER_CREATE",
    "USER_UPDATE",
    "RACHA_READ",
    "RACHA_UPDATE",
    "RACHA_MANAGE_ADMINS",
    "FINANCE_READ",
    "FINANCE_CREATE",
    "FINANCE_UPDATE",
    "CONFIG_READ",
    "CONFIG_UPDATE",
    "ANALYTICS_READ",
    "REPORTS_GENERATE",
  ],
  SUPORTE: [
    "USER_READ",
    "RACHA_READ",
    "CONFIG_READ",
    "SUPPORT_READ",
    "SUPPORT_CREATE",
    "SUPPORT_UPDATE",
  ],
  AUDITORIA: ["ANALYTICS_READ", "REPORTS_GENERATE", "AUDIT_READ", "AUDIT_CREATE", "AUDIT_EXPORT"],
  FINANCEIRO: [
    "FINANCE_READ",
    "FINANCE_CREATE",
    "FINANCE_UPDATE",
    "FINANCE_APPROVE",
    "ANALYTICS_READ",
  ],
  MARKETING: ["ANALYTICS_READ", "REPORTS_GENERATE", "CONFIG_READ"],
};

type SessionUser =
  | (AuthUser & {
      rachaId?: string | null;
      accessToken?: string | null;
      refreshToken?: string | null;
    })
  | null;

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  const router = useRouter();

  const rawUser = session?.user as SessionUser;

  const user = useMemo<AuthUser | null>(() => {
    if (!rawUser) return null;
    const tenantId = rawUser.tenantId ?? rawUser.rachaId ?? null;
    const accessToken = rawUser.accessToken ?? (session as any)?.accessToken ?? null;
    const refreshToken = rawUser.refreshToken ?? (session as any)?.refreshToken ?? null;

    return {
      id: rawUser.id,
      name: rawUser.name ?? null,
      email: rawUser.email ?? null,
      image: rawUser.image ?? null,
      role: rawUser.role,
      tenantId,
      tenantSlug: rawUser.tenantSlug ?? null,
      accessToken,
      refreshToken,
    };
  }, [rawUser, session]);

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && !!user;

  const login = useCallback(
    async (email: string, password: string, options: LoginOptions = {}): Promise<boolean> => {
      try {
        const normalizedCallback = safeCallbackUrl(options.callbackUrl, "/admin");
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
          callbackUrl: normalizedCallback,
        });

        if (!result?.ok || result.error) {
          if (process.env.NODE_ENV === "development") {
            console.log("Erro no login:", result?.error);
          }
          return false;
        }

        if (options.autoRedirect !== false && result.url) {
          router.push(result.url);
        }

        return true;
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.log("Erro no login:", error);
        }
        return false;
      }
    },
    [router]
  );

  const loginWithGoogle = useCallback(async (callbackUrl?: string): Promise<void> => {
    try {
      const normalized = safeCallbackUrl(callbackUrl, "/");
      await signIn("google", { callbackUrl: normalized });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.log("Erro no login Google:", error);
      }
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.log("Erro no logout:", error);
      }
    }
  }, []);

  const hasRole = useCallback(
    (role: Role | Role[]): boolean => {
      if (!user) return false;

      const roles = Array.isArray(role) ? role : [role];
      return roles.includes(user.role);
    },
    [user]
  );

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;

      const userPermissions = ROLE_PERMISSIONS[user.role] || [];
      return userPermissions.includes(permission);
    },
    [user]
  );

  const requireAuth = useCallback(
    (callbackUrl?: string, loginPath: string = "/login") => {
      if (!isAuthenticated && !isLoading) {
        const target = buildLoginTarget(loginPath, callbackUrl ?? currentLocation);
        router.push(target);
      }
    },
    [isAuthenticated, isLoading, router]
  );

  const requireRole = useCallback(
    (role: Role | Role[], redirectTo: string = "/unauthorized") => {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      if (!hasRole(role)) {
        router.push(redirectTo);
      }
    },
    [isAuthenticated, hasRole, router]
  );

  const requirePermission = useCallback(
    (permission: string, redirectTo: string = "/unauthorized") => {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      if (!hasPermission(permission)) {
        router.push(redirectTo);
      }
    },
    [isAuthenticated, hasPermission, router]
  );

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    loginWithGoogle,
    logout,
    hasRole,
    hasPermission,
    requireAuth,
    requireRole,
    requirePermission,
  };
}
