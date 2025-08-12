// src/types/interfaces.ts
export interface User {
  id: string;
  name: string;
}

// Interfaces específicas para substituir 'any' em todo o projeto

// Interfaces para Confrontos/Partidas
export interface Confronto {
  id: string;
  timeA: string;
  timeB: string;
  golsTimeA: number;
  golsTimeB: number;
  finalizada: boolean;
  data?: string;
  local?: string;
  gols?: Gol[];
  assistencias?: Assistencia[];
}

export interface Gol {
  id: string;
  jogador: string;
  time: string;
  minuto: number;
  tipo?: "normal" | "penalti" | "falta";
}

export interface Assistencia {
  id: string;
  jogador: string;
  time: string;
  minuto: number;
}

// Interfaces para Times
export interface Time {
  id: string;
  nome: string;
  jogadores: Jogador[];
  logo?: string;
  cor?: string;
}

export interface Jogador {
  id: string;
  nome: string;
  posicao?: string;
  numero?: number;
  foto?: string;
}

// Interfaces para Eventos de Partida
export interface EventoGol {
  jogador: string;
  time: string;
  minuto: number;
  assistencia: string | "faltou";
  tipo?: "normal" | "penalti" | "falta";
}

// Interfaces para Administradores
export interface Admin {
  id: string;
  nome: string;
  email: string;
  rachaId: string;
  permissoes: string[];
  ativo: boolean;
}

// Interfaces para Logs
export interface LogAdmin {
  id: string;
  acao: string;
  detalhes: string;
  data: string;
  adminId: string;
  adminNome: string;
}

// Interfaces para Influencers
export interface Influencer {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  plataforma: string;
  seguidores: number;
  taxaComissao: number;
  ativo: boolean;
  pagamentosRecebidos: PagamentoInfluencer[];
  presidentesAtivos: PresidenteInfluencer[];
}

export interface PagamentoInfluencer {
  id: string;
  valor: number;
  data: string;
  status: "pendente" | "pago" | "cancelado";
  comprovante?: string;
}

export interface PresidenteInfluencer {
  id: string;
  nome: string;
  rachaId: string;
  rachaNome: string;
  valorMensal: number;
}

// Interfaces para Configurações
export interface ThemeConfig {
  key: string;
  config: Record<string, string>;
}

// Interfaces para Dados de Marketing
export interface DadosMarketing {
  id: string;
  nome: string;
  vendas: number;
  valorTotal: number;
  comissoes: number;
  status: string;
}

// Interfaces para Dados de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  details?: Record<string, unknown>;
}

// Interfaces para Dados de Formulário
export interface FormData {
  [key: string]: string | number | boolean | File | undefined;
}

// Interfaces para Callbacks
export interface CallbackFunction<T = unknown> {
  (data: T): void;
}

// Interfaces para Props de Componentes
export interface ComponentProps {
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

// Interfaces para Dados de Contexto
export interface ContextData {
  [key: string]: unknown;
}

// Interfaces para Dados de Estado
export interface StateData {
  [key: string]: unknown;
}

// Interfaces para Dados de Configuração
export interface ConfigData {
  [key: string]: unknown;
}
