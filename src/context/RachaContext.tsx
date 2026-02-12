"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { rachaMap } from "@/config/rachaMap";
import { rachaConfig } from "@/config/racha.config";
import { resolvePublicTenantSlug } from "@/utils/public-links";
import { getStoredTenantSlug, setStoredTenantSlug } from "@/utils/active-tenant";

type RachaContextType = {
  rachaId: string;
  tenantSlug: string;
  setRachaId: (id: string) => void;
  setTenantSlug: (slug: string) => void;
  clearRachaId: () => void;
  isRachaSelected: boolean;
};

const RachaContext = createContext<RachaContextType>({
  rachaId: "",
  tenantSlug: "",
  setRachaId: () => {},
  setTenantSlug: () => {},
  clearRachaId: () => {},
  isRachaSelected: false,
});

export function useRacha() {
  const context = useContext(RachaContext);
  if (!context) {
    throw new Error("useRacha deve ser usado dentro de um RachaProvider");
  }
  return context;
}

export function RachaProvider({
  children,
  initialTenantSlug,
}: {
  children: ReactNode;
  initialTenantSlug?: string | null;
}) {
  const pathname = usePathname() ?? "";
  const defaultRachaId = Object.keys(rachaMap)[0] || "";
  const defaultSlug = rachaConfig.slug || defaultRachaId;
  const initialStoredSlug = typeof window !== "undefined" ? getStoredTenantSlug() : null;
  const initialSlug = (initialTenantSlug || initialStoredSlug || defaultSlug || "").trim();
  const [rachaId, setRachaIdState] = useState<string>(defaultRachaId);
  const [tenantSlug, setTenantSlugState] = useState<string>(initialSlug);

  const setRachaId = useCallback((id: string) => {
    setRachaIdState(id);
  }, []);

  const setTenantSlug = useCallback((slug: string) => {
    const nextSlug = slug.trim();
    setTenantSlugState(nextSlug);
    if (nextSlug) {
      setStoredTenantSlug(nextSlug);
    }
  }, []);

  const clearRachaId = useCallback(() => {
    setRachaIdState(defaultRachaId);
    setTenantSlugState(defaultSlug);
  }, [defaultRachaId, defaultSlug]);

  const isRachaSelected = useMemo(() => {
    return (tenantSlug || rachaId).length > 0;
  }, [rachaId, tenantSlug]);

  useEffect(() => {
    const slugFromPath = resolvePublicTenantSlug(pathname);
    if (slugFromPath) {
      setTenantSlugState(slugFromPath);
      setStoredTenantSlug(slugFromPath);
      return;
    }

    const stored = getStoredTenantSlug();
    if (stored) {
      setTenantSlugState(stored);
      return;
    }

    if (initialTenantSlug) {
      setTenantSlugState(initialTenantSlug);
      setStoredTenantSlug(initialTenantSlug);
      return;
    }

    if (!tenantSlug && defaultSlug) {
      setTenantSlugState(defaultSlug);
    }
  }, [pathname, initialTenantSlug, defaultSlug, tenantSlug]);

  const value = useMemo(
    () => ({
      rachaId,
      tenantSlug,
      setRachaId,
      setTenantSlug,
      clearRachaId,
      isRachaSelected,
    }),
    [rachaId, tenantSlug, setRachaId, setTenantSlug, clearRachaId, isRachaSelected]
  );

  return <RachaContext.Provider value={value}>{children}</RachaContext.Provider>;
}
