export interface Racha {
  id: string;
  nome: string;
  slug: string;
  subdominio: string;
  criadoEm?: string;
  usuarios: number;
  partidas: number;
  status?: string;
  plano?: string | null;
  ownerId?: string | null;
  atualizadoEm?: string;
}

export interface Metricas {
  tenantCount: number;
  userCount: number;
  matchCount: number;
  lastUpdated?: string | null;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: string;
  criadoEm?: string;
  tenant?: {
    id: string;
    nome: string;
  } | null;
}

export interface SystemStats {
  apiVersion: string;
  nodeVersion: string;
  uptime: number;
  environment: string;
  memoryUsage?: Record<string, unknown>;
}
