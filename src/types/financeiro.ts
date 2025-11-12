// src/types/financeiro.ts

// Financial movement types (entry or exit)
export type MovimentoFinanceiro = "entrada" | "saida";

// Default categories used in Fut7Pro (allowing custom backend strings)
export type CategoriaFinanceiro =
  | "mensalidade"
  | "diaria"
  | "patrocinio"
  | "evento"
  | "campo"
  | "uniforme"
  | "arbitragem"
  | "outros"
  | "despesa"
  | "despesa_adm"
  | "sistema"
  | "multa";

// Shared financial entry type for admin and public flows
export interface LancamentoFinanceiro {
  id: string;
  rachaId?: string;
  adminId?: string;
  tipo: MovimentoFinanceiro;
  categoria: CategoriaFinanceiro | string;
  descricao?: string;
  valor: number; // always positive; direction determined by `tipo`
  data: string;
  responsavel?: string;
  adminNome?: string;
  adminEmail?: string;
  comprovanteUrl?: string | null;
  criadoEm?: string;
  atualizadoEm?: string;
}

// Consolidated resume for dashboards
export interface ResumoFinanceiro {
  saldoAtual: number;
  totalReceitas: number;
  totalDespesas: number;
  receitasPorMes: Record<string, number>;
  despesasPorMes: Record<string, number>;
}
