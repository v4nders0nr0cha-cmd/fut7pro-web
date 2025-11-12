export interface Racha {
  id: string;
  nome: string;
  status: string;
  plano?: string | null;
  ownerId?: string | null;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface Metricas {
  totalRachas: number;
  ativos: number;
  pendentes: number;
  faturamentoMensal?: number;
  totalUsuarios?: number;
  [key: string]: number | undefined;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: string;
  status?: string;
  criadoEm?: string;
  ultimoAcesso?: string | null;
}
