"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { usuarioLogadoMock } from "@/components/lists/mockUsuarioLogado"; // Substitua pelo backend depois
import { StateData } from "@/types/interfaces";

// Interface para o contexto do perfil
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
  // No futuro: buscar de API pelo usuário autenticado
  const [usuario, setUsuario] = useState(usuarioLogadoMock);

  function atualizarPerfil(dados: Partial<typeof usuarioLogadoMock>) {
    setUsuario((prev) => ({
      ...prev,
      ...dados,
      // Atualiza também campos aninhados, se quiser
    }));
    // Aqui já pode salvar em localStorage/sessionStorage para persistir
  }

  return (
    <PerfilContext.Provider value={{ usuario, atualizarPerfil }}>
      {children}
    </PerfilContext.Provider>
  );
}
