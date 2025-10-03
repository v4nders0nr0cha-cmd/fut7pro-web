"use client";
import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
  useEffect,
} from "react";
import { useSession } from "next-auth/react";
import type { Tenant, Membership, TenantContextType } from "@/types/tenant";

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  membership: null,
  loading: true,
  error: null,
  setTenant: () => {},
  setMembership: () => {},
  clearTenant: () => {},
  refreshTenant: async () => {},
});

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant deve ser usado dentro de um TenantProvider");
  }
  return context;
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionUser = session?.user as
    | (Record<string, unknown> & {
        tenant?: Tenant | null;
        membership?: Membership | null;
        tenantId?: string | null;
      })
    | undefined;

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }

    if (status === "unauthenticated") {
      setTenant(null);
      setMembership(null);
      setLoading(false);
      return;
    }

    if (sessionUser?.tenant && sessionUser?.membership) {
      setTenant(sessionUser.tenant);
      setMembership(sessionUser.membership);
    }
    setLoading(false);
  }, [sessionUser, status]);

  const clearTenant = useCallback(() => {
    setTenant(null);
    setMembership(null);
    setError(null);
  }, []);

  const refreshTenant = useCallback(async () => {
    if (!sessionUser?.tenantId) {
      setError("Nenhum tenant selecionado");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (sessionUser.tenant) {
        setTenant(sessionUser.tenant);
      }
      if (sessionUser.membership) {
        setMembership(sessionUser.membership);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar dados do tenant");
    } finally {
      setLoading(false);
    }
  }, [sessionUser]);

  const value = useMemo(
    () => ({
      tenant,
      membership,
      loading,
      error,
      setTenant,
      setMembership,
      clearTenant,
      refreshTenant,
    }),
    [tenant, membership, loading, error, setTenant, setMembership, clearTenant, refreshTenant]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}
