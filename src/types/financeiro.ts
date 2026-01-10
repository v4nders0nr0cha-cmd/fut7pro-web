// src/types/financeiro.ts

export type TipoLancamento =
  | "diaria"
  | "mensalidade"
  | "patrocinio"
  | "evento"
  | "outros"
  | "despesa"
  | "despesa_adm"
  | "sistema"
  | "entrada"
  | "saida"
  | "multa";

export interface LancamentoFinanceiro {
  id: string;
  data: string;
  tipo: TipoLancamento;
  descricao: string;
  valor: number;
  responsavel: string;
  adminId?: string;
  rachaId?: string;
  tenantId?: string;
  tenantSlug?: string;
  comprovanteUrl?: string;
  categoria?: string;
  adminNome?: string;
  adminEmail?: string;
  metodoPagamento?: string;
  competencia?: string;
  observacoes?: string;
  recorrente?: boolean;
  anexos?: string[];
  visivel?: boolean;
  publico?: boolean;
  status?: string;
  referenciaSlug?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResumoFinanceiro {
  saldoAtual: number;
  totalReceitas: number;
  totalDespesas: number;
  receitasPorMes: Record<string, number>;
  despesasPorMes: Record<string, number>;
  saldoAnterior?: number;
  periodoInicio?: string;
  periodoFim?: string;
}

export type StatusPatrocinador = "ativo" | "inativo" | "encerrado";

export interface Patrocinador {
  id: string;
  nome: string;
  valor: number;
  periodoInicio: string;
  periodoFim: string;
  descricao?: string;
  ramo?: string;
  logo: string;
  status: StatusPatrocinador;
  comprovantes: string[];
  observacoes?: string;
  link?: string;
  visivel: boolean;
  displayOrder?: number;
}
