"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Atleta } from "@/types/atletas";
import { useAuth } from "@/hooks/useAuth";
import { slugify } from "@/utils/slugify";

interface PerfilContextType {
  usuario: Atleta;
  atualizarPerfil: (dados: Partial<Atleta>) => void;
}

const PerfilContext = createContext<PerfilContextType | null>(null);

function buildAtletaBase(user: ReturnType<typeof useAuth>["user"]): Atleta {
  const nome = user?.name || "Atleta";
  return {
    id: user?.id || "usuario-autenticado",
    nome,
    apelido: user?.name || null,
    slug: slugify(nome),
    foto: user?.image || "/images/jogadores/jogador_padrao_01.jpg",
    posicao: "Atacante",
    status: "Ativo",
    mensalista: false,
    ultimaPartida: undefined,
    totalJogos: 0,
    estatisticas: {
      historico: {
        jogos: 0,
        gols: 0,
        assistencias: 0,
        campeaoDia: 0,
        mediaVitorias: 0,
        pontuacao: 0,
      },
      anual: {},
    },
    historico: [],
    conquistas: { titulosGrandesTorneios: [], titulosAnuais: [], titulosQuadrimestrais: [] },
    icones: [],
  };
}

export function usePerfil() {
  const context = useContext(PerfilContext);
  if (!context) {
    throw new Error("usePerfil deve ser usado dentro de um PerfilProvider");
  }
  return context;
}

export function PerfilProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const defaultAtleta = useMemo(() => buildAtletaBase(auth.user), [auth.user]);
  const [usuario, setUsuario] = useState<Atleta>(defaultAtleta);

  useEffect(() => {
    setUsuario(buildAtletaBase(auth.user));
  }, [auth.user]);

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
