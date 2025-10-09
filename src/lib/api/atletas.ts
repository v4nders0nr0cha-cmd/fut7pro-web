import { apiFetch } from "@/lib/api/fetcher";
import type { Atleta, EstatisticasSimples, JogoAtleta } from "@/types/atletas";
import type { ConquistasAtleta } from "@/types/estatisticas";

const ADMIN_ATLETA_BASE = "/admin/atletas/me";

type PerfilPayload = { atleta?: Atleta } | { data?: Atleta } | Atleta | null | undefined;

type EstatisticasPayload =
  | {
      temporadaAtual?: EstatisticasSimples | null;
      temporada_atual?: EstatisticasSimples | null;
      atual?: EstatisticasSimples | null;
      historico?: EstatisticasSimples | null;
      total?: EstatisticasSimples | null;
      allTime?: EstatisticasSimples | null;
    }
  | EstatisticasSimples
  | null
  | undefined;

type ConquistasPayload =
  | ConquistasAtleta
  | {
      conquistas?: ConquistasAtleta;
      titulosGrandesTorneios?: ConquistasAtleta["titulosGrandesTorneios"];
      titulosAnuais?: ConquistasAtleta["titulosAnuais"];
      titulosQuadrimestrais?: ConquistasAtleta["titulosQuadrimestrais"];
    }
  | null
  | undefined;

type HistoricoPayload =
  | { historico?: JogoAtleta[]; data?: JogoAtleta[]; items?: JogoAtleta[] }
  | JogoAtleta[]
  | null
  | undefined;

const ESTATISTICAS_VAZIAS: EstatisticasSimples = {
  jogos: 0,
  gols: 0,
  assistencias: 0,
  campeaoDia: 0,
  mediaVitorias: 0,
  pontuacao: 0,
};

const CONQUISTAS_VAZIAS: ConquistasAtleta = {
  titulosGrandesTorneios: [],
  titulosAnuais: [],
  titulosQuadrimestrais: [],
};

const HISTORICO_VAZIO: JogoAtleta[] = [];

function normalizarPerfil(payload: PerfilPayload): Atleta | null {
  if (!payload) return null;
  if ("atleta" in payload && payload.atleta) return payload.atleta;
  if ("data" in payload && payload.data) return payload.data;
  return payload as Atleta;
}

function normalizarEstatisticas(payload: EstatisticasPayload): {
  temporadaAtual: EstatisticasSimples;
  historico: EstatisticasSimples;
} {
  if (!payload) {
    return { temporadaAtual: ESTATISTICAS_VAZIAS, historico: ESTATISTICAS_VAZIAS };
  }

  if (Array.isArray(payload)) {
    return { temporadaAtual: ESTATISTICAS_VAZIAS, historico: ESTATISTICAS_VAZIAS };
  }

  if ("jogos" in (payload as EstatisticasSimples)) {
    const value = payload as EstatisticasSimples;
    return { temporadaAtual: value, historico: value };
  }

  const obj = payload as Record<string, EstatisticasSimples | null | undefined>;
  return {
    temporadaAtual: obj.temporadaAtual ?? obj.temporada_atual ?? obj.atual ?? ESTATISTICAS_VAZIAS,
    historico: obj.historico ?? obj.total ?? obj.allTime ?? ESTATISTICAS_VAZIAS,
  };
}

function normalizarConquistas(payload: ConquistasPayload): ConquistasAtleta {
  if (!payload) return CONQUISTAS_VAZIAS;
  if ("conquistas" in payload && payload.conquistas) return payload.conquistas;
  if (
    "titulosGrandesTorneios" in payload ||
    "titulosAnuais" in payload ||
    "titulosQuadrimestrais" in payload
  ) {
    return {
      titulosGrandesTorneios:
        payload.titulosGrandesTorneios ?? CONQUISTAS_VAZIAS.titulosGrandesTorneios,
      titulosAnuais: payload.titulosAnuais ?? CONQUISTAS_VAZIAS.titulosAnuais,
      titulosQuadrimestrais:
        payload.titulosQuadrimestrais ?? CONQUISTAS_VAZIAS.titulosQuadrimestrais,
    };
  }
  return payload as ConquistasAtleta;
}

function normalizarHistorico(payload: HistoricoPayload): JogoAtleta[] {
  if (!payload) return HISTORICO_VAZIO;
  if (Array.isArray(payload)) return payload;
  if ("historico" in payload && payload.historico) return payload.historico;
  if ("data" in payload && payload.data) return payload.data;
  if ("items" in payload && payload.items) return payload.items;
  return HISTORICO_VAZIO;
}

export async function obterPerfilAdministrador(): Promise<Atleta | null> {
  try {
    const response = await apiFetch<PerfilPayload>(ADMIN_ATLETA_BASE);
    return normalizarPerfil(response);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Falha ao carregar perfil do administrador", error);
    }
    return null;
  }
}

export async function atualizarPerfilAdministrador(formData: FormData) {
  try {
    const response = await apiFetch<PerfilPayload>(ADMIN_ATLETA_BASE, {
      method: "PUT",
      body: formData,
    });
    return normalizarPerfil(response);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Falha ao atualizar perfil do administrador", error);
    }
    throw error;
  }
}

export async function obterEstatisticasAdministrador(params?: {
  temporada?: number;
}): Promise<{ temporadaAtual: EstatisticasSimples; historico: EstatisticasSimples }> {
  const query = params?.temporada ? `?temporada=${params.temporada}` : "";
  try {
    const response = await apiFetch<EstatisticasPayload>(
      `${ADMIN_ATLETA_BASE}/estatisticas${query}`
    );
    return normalizarEstatisticas(response);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Falha ao carregar estatisticas do administrador", error);
    }
    return { temporadaAtual: ESTATISTICAS_VAZIAS, historico: ESTATISTICAS_VAZIAS };
  }
}

export async function obterConquistasAdministrador(): Promise<ConquistasAtleta> {
  try {
    const response = await apiFetch<ConquistasPayload>(`${ADMIN_ATLETA_BASE}/conquistas`);
    return normalizarConquistas(response);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Falha ao carregar conquistas do administrador", error);
    }
    return CONQUISTAS_VAZIAS;
  }
}

export async function obterHistoricoAdministrador(): Promise<JogoAtleta[]> {
  try {
    const response = await apiFetch<HistoricoPayload>(`${ADMIN_ATLETA_BASE}/historico`);
    return normalizarHistorico(response);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Falha ao carregar historico do administrador", error);
    }
    return HISTORICO_VAZIO;
  }
}

export const fallbackEstatisticas = ESTATISTICAS_VAZIAS;
export const fallbackConquistas = CONQUISTAS_VAZIAS;
export const fallbackHistorico = HISTORICO_VAZIO;
