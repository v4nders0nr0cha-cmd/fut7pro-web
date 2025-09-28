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
import { rachaMap } from "@/config/rachaMap";
import { useTenant } from "@/hooks/useTenant";

type RachaContextType = {
  rachaId: string;
  setRachaId: (id: string) => void;
  clearRachaId: () => void;
  isRachaSelected: boolean;
};

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
  const { tenant } = useTenant();
  const fallbackRachaId = useMemo(() => Object.keys(rachaMap)[0] || "", []);
  const initialRachaId = tenant?.id ?? fallbackRachaId;
  const [rachaId, setRachaIdState] = useState<string>(initialRachaId);

  useEffect(() => {
    if (tenant?.id && tenant.id !== rachaId) {
      setRachaIdState(tenant.id);
      return;
    }
    if (!tenant?.id && !rachaId && fallbackRachaId) {
      setRachaIdState(fallbackRachaId);
    }
  }, [tenant?.id, rachaId, fallbackRachaId]);

  const setRachaId = useCallback((id: string) => {
    setRachaIdState(id);
  }, []);

  const clearRachaId = useCallback(() => {
    setRachaIdState(tenant?.id ?? fallbackRachaId);
  }, [tenant?.id, fallbackRachaId]);

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
