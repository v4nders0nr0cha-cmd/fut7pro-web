export interface SuperadminMetrics {
  totalRachas: number;
  totalUsuarios: number;
  totalPartidas: number;
  receitaTotal: number;
  ultimosRachas: SuperadminMetricsRacha[];
  manualLiberado: boolean;
}

export interface SuperadminMetricsRacha {
  id: string;
  nome: string;
  slug: string;
  presidente: string;
  criadoEm: string;
}

export interface SuperadminRachaHistorico {
  id: string;
  acao: string;
  detalhes: string | null;
  data: string;
}

export interface SuperadminRachaResumo {
  id: string;
  nome: string;
  slug: string;
  status: string;
  plano: string | null;
  presidente: string;
  emailPresidente: string | null;
  atletas: number;
  criadoEm: string;
  ultimoAcesso: string | null;
  bloqueado: boolean;
  admins: SuperadminUsuarioResumo[];
  historico: SuperadminRachaHistorico[];
  financeiro: SuperadminFinanceValores;
}

export interface SuperadminUsuarioResumo {
  id: string;
  nome: string;
  email: string | null;
  role: string;
  ativo: boolean;
  criadoEm: string;
}

export interface SuperadminFinanceValores {
  entradas: number;
  saidas: number;
  saldo: number;
}

export interface SuperadminFinancePlanoResumo {
  chave: string;
  nome: string;
  receita: number;
  ativos: number;
  inadimplentes: number;
}

export interface SuperadminFinanceiro {
  valores: SuperadminFinanceValores;
  planos: SuperadminFinancePlanoResumo[];
  ultimoMeses: SuperadminFinanceSerie[];
  inadimplentes: SuperadminInadimplenteResumo[];
  cobrancas: SuperadminCobrancaResumo[];
}

export interface SuperadminFinanceSerie {
  mes: string;
  receita: number;
}

export interface SuperadminCobrancaResumo {
  id: string;
  racha: string;
  presidente: string;
  plano: string | null;
  status: string;
  valor: number;
  vencimento: string | null;
}

export interface SuperadminInadimplenteResumo {
  id: string;
  racha: string;
  presidente: string;
  plano: string | null;
  valor: number;
  diasAtraso: number;
}

export interface SuperadminNotification {
  id: string;
  titulo: string;
  mensagem: string;
  status: string;
  destino: string;
  tipo: string;
  enviadoPor: string;
  criadoEm: string;
}

export interface SuperadminTicketResumo {
  id: string;
  assunto: string;
  status: string;
  criadoEm: string;
  racha: string | null;
  responsavel: string | null;
}

export interface SuperadminTicketsSnapshot {
  total: number;
  abertos: number;
  emAndamento: number;
  resolvidos: number;
  itens: SuperadminTicketResumo[];
}

export interface SuperadminUsuariosSnapshot {
  total: number;
  ativos: number;
  porRole: Record<string, number>;
  itens: SuperadminUsuarioResumo[];
}
