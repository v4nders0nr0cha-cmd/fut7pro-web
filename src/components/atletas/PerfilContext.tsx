"use client";

import { createContext, useContext, useMemo, useCallback, type ReactNode } from "react";
import useSWR from "swr";

import { useTenant } from "@/hooks/useTenant";
import { useRacha } from "@/context/RachaContext";
import { rachaConfig } from "@/config/racha.config";
import type { Atleta } from "@/types/atletas";

type PerfilContextType = {
  usuario: Atleta;
  isLoading: boolean;
  error: string | null;
  atualizarPerfil: (dados: Partial<Atleta>) => void;
  refresh: () => Promise<Atleta | undefined>;
};

const PerfilContext = createContext<PerfilContextType | null>(null);

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload.error === "string" ? payload.error : "Erro ao carregar perfil";
    throw new Error(message);
  }

  return payload;
};

function createFallbackAtleta(): Atleta {
  return {
    id: "",
    nome: "Atleta Fut7",
    apelido: null,
    slug: "",
    foto: "/images/jogadores/jogador_padrao_01.jpg",
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
    conquistas: {
      titulosGrandesTorneios: [],
      titulosAnuais: [],
      titulosQuadrimestrais: [],
    },
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
  const { tenant } = useTenant();
  const { rachaId } = useRacha();

  const slug = tenant?.slug ?? rachaConfig.slug;
  const requestKey = slug
    ? `/api/atletas/me?slug=${slug}`
    : rachaId
      ? `/api/atletas/me?rachaId=${rachaId}`
      : null;

  const { data, error, isLoading, mutate } = useSWR(requestKey, fetcher);

  const usuario = useMemo(() => {
    if (data && data.atleta) {
      return data.atleta as Atleta;
    }
    return createFallbackAtleta();
  }, [data]);

  const atualizarPerfil = useCallback(
    (dados: Partial<Atleta>) => {
      mutate(
        (prev: any) => {
          if (!prev || !prev.atleta) {
            return { atleta: { ...usuario, ...dados } };
          }
          return { ...prev, atleta: { ...prev.atleta, ...dados } };
        },
        { revalidate: false }
      );
    },
    [mutate, usuario]
  );

  const refresh = useCallback(() => mutate(), [mutate]);

  const value = useMemo(
    () => ({
      usuario,
      isLoading,
      error: error instanceof Error ? error.message : null,
      atualizarPerfil,
      refresh,
    }),
    [usuario, isLoading, error, atualizarPerfil, refresh]
  );

  return <PerfilContext.Provider value={value}>{children}</PerfilContext.Provider>;
}
