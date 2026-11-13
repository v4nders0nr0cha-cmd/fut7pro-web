"use client";
import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import type { LancamentoFinanceiro } from "@/types/financeiro";

type Props = { lancamentos: LancamentoFinanceiro[]; isLoading?: boolean; emptyMessage?: string };

export default function FinanceiroChart({ lancamentos, isLoading, emptyMessage }: Props) {
  const loading = isLoading;

  const data = useMemo(() => {
    const source = lancamentos;
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
  }, [lancamentos]);

  if (loading) {
    return (
      <div
        className="bg-[#191919] rounded-xl p-4 shadow w-full max-w-2xl mx-auto my-6 min-h-[280px]"
        aria-busy="true"
      >
        <h3 className="font-bold text-yellow-400 text-center mb-2">Resumo Mensal</h3>
        <div className="h-[220px] flex items-end justify-around gap-3 px-4" aria-hidden="true">
          {[42, 68, 54, 82, 60, 74].map((height, index) => (
            <div
              key={index}
              className="w-8 rounded-t bg-neutral-700/60 motion-safe:animate-pulse"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <span className="sr-only">Carregando resumo mensal</span>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="p-4 text-center text-gray-400 bg-[#191919] rounded-xl min-h-[280px] flex items-center justify-center">
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
