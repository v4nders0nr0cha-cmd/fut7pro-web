"use client";
import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import type { LancamentoFinanceiro } from "@/types/financeiro";

type Props = { lancamentos?: LancamentoFinanceiro[]; isLoading?: boolean; emptyMessage?: string };

export default function FinanceiroChart({ lancamentos, isLoading, emptyMessage }: Props) {
  const shouldFetch = !lancamentos;
  const { lancamentos: fetched, isLoading: loadingFinanceiro } = useFinanceiro();
  const loading = isLoading || (shouldFetch && loadingFinanceiro);

  const data = useMemo(() => {
    const source = lancamentos ?? (shouldFetch ? fetched : []);
    const dataMap: { [key: string]: { entrada: number; saida: number } } = {};
    (source ?? []).forEach((l) => {
      if (!l?.data) return;
      const mesAno = new Date(l.data).toLocaleString("pt-BR", { month: "short", year: "2-digit" });
      if (!dataMap[mesAno]) dataMap[mesAno] = { entrada: 0, saida: 0 };
      if ((l.valor ?? 0) >= 0) dataMap[mesAno].entrada += l.valor ?? 0;
      else dataMap[mesAno].saida += Math.abs(l.valor ?? 0);
    });
    return Object.entries(dataMap).map(([k, v]) => ({
      mes: k,
      Entrada: Number(v.entrada.toFixed(2)),
      Saida: Number(v.saida.toFixed(2)),
    }));
  }, [fetched, lancamentos, shouldFetch]);

  if (loading) {
    return (
      <div className="bg-[#191919] rounded-xl p-4 shadow w-full max-w-2xl mx-auto my-6 animate-pulse">
        <div className="h-5 w-40 bg-neutral-700 rounded mb-4" />
        <div className="h-44 bg-neutral-800 rounded" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="p-4 text-center text-gray-400 bg-[#191919] rounded-xl">
        {emptyMessage || "Nenhum dado financeiro para grafico."}
      </div>
    );
  }

  return (
    <div className="bg-[#191919] rounded-xl p-4 shadow w-full max-w-2xl mx-auto my-6">
      <h3 className="font-bold text-yellow-400 text-center mb-2">Resumo Mensal</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Entrada" fill="#22c55e" />
          <Bar dataKey="Saida" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
