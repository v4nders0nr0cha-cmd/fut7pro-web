// Configuração centralizada de endpoints da API
// Facilita a mudança de ambiente e manutenção

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Endpoints públicos
export const PUBLIC_ENDPOINTS = {
  // Estatísticas
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

  // Comunicação
  COMUNICADOS: `${API_BASE_URL}/api/comunicados`,
  NOTIFICACOES: `${API_BASE_URL}/api/notificacoes`,
  SUGESTOES: `${API_BASE_URL}/api/sugestoes`,
} as const;

// Endpoints multi-tenant (protegidos por tenant)
export const TENANT_ENDPOINTS = {
  // Partidas
  PARTIDAS: (tenantSlug: string) => `${API_BASE_URL}/api/rachas/${tenantSlug}/partidas`,
  PARTIDA_DETALHES: (tenantSlug: string, id: string) =>
    `${API_BASE_URL}/api/rachas/${tenantSlug}/partidas/${id}`,

  // Times
  TIMES: (tenantSlug: string) => `${API_BASE_URL}/api/rachas/${tenantSlug}/times`,
  TIME_DETALHES: (tenantSlug: string, id: string) =>
    `${API_BASE_URL}/api/rachas/${tenantSlug}/times/${id}`,

  // Jogadores
  JOGADORES: (tenantSlug: string) => `${API_BASE_URL}/api/rachas/${tenantSlug}/jogadores`,
  JOGADOR_DETALHES: (tenantSlug: string, id: string) =>
    `${API_BASE_URL}/api/rachas/${tenantSlug}/jogadores/${id}`,

  // Estatísticas do tenant
  ESTATISTICAS: (tenantSlug: string) => `${API_BASE_URL}/api/rachas/${tenantSlug}/estatisticas`,
} as const;

// Endpoints do painel admin
export const ADMIN_ENDPOINTS = {
  // Gestão de Jogadores
  JOGADORES: `${API_BASE_URL}/api/admin/jogadores`,
  JOGADOR_DETALHES: (id: string) => `${API_BASE_URL}/api/admin/jogadores/${id}`,

  // Gestão de Partidas
  PARTIDAS: `${API_BASE_URL}/api/admin/partidas`,
  PARTIDA_DETALHES: (id: string) => `${API_BASE_URL}/api/admin/partidas/${id}`,

  // Financeiro
  FINANCEIRO: `${API_BASE_URL}/api/admin/financeiro`,
  FINANCEIRO_RELATORIOS: `${API_BASE_URL}/api/admin/financeiro/relatorios`,
  FINANCEIRO_PATROCINADORES: `${API_BASE_URL}/api/admin/financeiro/patrocinadores`,

  // Comunicação
  NOTIFICACOES: `${API_BASE_URL}/api/admin/notificacoes`,
  NOTIFICACAO_DETALHES: (id: string) => `${API_BASE_URL}/api/admin/notificacoes/${id}`,
  ENQUETES: `${API_BASE_URL}/api/admin/enquetes`,
  ENQUETE_DETALHES: (id: string) => `${API_BASE_URL}/api/admin/enquetes/${id}`,
} as const;

// Endpoints do painel superadmin
export const SUPERADMIN_ENDPOINTS = {
  // Gestão de Rachas
  RACHAS: `${API_BASE_URL}/api/superadmin/rachas`,
  RACHA_DETALHES: (id: string) => `${API_BASE_URL}/api/superadmin/rachas/${id}`,

  // Métricas SaaS
  METRICAS: `${API_BASE_URL}/api/superadmin/metrics`,
  FINANCEIRO: `${API_BASE_URL}/api/superadmin/financeiro`,
  USUARIOS: `${API_BASE_URL}/api/superadmin/usuarios`,

  // Suporte
  SUPORTE: `${API_BASE_URL}/api/superadmin/suporte`,
} as const;

// Endpoints de autenticação
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  REFRESH: `${API_BASE_URL}/api/auth/refresh`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  REGISTER_ADMIN: `${API_BASE_URL}/api/auth/register-admin`,
  PROFILE: `${API_BASE_URL}/api/auth/me`,
} as const;

// Endpoints de tenants (rachas)
export const TENANT_AUTH_ENDPOINTS = {
  RACHAS: `${API_BASE_URL}/api/rachas`,
  RACHA_DETALHES: (id: string) => `${API_BASE_URL}/api/rachas/${id}`,
  RACHA_BY_SLUG: (slug: string) => `${API_BASE_URL}/api/rachas/slug/${slug}`,
} as const;

// Endpoints de membership
export const MEMBERSHIP_ENDPOINTS = {
  MEMBERSHIPS: (tenantSlug: string) => `${API_BASE_URL}/api/rachas/${tenantSlug}/memberships`,
  MEMBERSHIP_DETALHES: (tenantSlug: string, id: string) =>
    `${API_BASE_URL}/api/rachas/${tenantSlug}/memberships/${id}`,
  MEMBERSHIPS_PENDING: (tenantSlug: string) =>
    `${API_BASE_URL}/api/rachas/${tenantSlug}/memberships/pending`,
  APPROVE_MEMBERSHIP: (tenantSlug: string, id: string) =>
    `${API_BASE_URL}/api/rachas/${tenantSlug}/memberships/${id}/approve`,
  SUSPEND_MEMBERSHIP: (tenantSlug: string, id: string) =>
    `${API_BASE_URL}/api/rachas/${tenantSlug}/memberships/${id}/suspend`,
  INVITE_USER: (tenantSlug: string) =>
    `${API_BASE_URL}/api/rachas/${tenantSlug}/memberships/invite`,
} as const;

// Função helper para verificar se estamos em desenvolvimento
export const isDevelopment = () => {
  return process.env.NODE_ENV === "development";
};

// Função helper para obter a URL base da API
export const getApiBaseUrl = () => {
  return API_BASE_URL;
};

// Função helper para construir URLs completas
export const buildApiUrl = (endpoint: string, params?: Record<string, string>) => {
  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  return url;
};
