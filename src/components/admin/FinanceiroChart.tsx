"use client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import type { Financeiro } from "@/hooks/useFinanceiro";

type Props = { lancamentos: Financeiro[] };

export default function FinanceiroChart({ lancamentos }: Props) {
  // Agrupa lançamentos por mês/ano
  const dataMap: { [key: string]: { entrada: number; saida: number } } = {};
  lancamentos.forEach((l) => {
    const mesAno = new Date(l.data).toLocaleString("pt-BR", { month: "short", year: "2-digit" });
    if (!dataMap[mesAno]) dataMap[mesAno] = { entrada: 0, saida: 0 };
    if (l.tipo === "entrada") dataMap[mesAno].entrada += l.valor;
    else dataMap[mesAno].saida += l.valor;
  });
  const data = Object.entries(dataMap).map(([k, v]) => ({
    mes: k,
    Entrada: v.entrada,
    Saída: v.saida,
  }));

  if (!data.length)
    return (
      <div className="p-4 text-center text-gray-400">Nenhum dado financeiro para gráfico.</div>
    );
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
          <Bar dataKey="Saída" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
