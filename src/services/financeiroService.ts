import prisma from "../prisma/client";

// Listar rachas e seus lançamentos financeiros
export const listarRachasFinanceiro = async () => {
  return prisma.racha.findMany({
    include: { financeiros: true, plano: true },
    orderBy: { nome: "asc" },
  });
};

// Detalhe de um racha e seus lançamentos financeiros
export const detalheRachaFinanceiro = async (rachaId: string) => {
  return prisma.racha.findUnique({
    where: { id: rachaId },
    include: { financeiros: true, plano: true },
  });
};

// Métricas gerais
export const listarMetricsFinanceiro = async () => {
  const receitaTotal = await prisma.financeiro.aggregate({ _sum: { valor: true } });
  const ativos = await prisma.racha.count({ where: { status: { not: "INADIMPLENTE" } } });
  const inadimplentes = await prisma.racha.count({ where: { status: "INADIMPLENTE" } });
  // Implemente MRR, ARR, churn conforme sua lógica de negócio
  return {
    receitaTotal: receitaTotal._sum.valor ?? 0,
    ativos,
    inadimplentes,
    mrr: 0,
    arr: 0,
    churn: 0,
  };
};

interface FinanceiroData {
  adminId: string;
  tipo: string;
  categoria: string;
  valor: number;
  descricao?: string;
  data: string;
}

// Novo lançamento financeiro (entrada/saída)
export const novoFinanceiro = async (rachaId: string, data: FinanceiroData) => {
  return prisma.financeiro.create({
    data: {
      rachaId,
      adminId: data.adminId, // Passe o ID real do admin
      tipo: data.tipo,
      categoria: data.categoria,
      valor: Number(data.valor),
      descricao: data.descricao ?? "",
      data: new Date(data.data),
    },
  });
};

// Atualizar status de inadimplência do racha
export const atualizarStatusRacha = async (rachaId: string, inadimplente: boolean) => {
  return prisma.racha.update({
    where: { id: rachaId },
    data: { status: inadimplente ? "INADIMPLENTE" : "ATIVO" },
  });
};

interface FiltrosFinanceiro {
  rachaId?: string;
  tipo?: string;
  categoria?: string;
  dataInicio?: string;
  dataFim?: string;
}

// Exportação mock (implemente de acordo com sua necessidade)
export const exportarFinanceiro = async (_formato: string, _filtros: FiltrosFinanceiro) => {
  return [];
};
