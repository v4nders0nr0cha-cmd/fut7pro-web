"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@prisma/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role | Role[];
  requiredPermission?: string;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  redirectTo = "/unauthorized",
  fallback,
}: ProtectedRouteProps) {
  const {
    isLoading,
    isAuthenticated,
    hasRole,
    hasPermission,
    requireAuth,
    requireRole,
    requirePermission,
  } = useAuth();

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentLocation = useMemo(() => {
    const basePath = pathname ?? "/";
    const query = searchParams?.toString();
    return query ? `${basePath}?${query}` : basePath;
  }, [pathname, searchParams]);

  const loginPath = useMemo(() => {
    if (!pathname) return "/login";
    if (pathname.startsWith("/superadmin")) return "/superadmin/login";
    if (pathname.startsWith("/admin")) return "/admin/login";
    return "/login";
  }, [pathname]);

  useEffect(() => {
    if (isLoading) return;

    // Verificar autenticação
    if (!isAuthenticated) {
      requireAuth(currentLocation, loginPath);
      return;
    }

    // Verificar role se especificado
    if (requiredRole) {
      if (!hasRole(requiredRole)) {
        requireRole(requiredRole, redirectTo);
        return;
      }
    }

    // Verificar permissão se especificada
    if (requiredPermission) {
      if (!hasPermission(requiredPermission)) {
        requirePermission(requiredPermission, redirectTo);
        return;
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    requiredRole,
    requiredPermission,
    redirectTo,
    hasRole,
    hasPermission,
    requireAuth,
    requireRole,
    requirePermission,
    currentLocation,
    loginPath,
  ]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-4 text-lg text-textoSuave">Verificando autenticação...</span>
        </div>
      )
    );
  }

  // Se não está autenticado, não renderizar nada (será redirecionado)
  if (!isAuthenticated) {
    return null;
  }

  // Verificar role
  if (requiredRole && !hasRole(requiredRole)) {
    return null;
  }

  // Verificar permissão
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return null;
  }

  // Se passou por todas as verificações, renderizar children
  return <>{children}</>;
}
