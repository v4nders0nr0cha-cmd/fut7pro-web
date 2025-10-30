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
import type { Patrocinador } from "@/types/patrocinador";

interface Props {
  patrocinadores: Patrocinador[];
  periodo: { inicio: string; fim: string };
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function isWithinPeriod(sponsor: Patrocinador, periodo: { inicio: string; fim: string }): boolean {
  const sponsorStart = parseDate(sponsor.periodStart) ?? new Date("2000-01-01");
  const sponsorEnd = parseDate(sponsor.periodEnd) ?? new Date("2100-12-31");
  const periodStart = parseDate(periodo.inicio) ?? new Date("2000-01-01");
  const periodEnd = parseDate(periodo.fim) ?? new Date("2100-12-31");

  return sponsorStart <= periodEnd && sponsorEnd >= periodStart;
}

export default function CardResumoPatrocinio({ patrocinadores, periodo }: Props) {
  const ativos = patrocinadores.filter((patro) => {
    if (typeof patro.value !== "number" || Number.isNaN(patro.value)) return false;
    return isWithinPeriod(patro, periodo);
  });

  const total = ativos.reduce((acc, item) => acc + (item.value ?? 0), 0);

  const agregadosPorMes: Record<string, number> = {};
  ativos.forEach((patro) => {
    const referencia = patro.periodStart ?? patro.updatedAt ?? patro.createdAt ?? periodo.inicio;
    const chave = referencia ? referencia.slice(0, 7) : "sem-periodo";
    agregadosPorMes[chave] = (agregadosPorMes[chave] || 0) + (patro.value ?? 0);
  });

  const dadosGrafico = Object.entries(agregadosPorMes)
    .map(([mes, valor]) => ({ mes, valor }))
    .sort((a, b) => (a.mes > b.mes ? 1 : -1));

  return (
    <div className="bg-[#191919] rounded-2xl shadow p-4 flex flex-col items-start w-full max-w-full mb-6">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-lg font-bold text-yellow-400">
          Receita comprometida com patrocinios
        </span>
        <span className="text-2xl font-extrabold text-green-400">
          {currencyFormatter.format(total)}
        </span>
      </div>
      <span className="text-xs text-gray-400 mb-4">
        Considerando acordos com valor registrado entre{" "}
        {new Date(periodo.inicio).toLocaleDateString("pt-BR")} e{" "}
        {new Date(periodo.fim).toLocaleDateString("pt-BR")}
      </span>
      <div className="w-full h-36">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dadosGrafico}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="mes" tick={{ fill: "#999", fontSize: 12 }} />
            <YAxis
              tickFormatter={(value) => currencyFormatter.format(Number(value))}
              tick={{ fill: "#999", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{ background: "#222", borderRadius: 8, border: "none" }}
              formatter={(valor: number) => currencyFormatter.format(valor)}
              labelFormatter={(label) => `Periodo: ${label}`}
            />
            <Line type="monotone" dataKey="valor" stroke="#FBBF24" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
