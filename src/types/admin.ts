// src/types/admin.ts

export interface Admin {
  id: string;
  usuarioId: string;
  nome?: string;
  email?: string;
  role?: string;
  roles?: string[];
  tenantId?: string;
  tenantSlug?: string;
  slug?: string;
  telefone?: string;
  status?: "ATIVO" | "INATIVO" | "PENDENTE";
  funcao?: string;
  avatar?: string;
  ativo?: boolean;
  ultimoAcesso?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  deletadoEm?: string;
  permissoes?: string[];
  preferredLanguage?: string;
  plano?: string;
  planoStatus?: string;
  planoExpiraEm?: string;
  trialExpiraEm?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LogAdmin {
  id: string;
  adminId: string;
  usuarioId: string;
  acao: string;
  data: string;
  detalhes?: string;
  ip?: string;
  recurso?: string;
  criadoEm?: string;
  adminNome?: string;
  adminEmail?: string;
  action?: string;
  details?: string;
  adminName?: string;
  timestamp?: string;
  resource?: string;
}

export type AdminLog = LogAdmin;

export type CargoAdmin = "Presidente" | "Vice" | "Diretor de Futebol" | "Diretor Financeiro";

export interface PermissaoAdmin {
  funcao: CargoAdmin;
  podeAcessar: {
    administradores: boolean;
    permissoes: boolean;
    logs: boolean;
    transferirPropriedade: boolean;
    partidas: boolean;
    jogadores: boolean;
    financeiro: boolean;
  };
  podeExcluir: {
    partidas: boolean;
    rankings: boolean;
    campeoes: boolean;
    atletas: boolean;
  };
  prazoExclusaoDias: number | null;
}
