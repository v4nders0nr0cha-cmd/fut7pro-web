// src/hooks/useTenant.ts
import { useTenant as useTenantContext } from "@/context/TenantContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useTenant() {
  const context = useTenantContext();
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading" || context.loading;

  const hasTenant = !!context.tenant;
  const hasMembership = !!context.membership;
  const isApproved = context.membership?.status === "APROVADO";
  const isAdmin = context.membership?.role === "ADMIN";

  const requireTenant = useCallback(() => {
    if (!hasTenant) {
      router.push("/rachas");
      return false;
    }
    return true;
  }, [hasTenant, router]);

  const requireMembership = useCallback(() => {
    if (!hasMembership || !isApproved) {
      router.push("/unauthorized");
      return false;
    }
    return true;
  }, [hasMembership, isApproved, router]);

  const requireAdmin = useCallback(() => {
    if (!hasMembership || !isApproved || !isAdmin) {
      router.push("/unauthorized");
      return false;
    }
    return true;
  }, [hasMembership, isApproved, isAdmin, router]);

  return {
    ...context,
    isAuthenticated,
    isLoading,
    hasTenant,
    hasMembership,
    isApproved,
    isAdmin,
    requireTenant,
    requireMembership,
    requireAdmin,
  };
}
