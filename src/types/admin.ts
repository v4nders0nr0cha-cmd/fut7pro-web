// src/types/admin.ts

/**
 * Administrador do racha (painel local)
 */
export interface Admin {
  id: string;
  usuarioId: string; // ID do usuário principal (obrigatório, padronizado)
  nome?: string; // Nome completo do admin
  email?: string; // E-mail do admin
  funcao?: string; // Cargo: Presidente, Vice, Diretor de Futebol, etc.
  avatar?: string; // URL do avatar/foto
  ativo?: boolean; // Se está ativo ou não
  criadoEm?: string; // ISO date de criação
  role?: string; // Role/RBAC vindo do backend (SUPERADMIN, ADMIN, etc.)
  status?: "ATIVO" | "INATIVO" | "SUSPENSO" | string;
  ultimoAcesso?: string | null;
}

/**
 * Log de ação administrativa (auditoria)
 */
export interface LogAdmin {
  id: string;
  adminId: string; // ID do admin responsável pela ação
  usuarioId: string; // usuarioId do admin (padronizado)
  acao: string; // Ex: "Removeu partida", "Transferiu propriedade"
  data: string; // ISO date da ação (compatibilidade legada)
  criadoEm?: string; // ISO date real do backend
  detalhes?: string; // Ex: detalhes sobre a ação (ID removido, e-mail, etc)
  ip?: string; // IP da ação (opcional, para auditoria)
  recurso?: string; // recurso afetado (opcional)
  adminNome?: string;
  adminEmail?: string;
}

/**
 * Cargos disponíveis (para facilitar enum ou select)
 */
export type CargoAdmin = "Presidente" | "Vice" | "Diretor de Futebol" | "Diretor Financeiro";

/**
 * Estrutura de permissão por cargo (para controle dinâmico de acesso)
 */
export interface PermissaoAdmin {
  funcao: CargoAdmin; // Cargo: Presidente, Vice, etc.
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
  prazoExclusaoDias: number | null; // null = sem limite, número = limite em dias para exclusão
}
