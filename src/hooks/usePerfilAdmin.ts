"use client";

import useSWR from "swr";
import type { PerfilUsuario, PerfilResponseRaw } from "@/types/perfil";
import type { ConquistasAtleta, TituloAtleta } from "@/types/estatisticas";
import type { EstatisticasAtleta, JogoAtleta } from "@/types/atletas";

function mapTituloList(raw: unknown): TituloAtleta[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => {
      if (typeof item === "string") {
        return {
          descricao: item,
          ano: new Date().getFullYear(),
          icone: "🏆",
        };
      }

      if (item && typeof item === "object") {
        const base = item as Record<string, unknown>;
        const descricao =
          (base.descricao as string) ??
          (base.nome as string) ??
          (base.title as string) ??
          (base.label as string);
        if (!descricao) {
          return null;
        }
        const ano = Number(base.ano ?? base.year ?? new Date().getFullYear());
        return {
          descricao,
          ano: Number.isFinite(ano) ? ano : new Date().getFullYear(),
          icone: (base.icone as string) ?? (base.icon as string) ?? "🏅",
        };
      }

      return null;
    })
    .filter((item): item is TituloAtleta => Boolean(item));
}

function parseEstatisticas(raw: PerfilResponseRaw["estatisticas"]): EstatisticasAtleta {
  const historicoSource = raw?.historico;
  const anualSource = raw?.anual;

  const historico = {
    jogos: 0,
    gols: 0,
    assistencias: 0,
    campeaoDia: 0,
    mediaVitorias: 0,
    pontuacao: 0,
  };

  if (historicoSource && typeof historicoSource === "object") {
    const base = historicoSource as Record<string, unknown>;
    const toNumber = (value: unknown, fallback = 0) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };
    historico.jogos = toNumber(base.jogos ?? base.matches, 0);
    historico.gols = toNumber(base.gols ?? base.goals, 0);
    historico.assistencias = toNumber(base.assistencias ?? base.assists, 0);
    historico.campeaoDia = toNumber(base.campeaoDia ?? base.champions, 0);
    historico.mediaVitorias = toNumber(base.mediaVitorias ?? base.winRate, 0);
    historico.pontuacao = toNumber(base.pontuacao ?? base.points, 0);
  }

  const anualEntries: EstatisticasAtleta["anual"] = {};
  if (anualSource && typeof anualSource === "object") {
    Object.entries(anualSource).forEach(([key, value]) => {
      const year = Number(key);
      if (!Number.isFinite(year) || !value || typeof value !== "object") {
        return;
      }
      const base = value as Record<string, unknown>;
      const toNumber = (val: unknown, fallback = 0) => {
        const parsed = Number(val);
        return Number.isFinite(parsed) ? parsed : fallback;
      };
      anualEntries[year] = {
        jogos: toNumber(base.jogos ?? base.matches, 0),
        gols: toNumber(base.gols ?? base.goals, 0),
        assistencias: toNumber(base.assistencias ?? base.assists, 0),
        campeaoDia: toNumber(base.campeaoDia ?? base.champions, 0),
        mediaVitorias: toNumber(base.mediaVitorias ?? base.winRate, 0),
        pontuacao: toNumber(base.pontuacao ?? base.points, 0),
      };
    });
  }

  return {
    historico,
    anual: anualEntries,
  };
}

function parseHistorico(raw: unknown): JogoAtleta[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const base = item as Record<string, unknown>;
      return {
        data: (base.data as string) ?? "",
        time: (base.time as string) ?? "",
        resultado: (base.resultado as string) ?? (base.result as string) ?? "",
        gols: Number(base.gols ?? base.goals ?? 0) || 0,
        campeao: Boolean(base.campeao ?? base.champion ?? false),
        pontuacao: Number(base.pontuacao ?? base.score ?? 0) || 0,
      };
    })
    .filter((item): item is JogoAtleta => Boolean(item));
}

export function adaptPerfilResponse(raw: PerfilResponseRaw): PerfilUsuario {
  const resolvedPhoto = raw.photoUrl ?? raw.foto ?? null;
  const resolvedNickname = raw.nickname ?? raw.apelido ?? null;
  const memberFlag = Boolean(raw.isMember ?? raw.mensalista);

  const conquistas: ConquistasAtleta = {
    titulosGrandesTorneios: mapTituloList(raw.conquistas?.titulosGrandesTorneios).map((item) => ({
      ...item,
      icone: item.icone || "🏆",
    })),
    titulosAnuais: mapTituloList(raw.conquistas?.titulosAnuais).map((item) => ({
      ...item,
      icone: item.icone || "🥇",
    })),
    titulosQuadrimestrais: mapTituloList(raw.conquistas?.titulosQuadrimestrais).map((item) => ({
      ...item,
      icone: item.icone || "🏅",
    })),
  };

  return {
    slug: raw.slug ?? "",
    foto: resolvedPhoto,
    photoUrl: resolvedPhoto,
    nome: raw.nome ?? "Atleta",
    apelido: resolvedNickname,
    nickname: resolvedNickname,
    posicao: raw.posicao ?? "Atacante",
    status: raw.status ?? "Ativo",
    mensalista: memberFlag,
    isMember: memberFlag,
    ultimaPartida: raw.ultimaPartida ?? null,
    totalJogos: Number(raw.totalJogos ?? 0) || 0,
    estatisticas: parseEstatisticas(raw.estatisticas),
    conquistas,
    historico: parseHistorico(raw.historico),
    icones: Array.isArray(raw.icones) ? raw.icones : [],
  };
}

async function fetchPerfil(): Promise<PerfilUsuario> {
  const response = await fetch("/api/admin/atletas/me", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message =
      (payload && typeof payload.error === "string" && payload.error) ||
      (payload && typeof payload.message === "string" && payload.message) ||
      "Falha ao carregar perfil";
    throw new Error(message);
  }

  const data = (await response.json()) as PerfilResponseRaw;
  return adaptPerfilResponse(data);
}

export function usePerfilAdmin() {
  const { data, error, isLoading, mutate, isValidating } = useSWR<PerfilUsuario>(
    "/api/admin/atletas/me",
    fetchPerfil,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    perfil: data ?? null,
    isLoading: isLoading || (!data && !error),
    isValidating,
    isError: Boolean(error),
    error: error instanceof Error ? error.message : null,
    mutate,
  };
}
