"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Role as RoleEnum } from "@/common/enums";

export type Role = RoleEnum;

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
  tenantId: string;
  tenantSlug: string | null;
  accessToken: string;
  refreshToken: string;
}

export interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: Role | Role[]) => boolean;
  hasPermission: (permission: string) => boolean;
  requireAuth: (redirectTo?: string) => void;
  requireRole: (role: Role | Role[], redirectTo?: string) => void;
  requirePermission: (permission: string, redirectTo?: string) => void;
}

// Mapeamento de roles para permissões
const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [RoleEnum.ATLETA]: ["USER_READ", "RACHA_READ", "ANALYTICS_READ"],
  [RoleEnum.ADMIN]: [
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
  [RoleEnum.SUPERADMIN]: [
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
  [RoleEnum.GERENTE]: [
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
  [RoleEnum.SUPORTE]: [
    "USER_READ",
    "RACHA_READ",
    "CONFIG_READ",
    "SUPPORT_READ",
    "SUPPORT_CREATE",
    "SUPPORT_UPDATE",
  ],
  [RoleEnum.AUDITORIA]: [
    "ANALYTICS_READ",
    "REPORTS_GENERATE",
    "AUDIT_READ",
    "AUDIT_CREATE",
    "AUDIT_EXPORT",
  ],
  [RoleEnum.FINANCEIRO]: [
    "FINANCE_READ",
    "FINANCE_CREATE",
    "FINANCE_UPDATE",
    "FINANCE_APPROVE",
    "ANALYTICS_READ",
  ],
  [RoleEnum.MARKETING]: ["ANALYTICS_READ", "REPORTS_GENERATE", "CONFIG_READ"],
};

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user as AuthUser | null;
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && !!user;

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (process.env.NODE_ENV === "development") {
          console.log("Erro no login:", result.error);
        }
        return false;
      }

      return true;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.log("Erro no login:", error);
      }
      return false;
    }
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<void> => {
    try {
      await signIn("google", { callbackUrl: "/" });
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
    (redirectTo: string = "/login") => {
      if (!isAuthenticated && !isLoading) {
        router.push(redirectTo);
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
