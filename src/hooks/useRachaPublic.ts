// src/hooks/useRachaPublic.ts

import useSWR from "swr";
import type { Racha } from "@/types/racha";
import { validateSafe, rachaSchema } from "@/lib/validation";

function normalizeAdminRole(
  role?: string
): "presidente" | "vicepresidente" | "diretorfutebol" | "diretorfinanceiro" | "leitor" {
  const normalized = String(role || "").toUpperCase();
  switch (normalized) {
    case "PRESIDENTE":
      return "presidente";
    case "VICE_PRESIDENTE":
      return "vicepresidente";
    case "DIRETOR_FUTEBOL":
      return "diretorfutebol";
    case "DIRETOR_FINANCEIRO":
      return "diretorfinanceiro";
    default:
      return "leitor";
  }
}

function mapTenantToRacha(data: any): Racha {
  const createdAt =
    (data?.criadoEm ?? data?.createdAt ?? data?.atualizadoEm ?? data?.updatedAt) ||
    new Date().toISOString();

  const rawThemeKey = data?.themeKey ?? data?.theme_key ?? data?.tema ?? undefined;
  const admins = Array.isArray(data?.admins)
    ? data.admins.map((admin: any) => ({
        id: admin?.id ?? admin?.usuarioId ?? admin?.userId ?? "",
        usuarioId: admin?.usuarioId ?? admin?.userId ?? "",
        nome: admin?.nome ?? admin?.name ?? admin?.user?.name ?? undefined,
        email: admin?.email ?? admin?.user?.email ?? undefined,
        apelido: admin?.apelido ?? admin?.nickname ?? undefined,
        foto: admin?.foto ?? admin?.photoUrl ?? admin?.avatarUrl ?? undefined,
        posicao: admin?.posicao ?? admin?.position ?? undefined,
        role: normalizeAdminRole(admin?.role),
        status: admin?.status ?? "ativo",
        criadoEm: admin?.criadoEm ?? admin?.createdAt ?? undefined,
        athleteId: admin?.athleteId ?? admin?.athlete_id ?? undefined,
        athleteSlug: admin?.athleteSlug ?? admin?.athlete_slug ?? undefined,
      }))
    : undefined;

  return {
    id: data?.id ?? data?.tenantId ?? data?.slug ?? "",
    nome: data?.nome ?? data?.name ?? "",
    slug: data?.slug ?? "",
    descricao: data?.descricao ?? undefined,
    logoUrl: data?.logoUrl ?? data?.logo ?? undefined,
    tema: data?.tema ?? rawThemeKey,
    themeKey: rawThemeKey,
    regras: data?.regras ?? undefined,
    ownerId: data?.ownerId ?? "",
    ativo: typeof data?.ativo === "boolean" ? data.ativo : true,
    criadoEm: data?.criadoEm ?? data?.createdAt ?? createdAt,
    atualizadoEm: data?.atualizadoEm ?? data?.updatedAt ?? createdAt,
    financeiroVisivel:
      typeof data?.financeiroVisivel === "boolean" ? data.financeiroVisivel : false,
    admins,
    jogadores: data?.jogadores ?? undefined,
  };
}

async function fetcher(url: string): Promise<Racha> {
  const res = await fetch(url);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Erro desconhecido" }));
    throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  const normalized = mapTenantToRacha(data);

  // Validar dados recebidos
  const validation = validateSafe(rachaSchema, normalized) as
    | { success: true; data: Racha }
    | { success: false; errors: string[] };
  if (!validation.success) {
    const errors = (validation as { errors: string[] }).errors;
    throw new Error(`Dados invalidos: ${errors.join(", ")}`);
  }

  return validation.data;
}

/**
 * Busca os detalhes de um racha especifico por slug ou ID (API publica).
 * @param identifier string (slug ou ID do racha)
 */
export function useRachaPublic(identifier: string) {
  const slugValue = identifier?.trim();
  const { data, error, mutate, isLoading } = useSWR(
    slugValue ? `/api/public/${encodeURIComponent(slugValue)}/tenant` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 segundos
      errorRetryCount: 3,
      errorRetryInterval: 5000, // 5 segundos
    }
  );

  return {
    racha: data,
    isLoading,
    isError: error,
    error: error?.message,
    mutate,
  };
}
