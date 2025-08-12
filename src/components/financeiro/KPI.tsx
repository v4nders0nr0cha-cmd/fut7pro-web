// src/components/financeiro/KPI.tsx
"use client";
import React from "react";
import { FaInfoCircle } from "react-icons/fa";

interface KPIProps {
  title: string;
  value: React.ReactNode; // <-- Corrigido aqui!
  color: "green" | "yellow" | "red" | "blue";
  tooltip?: string;
}

const colorMap = {
  green: "text-green-400",
  yellow: "text-yellow-400",
  red: "text-red-400",
  blue: "text-blue-400",
};

export default function KPI({ title, value, color, tooltip }: KPIProps) {
  return (
    <div className="bg-zinc-800 rounded-2xl shadow p-4 flex flex-col items-start justify-center relative group">
      <span className="text-zinc-400 text-xs font-semibold mb-2 flex items-center gap-1">
        {title}
        {tooltip && (
          <span className="relative">
            <FaInfoCircle className="ml-1 cursor-pointer text-blue-400" />
            <span className="hidden group-hover:block absolute z-50 left-6 top-0 w-52 bg-zinc-900 text-xs text-zinc-100 px-3 py-2 rounded shadow-xl border border-zinc-700 animate-fadeIn">
              {tooltip}
            </span>
          </span>
        )}
      </span>
      <span className={`text-2xl md:text-3xl font-bold ${colorMap[color]}`}>{value}</span>
    </div>
  );
}
