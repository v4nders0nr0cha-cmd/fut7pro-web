"use client";

import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from "react";
import { rachaMap } from "@/config/rachaMap";
import { rachaConfig } from "@/config/racha.config";

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

export function RachaProvider({ children }: { children: ReactNode }) {
  const defaultRachaId = Object.keys(rachaMap)[0] || "";
  const defaultSlug = rachaConfig.slug || defaultRachaId;
  const [rachaId, setRachaIdState] = useState<string>(defaultRachaId);
  const [tenantSlug, setTenantSlugState] = useState<string>(defaultSlug);

  const setRachaId = useCallback((id: string) => {
    setRachaIdState(id);
  }, []);

  const setTenantSlug = useCallback((slug: string) => {
    setTenantSlugState(slug);
  }, []);

  const clearRachaId = useCallback(() => {
    setRachaIdState(defaultRachaId);
    setTenantSlugState(defaultSlug);
  }, [defaultRachaId, defaultSlug]);

  const isRachaSelected = useMemo(() => {
    return (tenantSlug || rachaId).length > 0;
  }, [rachaId, tenantSlug]);

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
