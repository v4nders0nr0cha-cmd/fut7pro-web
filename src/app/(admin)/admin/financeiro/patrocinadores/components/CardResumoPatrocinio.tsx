"use client";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { Patrocinador } from "@/types/financeiro";

interface Props {
  patrocinadores: Patrocinador[];
  periodo: { inicio: string; fim: string };
}

export default function CardResumoPatrocinio({
  patrocinadores,
  periodo,
}: Props) {
  const ativos = patrocinadores.filter(
    (p) =>
      (p.status === "ativo" || p.status === "encerrado") &&
      p.periodoInicio <= periodo.fim &&
      p.periodoFim >= periodo.inicio,
  );
  const total = ativos.reduce((acc, p) => acc + p.valor, 0);

  const meses: Record<string, number> = {};
  ativos.forEach((p) => {
    const mes = p.periodoInicio.slice(0, 7); // ex: "2025-06"
    meses[mes] = (meses[mes] || 0) + p.valor;
  });
  const dadosGrafico = Object.keys(meses)
    .sort()
    .map((m) => ({
      mes: m,
      valor: meses[m],
    }));

  return (
    <div className="mb-6 flex w-full max-w-full flex-col items-start rounded-2xl bg-[#191919] p-4 shadow">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg font-bold text-yellow-400">
          Total de Patrocínio
        </span>
        <span className="text-2xl font-extrabold text-green-400">
          R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      </div>
      <span className="mb-4 text-xs text-gray-400">
        Recebido entre {new Date(periodo.inicio).toLocaleDateString()} e{" "}
        {new Date(periodo.fim).toLocaleDateString()}
      </span>
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dadosGrafico}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="mes" tick={{ fill: "#999", fontSize: 12 }} />
            <YAxis tick={{ fill: "#999", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "#222",
                borderRadius: 8,
                border: "none",
              }}
              formatter={(value) => `R$ ${value}`}
            />
            <Line
              type="monotone"
              dataKey="valor"
              stroke="#FBBF24"
              strokeWidth={2}
              dot
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
