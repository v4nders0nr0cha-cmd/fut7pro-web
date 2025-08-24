// src/components/admin/CardRelatoriosEngajamento.tsx
"use client";

import { FaChartLine } from "react-icons/fa";
import Link from "next/link";

export default function CardRelatoriosEngajamento() {
  return (
    <div className="relative flex min-h-[210px] cursor-pointer flex-col items-center rounded-xl bg-[#23272F] p-6 shadow transition hover:scale-[1.025] hover:shadow-lg">
      <span className="absolute left-3 top-3 z-10 rounded-xl bg-gradient-to-r from-blue-700 to-cyan-400 px-3 py-1 text-xs font-bold text-white shadow">
        📈 RELATÓRIO
      </span>
      <FaChartLine className="mb-2 h-12 w-12 text-cyan-400" />
      <span className="mb-1 text-center text-xl font-bold text-white">
        Relatórios de Engajamento
      </span>
      <span className="mb-3 text-center text-sm text-gray-400">
        Veja as principais métricas do seu racha: visualizações, acessos,
        engajamento dos atletas e mais!
      </span>
      <Link
        href="/admin/relatorios"
        className="mt-auto rounded bg-cyan-500 px-5 py-1 text-xs font-semibold text-white shadow transition hover:bg-cyan-600"
      >
        Ver Relatórios
      </Link>
    </div>
  );
}
