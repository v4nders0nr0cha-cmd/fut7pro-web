// src/components/tenant/TenantLayout.tsx
"use client";

import { ReactNode } from "react";
import { useTenant } from "@/hooks/useTenant";
import { TenantHeader } from "./TenantHeader";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface TenantLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export function TenantLayout({
  children,
  showBackButton = false,
  requireAuth = true,
  requireAdmin = false,
}: TenantLayoutProps) {
  const {
    tenant,
    membership,
    loading,
    isAuthenticated,
    hasTenant,
    hasMembership,
    isApproved,
    isAdmin,
  } = useTenant();

  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (requireAuth && !hasTenant) {
      router.push("/rachas");
      return;
    }

    if (requireAuth && !hasMembership) {
      router.push("/unauthorized");
      return;
    }

    if (requireAuth && !isApproved) {
      router.push("/unauthorized");
      return;
    }

    if (requireAdmin && !isAdmin) {
      router.push("/unauthorized");
      return;
    }
  }, [
    loading,
    isAuthenticated,
    hasTenant,
    hasMembership,
    isApproved,
    isAdmin,
    requireAuth,
    requireAdmin,
    router,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-fundo flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && (!isAuthenticated || !hasTenant || !hasMembership || !isApproved)) {
    return null; // Redirecionamento em andamento
  }

  if (requireAdmin && !isAdmin) {
    return null; // Redirecionamento em andamento
  }

  return (
    <div className="min-h-screen bg-fundo">
      <TenantHeader showBackButton={showBackButton} />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
