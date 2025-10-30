import { getApiBase } from "@/lib/get-api-base";

// Configuracao centralizada de endpoints da API
// Facilita a mudanca de ambiente e manutencao

const API_BASE_URL = getApiBase();

// Endpoints publicos
export const PUBLIC_ENDPOINTS = {
  // Estatisticas
  ARTILHEIROS: `${API_BASE_URL}/api/estatisticas/artilheiros`,
  ASSISTENCIAS: `${API_BASE_URL}/api/estatisticas/assistencias`,
  RANKING_GERAL: `${API_BASE_URL}/api/estatisticas/ranking-geral`,
  TIMES_CLASSIFICACAO: `${API_BASE_URL}/api/estatisticas/times-classificacao`,

  // Atletas
  ATLETAS: `${API_BASE_URL}/api/atletas`,
  ATLETA_DETALHES: (slug: string) => `${API_BASE_URL}/api/atletas/${slug}`,
  ATLETA_HISTORICO: (slug: string) => `${API_BASE_URL}/api/atletas/${slug}/historico`,

  // Partidas
  PARTIDAS: `${API_BASE_URL}/api/partidas`,
  PARTIDA_DETALHES: (id: string) => `${API_BASE_URL}/api/partidas/${id}`,
  PARTIDAS_HISTORICO: `${API_BASE_URL}/api/partidas/historico`,

  // Comunicacao
  COMUNICADOS: `${API_BASE_URL}/api/comunicados`,
  NOTIFICACOES: `${API_BASE_URL}/api/notificacoes`,
  SUGESTOES: `${API_BASE_URL}/api/sugestoes`,
} as const;

// Endpoints do painel admin
export const ADMIN_ENDPOINTS = {
  // Gestao de Jogadores
  JOGADORES: `${API_BASE_URL}/api/admin/jogadores`,
  JOGADOR_DETALHES: (id: string) => `${API_BASE_URL}/api/admin/jogadores/${id}`,

  // Gestao de Partidas
  PARTIDAS: `${API_BASE_URL}/api/admin/partidas`,
  PARTIDA_DETALHES: (id: string) => `${API_BASE_URL}/api/admin/partidas/${id}`,

  // Financeiro
  FINANCEIRO: `${API_BASE_URL}/api/admin/financeiro`,
  FINANCEIRO_RELATORIOS: `${API_BASE_URL}/api/admin/financeiro/relatorios`,
  FINANCEIRO_PATROCINADORES: `${API_BASE_URL}/api/admin/financeiro/patrocinadores`,

  // Comunicacao
  NOTIFICACOES: `${API_BASE_URL}/api/admin/notificacoes`,
  NOTIFICACAO_DETALHES: (id: string) => `${API_BASE_URL}/api/admin/notificacoes/${id}`,
  ENQUETES: `${API_BASE_URL}/api/admin/enquetes`,
  ENQUETE_DETALHES: (id: string) => `${API_BASE_URL}/api/admin/enquetes/${id}`,
} as const;

// Endpoints do painel superadmin
export const SUPERADMIN_ENDPOINTS = {
  // Gestao de Rachas
  RACHAS: `${API_BASE_URL}/api/superadmin/rachas`,
  RACHA_DETALHES: (id: string) => `${API_BASE_URL}/api/superadmin/rachas/${id}`,

  // Metricas SaaS
  METRICAS: `${API_BASE_URL}/api/superadmin/metrics`,
  FINANCEIRO: `${API_BASE_URL}/api/superadmin/financeiro`,
  USUARIOS: `${API_BASE_URL}/api/superadmin/usuarios`,

  // Suporte
  SUPORTE: `${API_BASE_URL}/api/superadmin/suporte`,
} as const;

// Endpoints de autenticacao
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  REFRESH: `${API_BASE_URL}/api/auth/refresh`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  PROFILE: `${API_BASE_URL}/api/auth/profile`,
} as const;

export const isDevelopment = () => process.env.NODE_ENV === "development";

export const getApiBaseUrl = () => API_BASE_URL;

export const buildApiUrl = (endpoint: string, params?: Record<string, string>) => {
  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  return url;
};
