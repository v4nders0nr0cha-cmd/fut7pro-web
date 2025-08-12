// src/components/marketing/InfluencerDashboardResumo.tsx

import { prisma } from "@/lib/prisma";

export default async function InfluencerDashboardResumo() {
  // KPI: Total de usos de cupons
  const totalUsos = await prisma.influencerCupomUso.count();
  // KPI: Total de vendas pagas
  const totalVendas = await prisma.influencerVenda.count({ where: { status: "pago" } });
  // KPI: Total a pagar
  const totalAPagar = totalVendas * 50;
  // KPI: Total já pago a influencers
  const totalJaPago = await prisma.influencerPagamento.aggregate({ _sum: { valor: true } });

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
      <div className="bg-zinc-900 rounded-xl p-4 flex flex-col items-center">
        <span className="text-lg font-bold text-yellow-400">{totalUsos}</span>
        <span className="text-xs text-zinc-400 mt-2">Trials/Usos de Cupom</span>
      </div>
      <div className="bg-zinc-900 rounded-xl p-4 flex flex-col items-center">
        <span className="text-lg font-bold text-green-400">{totalVendas}</span>
        <span className="text-xs text-zinc-400 mt-2">Vendas Pagas</span>
      </div>
      <div className="bg-zinc-900 rounded-xl p-4 flex flex-col items-center">
        <span className="text-lg font-bold text-blue-400">R$ {totalAPagar.toFixed(2)}</span>
        <span className="text-xs text-zinc-400 mt-2">Total a Pagar</span>
      </div>
      <div className="bg-zinc-900 rounded-xl p-4 flex flex-col items-center">
        <span className="text-lg font-bold text-green-300">
          R$ {(totalJaPago._sum.valor ?? 0).toFixed(2)}
        </span>
        <span className="text-xs text-zinc-400 mt-2">Total Já Pago</span>
      </div>
    </div>
  );
}
