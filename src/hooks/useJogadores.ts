"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useApiState } from "./useApiState";
import type { Jogador } from "@/types/jogador";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erro ao buscar jogadores");
  }
  return response.json();
};

export function useJogadores(rachaId: string, options?: { includeBots?: boolean }) {
  const apiState = useApiState();
  const includeBots = options?.includeBots ?? false;

  const requestJson = async (input: string, init?: RequestInit) => {
    const response = await fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
    const text = await response.text();
    let body: unknown = undefined;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }

    if (!response.ok) {
      const message =
        (body as { message?: string; error?: string } | undefined)?.message ||
        (body as { error?: string } | undefined)?.error ||
        response.statusText ||
        "Erro ao processar requisicao";
      throw new Error(typeof message === "string" ? message : "Erro ao processar requisicao");
    }

    return body;
  };

  const mapJogadorPayload = (jogador: Partial<Jogador>) => {
    const payload: Record<string, unknown> = {};
    const nome = jogador.nome ?? jogador.name;
    if (nome !== undefined) {
      payload.name = typeof nome === "string" ? nome.trim() : nome;
    }

    const apelido = jogador.apelido ?? jogador.nickname;
    if (apelido !== undefined) {
      const apelidoValue = typeof apelido === "string" ? apelido.trim() : apelido;
      payload.nickname = apelidoValue || null;
    }

    const posicao = jogador.posicao ?? jogador.position;
    if (posicao !== undefined) payload.position = String(posicao).toLowerCase();

    const foto = jogador.foto ?? jogador.photoUrl ?? jogador.avatar;
    if (foto !== undefined) payload.photoUrl = foto || null;

    if (jogador.status !== undefined) {
      const normalized = String(jogador.status).toLowerCase();
      if (normalized === "ativo") payload.status = "Ativo";
      else if (normalized === "inativo") payload.status = "Inativo";
      else if (normalized === "suspenso") payload.status = "Suspenso";
      else payload.status = jogador.status;
    }

    const mensalista =
      typeof jogador.mensalista === "boolean" ? jogador.mensalista : jogador.isMember;
    if (typeof mensalista === "boolean") payload.isMember = mensalista;

    if (jogador.email !== undefined) {
      const emailValue = String(jogador.email).trim().toLowerCase();
      payload.email = emailValue || null;
    }

    const birthDate = jogador.birthDate ?? jogador.dataNascimento ?? jogador.nascimento;
    if (birthDate !== undefined) payload.birthDate = birthDate;

    return payload;
  };

  const { data, error, isLoading, mutate } = useSWR<Jogador[]>(
    rachaId
      ? `/api/jogadores?${new URLSearchParams({
          rachaId,
          ...(includeBots ? { includeBots: "true" } : {}),
        }).toString()}`
      : null,
    fetcher,
    {
      onError: (err) => {
        if (process.env.NODE_ENV === "development") {
          console.log("Erro ao carregar jogadores:", err);
        }
      },
    }
  );

  const jogadoresNormalizados = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((jogador: any) => {
      const nome = jogador?.nome ?? jogador?.name ?? jogador?.user?.name ?? "";
      const apelido = jogador?.apelido ?? jogador?.nickname ?? "";
      const posicao = jogador?.posicao ?? jogador?.position ?? "Meia";
      const avatar = jogador?.avatar ?? jogador?.photoUrl ?? jogador?.foto ?? "";
      const foto = jogador?.foto ?? jogador?.photoUrl ?? jogador?.avatar ?? undefined;
      const mensalista =
        typeof jogador?.mensalista === "boolean" ? jogador.mensalista : Boolean(jogador?.isMember);
      const isBot = Boolean(jogador?.isBot);
      const status = jogador?.status ?? "Ativo";
      const email = jogador?.email ?? "";
      const timeId = jogador?.timeId ?? "";
      const userId = jogador?.userId ?? jogador?.user?.id ?? null;
      const user = jogador?.user ?? null;

      return {
        ...jogador,
        nome,
        apelido,
        posicao,
        avatar,
        foto,
        mensalista,
        isBot,
        status,
        email,
        timeId,
        userId,
        user,
      } as Jogador;
    });
  }, [data]);

  const addJogador = async (jogador: Partial<Jogador>) => {
    if (!rachaId) return null;

    return apiState.handleAsync(async () => {
      const payload = mapJogadorPayload(jogador);
      const response = await requestJson("/api/jogadores", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      await mutate();
      return response;
    });
  };

  const updateJogador = async (id: string, jogador: Partial<Jogador>) => {
    return apiState.handleAsync(async () => {
      const payload = mapJogadorPayload(jogador);
      const response = await requestJson(`/api/jogadores/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      await mutate();
      return response;
    });
  };

  const deleteJogador = async (id: string) => {
    return apiState.handleAsync(async () => {
      const response = await requestJson(`/api/jogadores/${id}`, {
        method: "DELETE",
      });

      await mutate();
      return response;
    });
  };

  const getJogadoresPorTime = (timeId: string) => {
    return (data || []).filter((j) => j.timeId === timeId);
  };

  return {
    jogadores: jogadoresNormalizados,
    isLoading: isLoading || apiState.isLoading,
    isError: !!error || apiState.isError,
    error: apiState.error,
    isSuccess: apiState.isSuccess,
    addJogador,
    updateJogador,
    deleteJogador,
    getJogadoresPorTime,
    mutate,
    reset: apiState.reset,
  };
}
