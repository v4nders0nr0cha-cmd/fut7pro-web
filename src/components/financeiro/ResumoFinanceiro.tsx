"use client";
import type { ResumoFinanceiro } from "@/components/financeiro/types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

interface Props {
  resumo: ResumoFinanceiro;
}

export default function ResumoFinanceiro({ resumo }: Props) {
  const meses = Object.keys(resumo.receitasPorMes).sort();
  const data = meses.map((mes) => ({
    mes,
    Receita: resumo.receitasPorMes[mes] || 0,
    Despesa: resumo.despesasPorMes[mes] || 0,
  }));

  return (
    <div className="mb-6 flex w-full flex-col gap-4">
      <div className="grid grid-cols-1 gap-2 text-center sm:grid-cols-3">
        <div className="flex flex-col items-center rounded-xl border border-neutral-700 bg-neutral-900 p-3">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 sm:text-xs">
            SALDO ATUAL
          </span>
          <span
            className={`text-lg font-bold sm:text-2xl ${resumo.saldoAtual >= 0 ? "text-green-500" : "text-red-400"}`}
          >
            R${" "}
            {resumo.saldoAtual.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-neutral-700 bg-neutral-900 p-3">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 sm:text-xs">
            RECEITAS NO MÊS
          </span>
          <span className="text-lg font-bold text-yellow-400 sm:text-2xl">
            R${" "}
            {resumo.totalReceitas.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-neutral-700 bg-neutral-900 p-3">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 sm:text-xs">
            DESPESAS NO MÊS
          </span>
          <span className="text-lg font-bold text-blue-400 sm:text-2xl">
            R${" "}
            {Math.abs(resumo.totalDespesas).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>
      <div className="h-52 w-full rounded-xl border border-neutral-700 bg-neutral-900 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="mes" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="Receita"
              stroke="#facc15"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Despesa"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
