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

type AthleteStatusFilter = "active" | "archived" | "all";

type UseJogadoresOptions = {
  includeBots?: boolean;
  status?: AthleteStatusFilter;
};

type ApiErrorPayload = { message?: string; error?: string; code?: string };

export class JogadoresApiError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "JogadoresApiError";
    this.code = code;
  }
}

export function useJogadores(rachaId: string, options?: UseJogadoresOptions) {
  const apiState = useApiState();
  const includeBots = options?.includeBots ?? false;
  const status = options?.status ?? "active";

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
      const payload = body as ApiErrorPayload | undefined;
      const code = payload?.code || payload?.error;
      const message =
        (code === "ATHLETE_HAS_HISTORICAL_USAGE"
          ? "Este jogador já possui histórico no racha e não pode ser excluído. Arquive-o para preservar partidas, rankings, conquistas e estatísticas anteriores."
          : payload?.message) ||
        payload?.error ||
        response.statusText ||
        "Erro ao processar requisicao";
      throw new JogadoresApiError(
        typeof message === "string" ? message : "Erro ao processar requisicao",
        code
      );
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

    const posicaoSecundaria = jogador.posicaoSecundaria ?? jogador.positionSecondary;
    if (posicaoSecundaria !== undefined) {
      if (posicaoSecundaria === null) {
        payload.positionSecondary = null;
      } else {
        const normalized = String(posicaoSecundaria).toLowerCase().trim();
        payload.positionSecondary = normalized || null;
      }
    }

    const foto = jogador.foto ?? jogador.photoUrl ?? jogador.avatarUrl ?? jogador.avatar;
    if (foto !== undefined) payload.photoUrl = foto || null;

    if (jogador.status !== undefined) {
      const normalized = String(jogador.status).toLowerCase();
      if (normalized === "ativo") payload.status = "Ativo";
      else if (normalized === "inativo") payload.status = "Inativo";
      else if (normalized === "suspenso") payload.status = "Suspenso";
      else payload.status = jogador.status;
    }

    const mensalista =
      typeof jogador.mensalista === "boolean"
        ? jogador.mensalista
        : typeof jogador.isMensalista === "boolean"
          ? jogador.isMensalista
          : jogador.isMember;
    if (typeof mensalista === "boolean") payload.isMensalista = mensalista;

    if (jogador.email !== undefined) {
      const emailValue = String(jogador.email).trim().toLowerCase();
      payload.email = emailValue || null;
    }

    const birthDate = jogador.birthDate ?? jogador.dataNascimento ?? jogador.nascimento;
    if (birthDate !== undefined) payload.birthDate = birthDate;

    return payload;
  };

  const params = new URLSearchParams();
  if (includeBots) params.set("includeBots", "true");
  params.set("status", status);
  const query = params.toString();

  const { data, error, isLoading, mutate } = useSWR<Jogador[]>(
    rachaId ? `/api/jogadores${query ? `?${query}` : ""}` : null,
    fetcher,
    {
      onError: (err) => {
        if (process.env.NODE_ENV === "development") {
          console.error("Erro ao carregar jogadores:", err);
        }
      },
    }
  );

  const jogadoresNormalizados = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((jogador) => {
      const nomeRaw = jogador?.nome ?? jogador?.name ?? jogador?.user?.name ?? "";
      const nome = typeof nomeRaw === "string" ? nomeRaw.trim() : "";
      const apelidoRaw = jogador?.apelido ?? jogador?.nickname ?? "";
      const apelido = typeof apelidoRaw === "string" ? apelidoRaw.trim() : "";
      const posicao = jogador?.posicao ?? jogador?.position ?? "Meia";
      const posicaoSecundaria = jogador?.posicaoSecundaria ?? jogador?.positionSecondary ?? null;
      const avatar =
        jogador?.avatarUrl ?? jogador?.avatar ?? jogador?.photoUrl ?? jogador?.foto ?? "";
      const foto =
        jogador?.avatarUrl ?? jogador?.foto ?? jogador?.photoUrl ?? jogador?.avatar ?? undefined;
      const mensalista =
        typeof jogador?.mensalista === "boolean"
          ? jogador.mensalista
          : typeof jogador?.isMensalista === "boolean"
            ? jogador.isMensalista
            : Boolean(jogador?.isMember);
      const isBot = Boolean(jogador?.isBot);
      const status = jogador?.status ?? "Ativo";
      const emailRaw = jogador?.email ?? "";
      const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";
      const timeId = jogador?.timeId ?? "";
      const userId = jogador?.userId ?? jogador?.user?.id ?? null;
      const user = jogador?.user ?? null;
      const membershipRole = jogador?.membershipRole ?? null;
      const membershipStatus = jogador?.membershipStatus ?? null;
      const managedByGlobalProfile = Boolean(jogador?.managedByGlobalProfile ?? userId);
      const isAdministrativeMember = Boolean(
        jogador?.isAdministrativeMember ?? jogador?.managedByAdmin
      );
      const archivedAt = jogador?.archivedAt ?? null;
      const hasHistoricalUsage = Boolean(jogador?.hasHistoricalUsage);
      const canDelete = jogador?.canDelete === true;

      return {
        ...jogador,
        nome,
        apelido,
        posicao,
        posicaoSecundaria,
        avatar,
        foto,
        mensalista,
        isBot,
        status,
        email,
        timeId,
        userId,
        membershipRole,
        membershipStatus,
        managedByGlobalProfile,
        isAdministrativeMember,
        managedByAdmin: isAdministrativeMember,
        archivedAt,
        hasHistoricalUsage,
        canDelete,
        user: user
          ? {
              id: user.id,
              name: user.name ?? null,
              email: user.email ?? null,
              avatarUrl: user.avatarUrl ?? null,
            }
          : null,
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

      await mutate().catch(() => undefined);
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

      await mutate().catch(() => undefined);
      return response;
    });
  };

  const runLifecycleAction = async (id: string, action: "delete" | "archive" | "restore") => {
    const path = action === "delete" ? `/api/jogadores/${id}` : `/api/jogadores/${id}/${action}`;
    const response = await requestJson(path, {
      method: action === "delete" ? "DELETE" : "POST",
    });
    await mutate().catch(() => undefined);
    return response;
  };

  const deleteJogador = async (id: string) => runLifecycleAction(id, "delete");

  const archiveJogador = async (id: string) => {
    return runLifecycleAction(id, "archive");
  };

  const restoreJogador = async (id: string) => {
    return runLifecycleAction(id, "restore");
  };

  const getJogadoresPorTime = (timeId: string) => {
    return (data || []).filter((j) => j.timeId === timeId);
  };

  return {
    jogadores: jogadoresNormalizados,
    isLoading,
    isError: !!error,
    error: error instanceof Error ? error.message : null,
    isMutating: apiState.isLoading,
    isMutationError: apiState.isError,
    mutationError: apiState.error,
    isSuccess: apiState.isSuccess,
    addJogador,
    updateJogador,
    deleteJogador,
    archiveJogador,
    restoreJogador,
    getJogadoresPorTime,
    mutate,
    reset: apiState.reset,
  };
}
