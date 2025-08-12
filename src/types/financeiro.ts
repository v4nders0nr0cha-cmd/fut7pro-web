// src/types/financeiro.ts

// Tipos de lançamento financeiro
export type TipoLancamento =
  | "diaria"
  | "mensalidade"
  | "patrocinio"
  | "evento"
  | "outros"
  | "despesa"
  | "despesa_adm"
  | "sistema"
  | "multa"; // Incluindo 'multa' conforme padrão do sistema

// Lançamento financeiro padrão
export interface LancamentoFinanceiro {
  id: string;
  data: string; // ISO date (ex: 2025-06-11)
  tipo: TipoLancamento;
  descricao: string;
  valor: number; // positivo = receita, negativo = despesa
  responsavel: string; // nome/apelido admin
  comprovanteUrl?: string; // opcional (anexos/imagem local ou base64)
}

// Resumo financeiro consolidado
export interface ResumoFinanceiro {
  saldoAtual: number;
  totalReceitas: number;
  totalDespesas: number;
  receitasPorMes: Record<string, number>; // ex: {"2025-06": 1500}
  despesasPorMes: Record<string, number>; // ex: {"2025-06": 800}
}

// Status dos patrocinadores
export type StatusPatrocinador = "ativo" | "inativo" | "encerrado";

// Patrocinador completo para o módulo financeiro
export interface Patrocinador {
  id: string;
  nome: string;
  valor: number;
  periodoInicio: string; // ISO date ex: "2025-06-01"
  periodoFim: string; // ISO date ex: "2025-09-30"
  descricao?: string;
  logo: string; // caminho local/base64
  status: StatusPatrocinador;
  comprovantes: string[]; // anexos de recebimento (imagens local/base64)
  observacoes?: string;
  link?: string; // perfil ou site do patrocinador
  visivel: boolean; // visível no site público?
}
