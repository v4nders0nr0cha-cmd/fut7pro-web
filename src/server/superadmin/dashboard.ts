import { prisma } from "@/server/prisma";
import type { SuperadminMetrics, SuperadminMetricsRacha } from "@/types/superadmin";

function safeNumber(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function mapRacha(item: {
  id: string;
  nome: string;
  slug: string;
  criadoEm: Date;
  owner?: { nome: string | null } | null;
}): SuperadminMetricsRacha {
  return {
    id: item.id,
    nome: item.nome,
    slug: item.slug,
    presidente: item.owner?.nome ?? "Presidente desconhecido",
    criadoEm: item.criadoEm.toISOString(),
  };
}

export async function loadSuperadminMetrics(): Promise<SuperadminMetrics> {
  const [totalRachas, totalUsuarios, totalPartidas, entradas, saidas, ultimos] = await Promise.all([
    prisma.racha.count(),
    prisma.usuario.count({ where: { status: "ativo" } }),
    prisma.partida.count(),
    prisma.financeiro.aggregate({ _sum: { valor: true }, where: { tipo: "entrada" } }),
    prisma.financeiro.aggregate({ _sum: { valor: true }, where: { tipo: "saida" } }),
    prisma.racha.findMany({
      select: {
        id: true,
        nome: true,
        slug: true,
        criadoEm: true,
        owner: { select: { nome: true } },
      },
      orderBy: { criadoEm: "desc" },
      take: 6,
    }),
  ]);

  const receitaTotal = safeNumber(entradas._sum.valor) - safeNumber(saidas._sum.valor);

  return {
    totalRachas,
    totalUsuarios,
    totalPartidas,
    receitaTotal,
    ultimosRachas: ultimos.map(mapRacha),
    manualLiberado: totalRachas > 0,
  };
}
