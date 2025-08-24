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
  // Definir rachaId padrão como o primeiro do rachaMap
  const defaultRachaId = Object.keys(rachaMap)[0] || "";
  const [rachaId, setRachaIdState] = useState<string>(defaultRachaId);

  const setRachaId = useCallback((id: string) => {
    setRachaIdState(id);
  }, []);

  const clearRachaId = useCallback(() => {
    setRachaIdState(defaultRachaId);
  }, [defaultRachaId]);

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
    [rachaId, setRachaId, clearRachaId, isRachaSelected],
  );

  return (
    <RachaContext.Provider value={value}>{children}</RachaContext.Provider>
  );
}
