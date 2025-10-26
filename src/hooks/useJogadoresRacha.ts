"use client";

import useSWR from "swr";
import * as api from "@/lib/api";
import type { Jogador } from "@/types/jogador";
import type { Participante, Posicao } from "@/types/sorteio";

function toPosicaoCode(pos: Jogador["posicao"]): Posicao {
  const p = (pos || "").toString().toLowerCase();
  if (p.startsWith("gol")) return "GOL";
  if (p.startsWith("zag") || p.startsWith("zagu")) return "ZAG";
  if (p.startsWith("mei")) return "MEI";
  // default: atacante
  return "ATA";
}

function slugifyName(name: string): string {
  return (name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function fetchJogadores(rachaId: string): Promise<Participante[]> {
  const resp = await api.jogadoresApi.getAll(rachaId);
  if (resp.error) throw new Error(resp.error);
  const list = (resp.data as Jogador[]) || [];
  // Mapear Jogador -> Participante (Sorteio)
  return list.map((j) => ({
    id: j.id,
    nome: j.nome,
    slug: slugifyName(j.nome),
    foto: j.avatar ?? "/images/Perfil-sem-Foto-Fut7.png",
    posicao: toPosicaoCode(j.posicao),
    rankingPontos: 0,
    vitorias: 0,
    gols: 0,
    assistencias: 0,
    estrelas: { estrelas: 0, atualizadoEm: new Date().toISOString() },
    mensalista: Boolean(j.mensalista),
    partidas: 0,
  }));
}

export function useJogadoresRacha(rachaId: string | undefined) {
  const shouldFetch = Boolean(rachaId);
  const { data, error, isLoading, mutate } = useSWR<Participante[]>(
    shouldFetch ? ["jogadores-racha", rachaId] : null,
    () => fetchJogadores(rachaId as string),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    participantesDisponiveis: data ?? [],
    isLoading,
    isError: Boolean(error),
    error: error as Error | null,
    reload: mutate,
  };
}
