"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { usuarioLogadoMock } from "@/components/lists/mockUsuarioLogado"; // Substituir quando backend estiver pronto

interface PerfilContextType {
  usuario: typeof usuarioLogadoMock;
  atualizarPerfil: (dados: Partial<typeof usuarioLogadoMock>) => void;
}

const PerfilContext = createContext<PerfilContextType | null>(null);

export function usePerfil() {
  const context = useContext(PerfilContext);
  if (!context) {
    throw new Error("usePerfil deve ser usado dentro de um PerfilProvider");
  }
  return context;
}

export function PerfilProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState(usuarioLogadoMock);

  function atualizarPerfil(dados: Partial<typeof usuarioLogadoMock>) {
    setUsuario((prev) => ({
      ...prev,
      ...dados,
    }));
  }

  return (
    <PerfilContext.Provider value={{ usuario, atualizarPerfil }}>{children}</PerfilContext.Provider>
  );
}
