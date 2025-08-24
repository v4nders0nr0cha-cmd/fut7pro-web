"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Role } from "@prisma/client";

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
    user,
    isLoading,
    isAuthenticated,
    hasRole,
    hasPermission,
    requireAuth,
    requireRole,
    requirePermission,
  } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // Verificar autenticação
    if (!isAuthenticated) {
      requireAuth();
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
  ]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <span className="text-textoSuave ml-4 text-lg">
            Verificando autenticação...
          </span>
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
