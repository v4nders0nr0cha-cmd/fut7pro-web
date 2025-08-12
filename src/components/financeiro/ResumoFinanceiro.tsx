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
    <div className="mb-6 flex flex-col gap-4 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
        <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-3 flex flex-col items-center">
          <span className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400">
            SALDO ATUAL
          </span>
          <span
            className={`text-lg sm:text-2xl font-bold ${resumo.saldoAtual >= 0 ? "text-green-500" : "text-red-400"}`}
          >
            R$ {resumo.saldoAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-3 flex flex-col items-center">
          <span className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400">
            RECEITAS NO MÊS
          </span>
          <span className="text-lg sm:text-2xl font-bold text-yellow-400">
            R$ {resumo.totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-3 flex flex-col items-center">
          <span className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400">
            DESPESAS NO MÊS
          </span>
          <span className="text-lg sm:text-2xl font-bold text-blue-400">
            R${" "}
            {Math.abs(resumo.totalDespesas).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
      <div className="w-full h-52 bg-neutral-900 border border-neutral-700 rounded-xl p-2">
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
