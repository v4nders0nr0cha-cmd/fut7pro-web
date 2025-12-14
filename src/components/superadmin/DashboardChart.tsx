// src/components/superadmin/DashboardChart.tsx

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

type ChartPoint = { month: string; receita: number };

const DEFAULT_DATA: ChartPoint[] = [
  { month: "Jan", receita: 0 },
  { month: "Fev", receita: 0 },
  { month: "Mar", receita: 0 },
  { month: "Abr", receita: 0 },
  { month: "Mai", receita: 0 },
  { month: "Jun", receita: 0 },
];

export default function DashboardChart({ data = DEFAULT_DATA }: { data?: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data?.length ? data : DEFAULT_DATA}>
        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
        <XAxis dataKey="month" stroke="#fff" />
        <YAxis stroke="#fff" />
        <Tooltip contentStyle={{ background: "#18181B", borderRadius: 8, color: "#fff" }} />
        <Line type="monotone" dataKey="receita" stroke="#FFD700" strokeWidth={3} dot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
