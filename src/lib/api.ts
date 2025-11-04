// src/lib/api.ts
// Camada de abstração centralizada para APIs

import type { ApiRequestData } from "@/types/api";
import type {
  Notification,
  CreateNotificationInput,
  UpdateNotificationInput,
} from "@/types/notificacao";
import type { Athlete } from "@/types/jogador";
import type { Match } from "@/types/partida";
import type { PlayerRankingType, PlayerRankingResponse } from "@/types/ranking";
import { getSession } from "next-auth/react";
import { getApiBase } from "@/lib/get-api-base";

const API_BASE_URL = getApiBase();

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const session = await getSession();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (session?.user?.accessToken) {
        headers["Authorization"] = `Bearer ${session.user.accessToken}`;
      }
      if (session?.user?.tenantSlug) {
        headers["x-tenant-slug"] = session.user.tenantSlug;
      }

      return headers;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.log("Erro ao obter headers de autenticação:", error);
      }
      return {
        "Content-Type": "application/json",
      };
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const authHeaders = await this.getAuthHeaders();
    const config: RequestInit = {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Se for erro de autenticação, redirecionar para login
        if (response.status === 401) {
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }

        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      return { error: errorMessage };
    }
  }

  // Métodos HTTP
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: ApiRequestData): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: ApiRequestData): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async patch<T>(endpoint: string, data?: ApiRequestData): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Instância global do cliente API
export const apiClient = new ApiClient(API_BASE_URL);

// Helpers específicos para diferentes módulos
export const rachaApi = {
  getAll: () => apiClient.get("/rachas"),
  getById: (id: string) => apiClient.get(`/rachas/${id}`),
  create: (data: ApiRequestData) => apiClient.post("/rachas", data),
  update: (id: string, data: ApiRequestData) => apiClient.put(`/rachas/${id}`, data),
  delete: (id: string) => apiClient.delete(`/rachas/${id}`),
};

/* jogadoresApi redefinido após helpers específicos */

export const partidasApi = {
  getAll: () => apiClient.get("/api/partidas"),
  getById: (id: string) => apiClient.get(`/api/partidas/${id}`),
  create: (data: ApiRequestData) => apiClient.post("/api/partidas", data),
  update: (id: string, data: ApiRequestData) => apiClient.put(`/api/partidas/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/partidas/${id}`),
};

export const financeiroApi = {
  getAll: (rachaId: string) => apiClient.get(`/admin/financeiro?rachaId=${rachaId}`),
  create: (data: ApiRequestData) => apiClient.post("/admin/financeiro", data),
  getRelatorios: (rachaId: string) =>
    apiClient.get(`/admin/financeiro/relatorios?rachaId=${rachaId}`),
};

export const estatisticasApi = {
  getArtilheiros: (rachaId: string) =>
    apiClient.get(`/estatisticas/artilheiros?rachaId=${rachaId}`),
  getAssistencias: (rachaId: string) =>
    apiClient.get(`/estatisticas/assistencias?rachaId=${rachaId}`),
  getRankingGeral: (rachaId: string) =>
    apiClient.get(`/estatisticas/ranking-geral?rachaId=${rachaId}`),
  getClassificacaoTimes: (rachaId: string) =>
    apiClient.get(`/estatisticas/classificacao-times?rachaId=${rachaId}`),
};

export const superAdminApi = {
  getRachas: () => apiClient.get("/superadmin/rachas"),
  getMetrics: () => apiClient.get("/superadmin/metrics"),
  getFinanceiro: () => apiClient.get("/superadmin/financeiro"),
  getUsuarios: () => apiClient.get("/superadmin/usuarios"),
};

// API de Configurações e Temas
export const configuracoesApi = {
  // Temas
  getTemas: () => apiClient.get("/configuracoes/temas"),
  getTemaByKey: (key: string) => apiClient.get(`/configuracoes/temas/${key}`),

  // Configurações do Racha
  getRachaConfig: () => apiClient.get("/configuracoes/racha"),
  updateTema: (theme: string) => apiClient.put("/configuracoes/racha/tema", { theme }),
  updateCores: (cores: { primary?: string; secondary?: string; accent?: string }) =>
    apiClient.put("/configuracoes/racha/cores", cores),
  updateConfiguracoes: (settings: {
    allowPlayerRegistration?: boolean;
    allowMatchCreation?: boolean;
    allowFinancialManagement?: boolean;
    allowNotifications?: boolean;
    allowStatistics?: boolean;
    allowRankings?: boolean;
  }) => apiClient.put("/configuracoes/racha/configuracoes", settings),

  // Estatísticas
  getEstatisticas: () => apiClient.get("/configuracoes/racha/estatisticas"),

  // Reset
  resetConfiguracoes: () => apiClient.post("/configuracoes/racha/reset"),
};

// API de Autenticação
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post("/auth/login", credentials),
  register: (userData: { email: string; password: string; name: string }) =>
    apiClient.post("/auth/register", userData),
  refresh: (refreshToken: string) => apiClient.post("/auth/refresh", { refreshToken }),
  logout: () => apiClient.post("/auth/logout"),
  me: () => apiClient.get("/auth/me"),
};

// API de Usuários
export const usersApi = {
  getAll: () => apiClient.get("/users"),
  getById: (id: string) => apiClient.get(`/users/${id}`),
  create: (data: ApiRequestData) => apiClient.post("/users", data),
  update: (id: string, data: ApiRequestData) => apiClient.put(`/users/${id}`, data),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
  updateProfile: (data: ApiRequestData) => apiClient.put("/users/profile", data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.put("/users/password", data),
};

const NEXT_NOTIFICATIONS_ENDPOINT = "/api/admin/notificacoes";
const JSON_CONTENT_TYPE = "application/json; charset=utf-8";
const NEXT_JOGADORES_ENDPOINT = "/api/admin/jogadores";
const NEXT_MATCHES_ENDPOINT = "/api/admin/partidas";
const NEXT_PUBLIC_MATCHES_ENDPOINT = "/api/public/matches";

async function notificationsFetch<T>(
  input: string,
  init?: RequestInit & { skipJson?: boolean }
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", JSON_CONTENT_TYPE);

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", JSON_CONTENT_TYPE);
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const shouldParse = init?.skipJson ? false : isJson;

  let payload: any = null;

  if (shouldParse && response.status !== 204) {
    payload = await response.json().catch(() => null);
  } else if (!shouldParse && !response.ok) {
    payload = await response.text().catch(() => null);
  }

  if (!response.ok) {
    const errorMessage =
      (payload && typeof payload === "object" && "error" in payload && payload.error) ||
      (typeof payload === "string" && payload.length ? payload : null) ||
      `HTTP ${response.status}`;
    throw new Error(String(errorMessage));
  }

  return (payload ?? (undefined as unknown)) as T;
}

async function adminProxyFetch<T>(
  input: string,
  init?: RequestInit & { skipJson?: boolean }
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", JSON_CONTENT_TYPE);

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", JSON_CONTENT_TYPE);
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const shouldParse = init?.skipJson ? false : isJson;

  let payload: any = null;

  if (shouldParse && response.status !== 204) {
    payload = await response.json().catch(() => null);
  } else if (!shouldParse && !response.ok) {
    payload = await response.text().catch(() => null);
  }

  if (!response.ok) {
    const errorMessage =
      (payload && typeof payload === "object" && "error" in payload && payload.error) ||
      (typeof payload === "string" && payload.length ? payload : null) ||
      `HTTP ${response.status}`;
    throw new Error(String(errorMessage));
  }

  return (payload ?? (undefined as unknown)) as T;
}

async function publicMatchesFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      Accept: JSON_CONTENT_TYPE,
      ...(init?.headers ?? {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (!response.ok) {
    const payload = isJson ? await response.json().catch(() => null) : await response.text();
    const errorMessage =
      (payload && typeof payload === "object" && "error" in payload && payload.error) ||
      (typeof payload === "string" && payload.length ? payload : null) ||
      `HTTP ${response.status}`;
    throw new Error(String(errorMessage));
  }

  if (!isJson) {
    return (undefined as unknown) as T;
  }

  return (await response.json()) as T;
}

function buildNotificationsUrl(params?: Record<string, string | number | boolean | undefined>) {
  let url = NEXT_NOTIFICATIONS_ENDPOINT;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    });
    const query = searchParams.toString();
    if (query.length > 0) {
      url = `${url}?${query}`;
    }
  }
  return url;
}

function buildJogadoresUrl(params?: Record<string, string | number | boolean | undefined>) {
  let url = NEXT_JOGADORES_ENDPOINT;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    });
    const query = searchParams.toString();
    if (query.length > 0) {
      url = `${url}?${query}`;
    }
  }
  return url;
}

function buildAdminMatchesUrl(params?: Record<string, string | number | boolean | undefined>) {
  let url = NEXT_MATCHES_ENDPOINT;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    });
    const query = searchParams.toString();
    if (query.length > 0) {
      url = `${url}?${query}`;
    }
  }
  return url;
}

function buildPublicMatchesUrl(params?: Record<string, string | number | boolean | undefined>) {
  let url = NEXT_PUBLIC_MATCHES_ENDPOINT;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    });
    const query = searchParams.toString();
    if (query.length > 0) {
      url = `${url}?${query}`;
    }
  }
  return url;
}

function buildQueryString(params?: Record<string, string | number | boolean | undefined>) {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query.length > 0 ? `?${query}` : "";
}

export const jogadoresApi = {
  async list(params?: Record<string, string | number | boolean>) {
    return adminProxyFetch<Athlete[]>(buildJogadoresUrl(params), {
      method: "GET",
    });
  },
  async getById(id: string, params?: Record<string, string | number | boolean>) {
    const query = buildQueryString(params);
    const url = `${NEXT_JOGADORES_ENDPOINT}/${encodeURIComponent(id)}${query}`;
    return adminProxyFetch<Athlete>(url, { method: "GET" });
  },
  async create(payload: ApiRequestData) {
    return adminProxyFetch<Athlete>(NEXT_JOGADORES_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async update(id: string, payload: ApiRequestData) {
    const url = `${NEXT_JOGADORES_ENDPOINT}/${encodeURIComponent(id)}`;
    return adminProxyFetch<Athlete>(url, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  async delete(id: string) {
    const url = `${NEXT_JOGADORES_ENDPOINT}/${encodeURIComponent(id)}`;
    await adminProxyFetch<void>(url, {
      method: "DELETE",
      skipJson: true,
    });
  },
  async getBirthdays(params?: Record<string, string | number | boolean>) {
    const query = buildQueryString(params);
    const url = `${NEXT_JOGADORES_ENDPOINT}/aniversariantes${query}`;
    return adminProxyFetch<Athlete[]>(url, { method: "GET" });
  },
};

type PublicMatchesListResponse = {
  slug: string;
  total: number;
  results: Match[];
};

type PublicMatchResponse = {
  slug: string;
  result: Match;
};

export const adminMatchesApi = {
  async list(params?: Record<string, string | number | boolean>) {
    return adminProxyFetch<Match[]>(buildAdminMatchesUrl(params), { method: "GET" });
  },
  async getById(id: string, params?: Record<string, string | number | boolean>) {
    const query = buildQueryString(params);
    const url = `${NEXT_MATCHES_ENDPOINT}/${encodeURIComponent(id)}${query}`;
    return adminProxyFetch<Match>(url, { method: "GET" });
  },
};

export const publicMatchesApi = {
  async list(params?: Record<string, string | number | boolean>) {
    return publicMatchesFetch<PublicMatchesListResponse>(buildPublicMatchesUrl(params), {
      method: "GET",
    });
  },
  async getById(id: string, params?: Record<string, string | number | boolean>) {
    const query = buildQueryString(params);
    const url = `${NEXT_PUBLIC_MATCHES_ENDPOINT}/${encodeURIComponent(id)}${query}`;
    return publicMatchesFetch<PublicMatchResponse>(url, { method: "GET" });
  },
};

// API de Notificações
export const notificacoesApi = {
  async list(params?: Record<string, string | number | boolean>) {
    return notificationsFetch<Notification[]>(buildNotificationsUrl(params), {
      method: "GET",
    });
  },
  async create(payload: CreateNotificationInput) {
    return notificationsFetch<Notification>(NEXT_NOTIFICATIONS_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async update(id: string, payload: UpdateNotificationInput) {
    const url = `${NEXT_NOTIFICATIONS_ENDPOINT}/${encodeURIComponent(id)}`;
    return notificationsFetch<Notification>(url, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  async markAsRead(id: string) {
    return notificacoesApi.update(id, { isRead: true });
  },
  async markAllAsRead() {
    const url = `${NEXT_NOTIFICATIONS_ENDPOINT}/mark-all`;
    return notificationsFetch<{ updated: number; failed?: number }>(url, {
      method: "PATCH",
    });
  },
  async delete(id: string) {
    const url = `${NEXT_NOTIFICATIONS_ENDPOINT}/${encodeURIComponent(id)}`;
    await notificationsFetch<void>(url, {
      method: "DELETE",
      skipJson: true,
    });
  },
};

type RankingQueryParams = {
  limit?: number;
  position?: string;
  period?: "all" | "year" | "quarter" | "custom";
  year?: number;
  quarter?: number;
  start?: string;
  end?: string;
};

function serializeRankingParams(params?: RankingQueryParams) {
  if (!params) return undefined;

  const query = new URLSearchParams();

  if (params.limit !== undefined) {
    query.set("limit", String(params.limit));
  }
  if (params.position) {
    query.set("position", params.position);
  }
  if (params.period) {
    query.set("period", params.period);
  }
  if (params.year !== undefined) {
    query.set("year", String(params.year));
  }
  if (params.quarter !== undefined) {
    query.set("quarter", String(params.quarter));
  }
  if (params.start) {
    query.set("start", params.start);
  }
  if (params.end) {
    query.set("end", params.end);
  }

  const entries = Object.fromEntries(query.entries());
  return Object.keys(entries).length ? entries : undefined;
}

function getPlayerRankings(type: PlayerRankingType, params?: RankingQueryParams) {
  return apiClient.get<PlayerRankingResponse>(
    `/rankings/${type}`,
    serializeRankingParams(params)
  );
}

// API de Rankings
export const rankingsApi = {
  getPlayerRankings,
  getRankingGeral: (params?: RankingQueryParams) => getPlayerRankings("geral", params),
  getRankingArtilheiros: (params?: RankingQueryParams) => getPlayerRankings("artilheiros", params),
  getRankingAssistencias: (params?: RankingQueryParams) =>
    getPlayerRankings("assistencias", params),
  getRankingTimes: () => apiClient.get("/rankings/times"),
};

// API de Campeões
export const campeoesApi = {
  getAll: () => apiClient.get("/api/campeoes"),
  getResumo: (params?: Record<string, string>) => apiClient.get("/api/campeoes/resumo", params),
  getById: (id: string) => apiClient.get(`/api/campeoes/${id}`),
  create: (data: ApiRequestData) => apiClient.post("/api/campeoes", data),
  update: (id: string, data: ApiRequestData) => apiClient.put(`/api/campeoes/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/campeoes/${id}`),
};

// API de Times
export const timesApi = {
  getAll: () => apiClient.get("/times"),
  getById: (id: string) => apiClient.get(`/times/${id}`),
  create: (data: ApiRequestData) => apiClient.post("/times", data),
  update: (id: string, data: ApiRequestData) => apiClient.put(`/times/${id}`, data),
  delete: (id: string) => apiClient.delete(`/times/${id}`),
  getRanking: () => apiClient.get("/times/ranking"),
};

// API de Presenças
export const presencasApi = {
  getAll: (partidaId?: string) =>
    apiClient.get(`/presencas${partidaId ? `?partidaId=${partidaId}` : ""}`),
  getById: (id: string) => apiClient.get(`/presencas/${id}`),
  create: (data: ApiRequestData) => apiClient.post("/presencas", data),
  update: (id: string, data: ApiRequestData) => apiClient.put(`/presencas/${id}`, data),
  delete: (id: string) => apiClient.delete(`/presencas/${id}`),
  confirmarPresenca: (id: string) => apiClient.put(`/presencas/${id}/confirmar`),
  cancelarPresenca: (id: string) => apiClient.put(`/presencas/${id}/cancelar`),
};

// API de Influencers
export const influencersApi = {
  getAll: () => apiClient.get("/influencers"),
  getById: (id: string) => apiClient.get(`/influencers/${id}`),
  create: (data: ApiRequestData) => apiClient.post("/influencers", data),
  update: (id: string, data: ApiRequestData) => apiClient.put(`/influencers/${id}`, data),
  delete: (id: string) => apiClient.delete(`/influencers/${id}`),
  getEstatisticas: () => apiClient.get("/influencers/estatisticas"),
  getPagamentos: (id: string) => apiClient.get(`/influencers/${id}/pagamentos`),
  createPagamento: (id: string, data: ApiRequestData) =>
    apiClient.post(`/influencers/${id}/pagamentos`, data),
};

// API de Logs
export const logsApi = {
  getAll: (filters?: { action?: string; userId?: string; startDate?: string; endDate?: string }) =>
    apiClient.get("/logs", filters),
  getById: (id: string) => apiClient.get(`/logs/${id}`),
  getEstatisticas: () => apiClient.get("/logs/estatisticas"),
};

// API de Health Check
export const healthApi = {
  check: () => apiClient.get("/health"),
  checkDatabase: () => apiClient.get("/health/database"),
  checkRedis: () => apiClient.get("/health/redis"),
};
