// src/types/marketing.ts
export type InfluencerResumo = {
  id: string;
  nome: string;
  cpf: string;
  instagram?: string;
  vendasPendentes: number;
  vendasPagas: number;
  valorPendente: number;
  valorPago: number;
  vendas?: InfluencerVendaResumo[];
};

export type InfluencerVendaResumo = {
  racha: string;
  presidente: string;
  data: string; // ISO
  status: "Paga" | "Pendente" | "Cancelada";
};
