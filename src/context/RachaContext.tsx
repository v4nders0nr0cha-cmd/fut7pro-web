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
import { rachaConfig } from "@/config/racha.config";

type RachaContextType = {
  rachaId: string;
  setRachaId: (id: string) => void;
  clearRachaId: () => void;
  isRachaSelected: boolean;
};

const DEFAULT_RACHA_SLUG = process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG ?? rachaConfig.slug ?? "";

const RachaContext = createContext<RachaContextType>({
  rachaId: "",
  setRachaId: () => {},
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
  const { data: session } = useSession();
  const [rachaId, setRachaIdState] = useState<string>(DEFAULT_RACHA_SLUG);

  const resolvedDefaultSlug = useMemo(() => {
    const sessionSlug = session?.user?.tenantSlug?.trim();
    if (sessionSlug) {
      return sessionSlug;
    }
    return DEFAULT_RACHA_SLUG;
  }, [session?.user?.tenantSlug]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const sessionSlug = session.user?.tenantSlug?.trim();
    if (sessionSlug && sessionSlug !== rachaId) {
      setRachaIdState(sessionSlug);
      return;
    }

    const tenantId = session.user?.tenantId?.trim();
    if (tenantId && tenantId !== rachaId) {
      setRachaIdState(tenantId);
    }
  }, [session, rachaId]);

  const setRachaId = useCallback((id: string) => {
    setRachaIdState(id);
  }, []);

  const clearRachaId = useCallback(() => {
    setRachaIdState(resolvedDefaultSlug);
  }, [resolvedDefaultSlug]);

  const isRachaSelected = useMemo(() => {
    return rachaId.length > 0;
  }, [rachaId]);

  const value = useMemo(
    () => ({
      rachaId,
      setRachaId,
      clearRachaId,
      isRachaSelected,
    }),
    [rachaId, setRachaId, clearRachaId, isRachaSelected]
  );

  return <RachaContext.Provider value={value}>{children}</RachaContext.Provider>;
}
