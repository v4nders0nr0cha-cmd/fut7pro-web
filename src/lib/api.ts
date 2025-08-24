// src/lib/api.ts
// Camada de abstração centralizada para APIs

import type { ApiRequestData } from "@/types/api";
import { getSession } from "next-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

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

// Cache em memória para dados de times (usado para normalização)
let teamsCache: any[] | null = null;

// Função para debug do cache
function logCacheStatus() {
  console.log("🔍 Status do cache de times:", {
    hasCache: !!teamsCache,
    cacheLength: teamsCache?.length || 0,
    cacheIds: teamsCache?.map((t) => t.id) || [],
  });
}

// Adapter de normalização de dados para demo
function normalizeDemoData<T>(endpoint: string, data: T): T {
  // Só normalizar se for endpoint demo
  if (!endpoint.includes("/api/")) return data;

  try {
    // Normalizar /api/teams
    if (endpoint.includes("/teams")) {
      const teams = data as any[];
      teamsCache = teams; // Atualizar cache
      console.log("📊 Cache de times atualizado:", teams.length, "times");

      return teams.map((team) => ({
        ...team,
        logoUrl: team.logo || "/images/logos/default-team.png",
        players:
          team.players?.map((playerId: string) => ({
            id: playerId,
            name: `Jogador ${playerId.split("-")[1]}`,
            nickname: `J${playerId.split("-")[1]}`,
            position: "Atacante",
            photoUrl: "/images/players/default-player.png",
            stats: { goals: 0, assists: 0 },
          })) || [],
      })) as T;
    }

    // Normalizar /api/matches
    if (endpoint.includes("/matches")) {
      const matches = data as any[];
      console.log("⚽ Normalizando partidas:", matches.length, "partidas");
      logCacheStatus();

      return matches.map((match) => {
        // Resolver nomes dos times usando cache
        const homeTeam = teamsCache?.find((t) => t.id === match.homeTeam);
        const awayTeam = teamsCache?.find((t) => t.id === match.awayTeam);

        console.log(
          "🔄 Match:",
          match.id,
          "- Home:",
          match.homeTeam,
          "→",
          homeTeam?.name,
          "- Away:",
          match.awayTeam,
          "→",
          awayTeam?.name,
        );

        return {
          ...match,
          status:
            match.homeScore !== null && match.awayScore !== null
              ? "finished"
              : "scheduled",
          home: {
            teamId: match.homeTeam,
            name: homeTeam?.name || `Time ${match.homeTeam.split("-")[1]}`,
            logoUrl: homeTeam?.logo || "/images/logos/default-team.png",
            score: match.homeScore,
          },
          away: {
            teamId: match.awayTeam,
            name: awayTeam?.name || `Time ${match.awayTeam.split("-")[1]}`,
            logoUrl: awayTeam?.logo || "/images/logos/default-team.png",
            score: match.awayScore,
          },
        };
      }) as T;
    }

    // Normalizar /api/rankings
    if (endpoint.includes("/rankings")) {
      const rankings = data as any[];
      console.log("🏆 Normalizando rankings:", rankings.length, "rankings");

      return rankings.map((ranking) => {
        // Resolver nome do time usando cache
        const team = teamsCache?.find((t) => t.id === ranking.teamId);

        return {
          ...ranking,
          playerName: `Jogador ${ranking.playerId.split("-")[1]}`,
          teamName: team?.name || `Time ${ranking.teamId.split("-")[1]}`,
          position: ranking.position || "Atacante",
        };
      }) as T;
    }

    // Normalizar /api/team-rankings
    if (endpoint.includes("/team-rankings")) {
      const teamRankings = data as any[];
      console.log(
        "📈 Normalizando rankings de times:",
        teamRankings.length,
        "rankings",
      );

      return teamRankings.map((ranking) => {
        // Resolver nome do time usando cache
        const team = teamsCache?.find((t) => t.id === ranking.teamId);

        return {
          ...ranking,
          teamName: team?.name || `Time ${ranking.teamId.split("-")[1]}`,
          played: ranking.games || 0,
          gf: ranking.goalsFor || 0,
          ga: ranking.goalsAgainst || 0,
          gd: ranking.goalDifference || 0,
        };
      }) as T;
    }

    console.log("✅ Endpoint não requer normalização:", endpoint);
    return data;
  } catch (error) {
    console.warn("❌ Erro na normalização de dados demo:", error);
    return data;
  }
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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
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

        throw new Error(
          errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      const data = await response.json();

      // Aplicar normalização de dados demo
      const normalizedData = normalizeDemoData(endpoint, data);

      return { data: normalizedData };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      return { error: errorMessage };
    }
  }

  // Métodos HTTP
  async get<T>(
    endpoint: string,
    params?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    const url = params
      ? `${endpoint}?${new URLSearchParams(params)}`
      : endpoint;
    return this.request<T>(url, { method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: ApiRequestData,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: ApiRequestData,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async patch<T>(
    endpoint: string,
    data?: ApiRequestData,
  ): Promise<ApiResponse<T>> {
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
  update: (id: string, data: ApiRequestData) =>
    apiClient.put(`/rachas/${id}`, data),
  delete: (id: string) => apiClient.delete(`/rachas/${id}`),
};

export const jogadoresApi = {
  getAll: (rachaId: string) =>
    apiClient.get(`/admin/jogadores?rachaId=${rachaId}`),
  getById: (id: string) => apiClient.get(`/admin/jogadores/${id}`),
  create: (data: ApiRequestData) => apiClient.post("/admin/jogadores", data),
  update: (id: string, data: ApiRequestData) =>
    apiClient.put(`/admin/jogadores/${id}`, data),
  delete: (id: string) => apiClient.delete(`/admin/jogadores/${id}`),
};

export const partidasApi = {
  getAll: (rachaId: string) => apiClient.get(`/partidas?rachaId=${rachaId}`),
  getById: (id: string) => apiClient.get(`/partidas/${id}`),
  create: (data: ApiRequestData) => apiClient.post("/admin/partidas", data),
  update: (id: string, data: ApiRequestData) =>
    apiClient.put(`/admin/partidas/${id}`, data),
  delete: (id: string) => apiClient.delete(`/admin/partidas/${id}`),
};

export const financeiroApi = {
  getAll: (rachaId: string) =>
    apiClient.get(`/admin/financeiro?rachaId=${rachaId}`),
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
  updateTema: (theme: string) =>
    apiClient.put("/configuracoes/racha/tema", { theme }),
  updateCores: (cores: {
    primary?: string;
    secondary?: string;
    accent?: string;
  }) => apiClient.put("/configuracoes/racha/cores", cores),
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
  refresh: (refreshToken: string) =>
    apiClient.post("/auth/refresh", { refreshToken }),
  logout: () => apiClient.post("/auth/logout"),
  me: () => apiClient.get("/auth/me"),
};

// API de Usuários
export const usersApi = {
  getAll: () => apiClient.get("/users"),
  getById: (id: string) => apiClient.get(`/users/${id}`),
  create: (data: ApiRequestData) => apiClient.post("/users", data),
  update: (id: string, data: ApiRequestData) =>
    apiClient.put(`/users/${id}`, data),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
  updateProfile: (data: ApiRequestData) =>
    apiClient.put("/users/profile", data),
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

// API de Rankings
export const rankingsApi = {
  getRankingGeral: () => apiClient.get("/rankings/geral"),
  getRankingArtilheiros: () => apiClient.get("/rankings/artilheiros"),
  getRankingAssistencias: () => apiClient.get("/rankings/assistencias"),
  getRankingTimes: () => apiClient.get("/rankings/times"),
};

// API de Campeões
export const campeoesApi = {
  getAll: () => apiClient.get("/campeoes"),
  getById: (id: string) => apiClient.get(`/campeoes/${id}`),
  create: (data: ApiRequestData) => apiClient.post("/campeoes", data),
  update: (id: string, data: ApiRequestData) =>
    apiClient.put(`/campeoes/${id}`, data),
  delete: (id: string) => apiClient.delete(`/campeoes/${id}`),
};

// API de Times
export const timesApi = {
  getAll: () => apiClient.get("/times"),
  getById: (id: string) => apiClient.get(`/times/${id}`),
  create: (data: ApiRequestData) => apiClient.post("/times", data),
  update: (id: string, data: ApiRequestData) =>
    apiClient.put(`/times/${id}`, data),
  delete: (id: string) => apiClient.delete(`/times/${id}`),
  getRanking: () => apiClient.get("/times/ranking"),
};

// API de Presenças
export const presencasApi = {
  getAll: (partidaId?: string) =>
    apiClient.get(`/presencas${partidaId ? `?partidaId=${partidaId}` : ""}`),
  getById: (id: string) => apiClient.get(`/presencas/${id}`),
  create: (data: ApiRequestData) => apiClient.post("/presencas", data),
  update: (id: string, data: ApiRequestData) =>
    apiClient.put(`/presencas/${id}`, data),
  delete: (id: string) => apiClient.delete(`/presencas/${id}`),
  confirmarPresenca: (id: string) =>
    apiClient.put(`/presencas/${id}/confirmar`),
  cancelarPresenca: (id: string) => apiClient.put(`/presencas/${id}/cancelar`),
};

// API de Influencers
export const influencersApi = {
  getAll: () => apiClient.get("/influencers"),
  getById: (id: string) => apiClient.get(`/influencers/${id}`),
  create: (data: ApiRequestData) => apiClient.post("/influencers", data),
  update: (id: string, data: ApiRequestData) =>
    apiClient.put(`/influencers/${id}`, data),
  delete: (id: string) => apiClient.delete(`/influencers/${id}`),
  getEstatisticas: () => apiClient.get("/influencers/estatisticas"),
  getPagamentos: (id: string) => apiClient.get(`/influencers/${id}/pagamentos`),
  createPagamento: (id: string, data: ApiRequestData) =>
    apiClient.post(`/influencers/${id}/pagamentos`, data),
};

// API de Logs
export const logsApi = {
  getAll: (filters?: {
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) => apiClient.get("/logs", filters),
  getById: (id: string) => apiClient.get(`/logs/${id}`),
  getEstatisticas: () => apiClient.get("/logs/estatisticas"),
};

// API de Health Check
export const healthApi = {
  check: () => apiClient.get("/health"),
  checkDatabase: () => apiClient.get("/health/database"),
  checkRedis: () => apiClient.get("/health/redis"),
};
