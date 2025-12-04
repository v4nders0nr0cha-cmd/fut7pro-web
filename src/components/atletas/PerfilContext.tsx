"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { usuarioLogadoMock } from "@/components/lists/mockUsuarioLogado"; // TODO: trocar por backend real
import type { Atleta } from "@/types/atletas";

// Interface para o contexto do perfil
interface PerfilContextType {
  usuario: Atleta;
  atualizarPerfil: (dados: Partial<Atleta>) => void;
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
  // TODO: buscar de API pelo usuario autenticado
  const [usuario, setUsuario] = useState<Atleta>(usuarioLogadoMock as unknown as Atleta);

  function atualizarPerfil(dados: Partial<Atleta>) {
    setUsuario((prev) => ({
      ...prev,
      ...dados,
    }));
  }

  return (
    <PerfilContext.Provider value={{ usuario, atualizarPerfil }}>{children}</PerfilContext.Provider>
  );
}
