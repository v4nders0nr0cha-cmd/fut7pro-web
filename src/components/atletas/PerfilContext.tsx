"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { useSession } from "next-auth/react";
import type { Atleta, PosicaoAtleta, StatusAtleta } from "@/types/atletas";
import type { MeResponse } from "@/types/me";
import { useMe } from "@/hooks/useMe";
import { slugify } from "@/utils/slugify";

interface PerfilContextType {
  usuario: Atleta | null;
  roleLabel: string | null;
  membershipStatus: string | null;
  isPendingApproval: boolean;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  isAuthenticated: boolean;
  atualizarPerfil: (dados: PerfilUpdatePayload) => Promise<void>;
}

type PerfilUpdatePayload = {
  firstName: string;
  nickname: string;
  position: PosicaoAtleta;
  positionSecondary?: PosicaoAtleta | null;
  avatarFile?: File | null;
};

const PerfilContext = createContext<PerfilContextType | null>(null);

const DEFAULT_AVATAR = "/images/jogadores/jogador_padrao_01.jpg";

const ROLE_LABELS: Record<string, string> = {
  PRESIDENTE: "Presidente",
  VICE_PRESIDENTE: "Vice-presidente",
  DIRETOR_FUTEBOL: "Diretor de Futebol",
  DIRETOR_FINANCEIRO: "Diretor Financeiro",
  ADMIN: "Administrador",
};

const EMPTY_STATS: Atleta["estatisticas"] = {
  historico: {
    jogos: 0,
    gols: 0,
    assistencias: 0,
    campeaoDia: 0,
    mediaVitorias: 0,
    pontuacao: 0,
  },
  anual: {},
};

const EMPTY_CONQUISTAS: Atleta["conquistas"] = {
  titulosGrandesTorneios: [],
  titulosAnuais: [],
  titulosQuadrimestrais: [],
};

type SessionUser = {
  id?: string;
  name?: string | null;
  image?: string | null;
  tenantSlug?: string | null;
};

function normalizePosition(value?: string | null): PosicaoAtleta {
  if (!value) return "Atacante";
  const normalized = value.trim().toLowerCase();
  if (normalized === "goleiro" || normalized === "gol") return "Goleiro";
  if (normalized === "zagueiro" || normalized === "zag") return "Zagueiro";
  if (normalized === "meia" || normalized === "mei") return "Meia";
  if (normalized === "atacante" || normalized === "ata") return "Atacante";
  return "Atacante";
}

function normalizeOptionalPosition(value?: string | null): PosicaoAtleta | null {
  if (!value) return null;
  return normalizePosition(value);
}

function normalizeStatus(value?: string | null): StatusAtleta {
  if (!value) return "Ativo";
  const normalized = value.trim().toLowerCase();
  if (normalized === "ativo") return "Ativo";
  if (normalized === "inativo") return "Inativo";
  if (normalized === "suspenso") return "Suspenso";
  return "Ativo";
}

function buildAtletaFromMe(me: MeResponse | null, sessionUser?: SessionUser): Atleta | null {
  if (!me?.athlete && !sessionUser) {
    return null;
  }

  const nome = me?.athlete?.firstName || sessionUser?.name || "Atleta";
  const apelido = me?.athlete?.nickname ?? null;
  const foto = me?.athlete?.avatarUrl || sessionUser?.image || DEFAULT_AVATAR;
  const mensalista =
    typeof me?.athlete?.mensalista === "boolean"
      ? me.athlete.mensalista
      : me?.membership?.role === "PRESIDENTE";

  return {
    id: me?.athlete?.id || sessionUser?.id || "usuario-autenticado",
    nome,
    apelido,
    slug: me?.athlete?.slug || slugify(nome),
    foto,
    posicao: normalizePosition(me?.athlete?.position),
    posicaoSecundaria: normalizeOptionalPosition(me?.athlete?.positionSecondary),
    status: normalizeStatus(me?.athlete?.status),
    mensalista,
    ultimaPartida: undefined,
    totalJogos: 0,
    estatisticas: EMPTY_STATS,
    historico: [],
    conquistas: EMPTY_CONQUISTAS,
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
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const sessionUser = session?.user as SessionUser | undefined;
  const {
    me,
    isLoading: isLoadingMe,
    isError,
    error,
    mutate,
  } = useMe({
    enabled: isAuthenticated,
  });

  const usuario = useMemo(() => buildAtletaFromMe(me, sessionUser), [me, sessionUser]);
  const roleLabel = useMemo(() => {
    if (!me?.membership?.role) return null;
    return ROLE_LABELS[me.membership.role] ?? me.membership.role;
  }, [me?.membership?.role]);
  const membershipStatus = me?.membership?.status ?? null;
  const isPendingApproval = membershipStatus === "PENDENTE";

  const tenantId = me?.tenant?.tenantId ?? null;
  const tenantSlug = me?.tenant?.tenantSlug ?? sessionUser?.tenantSlug ?? null;

  const atualizarPerfil = useCallback(
    async (dados: PerfilUpdatePayload) => {
      if (!tenantId) {
        throw new Error("Perfil nao carregado.");
      }
      if (isPendingApproval) {
        throw new Error("Aguardando aprovacao do admin.");
      }

      let avatarUrl: string | undefined;
      if (dados.avatarFile) {
        const formData = new FormData();
        formData.append("file", dados.avatarFile);
        const uploadRes = await fetch("/api/uploads/avatar", {
          method: "POST",
          headers: tenantSlug ? { "x-tenant-slug": tenantSlug } : undefined,
          body: formData,
        });
        const uploadBody = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadBody?.message || uploadBody?.error || "Erro ao enviar imagem.");
        }
        if (!uploadBody?.url) {
          throw new Error("Upload retornou uma URL invalida.");
        }
        avatarUrl = uploadBody.url;
      }

      const payload: Record<string, unknown> = {
        firstName: dados.firstName.trim(),
        nickname: dados.nickname.trim(),
        position: dados.position,
      };
      if (dados.positionSecondary !== undefined) {
        payload.positionSecondary = dados.positionSecondary ?? null;
      }
      if (typeof avatarUrl !== "undefined") {
        payload.avatarUrl = avatarUrl;
      }

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (tenantSlug) {
        headers["x-tenant-slug"] = tenantSlug;
      }

      const res = await fetch(`/api/tenants/${tenantId}/athletes/me`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.message || body?.error || "Erro ao salvar perfil.");
      }

      await mutate();
    },
    [tenantId, tenantSlug, mutate, isPendingApproval]
  );

  const isLoading = status === "loading" || (isAuthenticated && isLoadingMe);
  const errorMessage = isAuthenticated && isError ? error : null;

  return (
    <PerfilContext.Provider
      value={{
        usuario,
        roleLabel,
        membershipStatus,
        isPendingApproval,
        isLoading,
        isError: Boolean(errorMessage),
        error: errorMessage,
        isAuthenticated,
        atualizarPerfil,
      }}
    >
      {children}
    </PerfilContext.Provider>
  );
}
