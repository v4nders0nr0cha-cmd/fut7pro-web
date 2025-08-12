// Inadimplente para ModalInadimplentes
export interface Inadimplente {
  id: string;
  racha: string;
  presidente: string;
  plano: string;
  valor: number;
  vencimento: string;
  contato: string; // WhatsApp ou email
}

// Tabela de rachas resumida
export interface RachaDetalheResumido {
  id: string;
  racha: string;
  presidente: string;
  plano: string;
  status: StatusPagamento;
  valor: number;
  vencimento: string;
}

// ENUMS centralizados para pagamentos
export type StatusPagamento = "Pago" | "Em aberto" | "Trial" | "Cancelado";
export type MetodoPagamento = "pix" | "cartao" | "boleto" | "outro";

// TIPO ÚNICO PARA PAGAMENTOS
export interface PagamentoFinanceiro {
  data: string;
  valor: number;
  status: StatusPagamento;
  referencia: string;
  metodo: MetodoPagamento;
  descricao?: string;
}

// Resumo financeiro geral (para ResumoFinanceiro)
export interface ResumoFinanceiro {
  saldoAtual: number;
  totalReceitas: number;
  totalDespesas: number;
  receitasPorMes: Record<string, number>;
  despesasPorMes: Record<string, number>;
}

// Lançamento financeiro individual (para TabelaLancamentos)
export interface LancamentoFinanceiro {
  id: string;
  data: string; // ISO string
  tipo: string; // "diaria" | "mensalidade" | "patrocinio" | "evento" | "outros" | "despesa" | "despesa_adm" | "sistema"
  descricao: string;
  valor: number;
  responsavel: string;
  comprovanteUrl?: string;
}
