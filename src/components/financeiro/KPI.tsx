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
    <div className="group relative flex flex-col items-start justify-center rounded-2xl bg-zinc-800 p-4 shadow">
      <span className="mb-2 flex items-center gap-1 text-xs font-semibold text-zinc-400">
        {title}
        {tooltip && (
          <span className="relative">
            <FaInfoCircle className="ml-1 cursor-pointer text-blue-400" />
            <span className="animate-fadeIn absolute left-6 top-0 z-50 hidden w-52 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 shadow-xl group-hover:block">
              {tooltip}
            </span>
          </span>
        )}
      </span>
      <span className={`text-2xl font-bold md:text-3xl ${colorMap[color]}`}>
        {value}
      </span>
    </div>
  );
}
