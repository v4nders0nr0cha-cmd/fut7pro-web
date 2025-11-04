import type { LancamentoFinanceiro as DomainLancamento, ResumoFinanceiro as DomainResumo } from "@/types/financeiro";

// Outstanding tenant record used by ModalInadimplentes
export interface Inadimplente {
  id: string;
  racha: string;
  presidente: string;
  plano: string;
  valor: number;
  vencimento: string;
  contato: string;
}

// Summary row for superadmin finance table
export interface RachaDetalheResumido {
  id: string;
  racha: string;
  presidente: string;
  plano: string;
  status: StatusPagamento;
  valor: number;
  vencimento: string;
}

export type StatusPagamento = "Pago" | "Em aberto" | "Trial" | "Cancelado";
export type MetodoPagamento = "pix" | "cartao" | "boleto" | "outro";

export interface PagamentoFinanceiro {
  data: string;
  valor: number;
  status: StatusPagamento;
  referencia: string;
  metodo: MetodoPagamento;
  descricao?: string;
}

export type ResumoFinanceiro = DomainResumo;

export type LancamentoFinanceiro = DomainLancamento;
