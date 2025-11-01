// src/lib/api.ts
// Camada de abstração centralizada para APIs

import type { ApiRequestData } from "@/types/api";
import type { PlayerRankingType } from "@/types/ranking";
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

export const jogadoresApi = {
  getAll: () => apiClient.get("/api/jogadores"),
  getById: (id: string) => apiClient.get(`/api/jogadores/${id}`),
  create: (data: ApiRequestData) => apiClient.post("/api/jogadores", data),
  update: (id: string, data: ApiRequestData) => apiClient.put(`/api/jogadores/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/jogadores/${id}`),
  getBirthdays: (params?: Record<string, string>) =>
    apiClient.get("/api/jogadores/aniversariantes", params),
};

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

// API de Notificações
export const notificacoesApi = {
  getAll: () => apiClient.get("/notificacoes"),
  getById: (id: string) => apiClient.get(`/notificacoes/${id}`),
  markAsRead: (id: string) => apiClient.put(`/notificacoes/${id}/read`),
  markAllAsRead: () => apiClient.put("/notificacoes/read-all"),
  delete: (id: string) => apiClient.delete(`/notificacoes/${id}`),
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
  return apiClient.get(`/rankings/${type}`, serializeRankingParams(params));
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
