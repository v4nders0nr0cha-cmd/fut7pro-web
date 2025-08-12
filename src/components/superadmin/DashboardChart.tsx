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

const data = [
  { month: "Fev", receita: 3200 },
  { month: "Mar", receita: 4100 },
  { month: "Abr", receita: 5300 },
  { month: "Mai", receita: 6300 },
  { month: "Jun", receita: 6900 },
  { month: "Jul", receita: 7430 },
];

export default function DashboardChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
        <XAxis dataKey="month" stroke="#fff" />
        <YAxis stroke="#fff" />
        <Tooltip contentStyle={{ background: "#18181B", borderRadius: 8, color: "#fff" }} />
        <Line type="monotone" dataKey="receita" stroke="#FFD700" strokeWidth={3} dot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
