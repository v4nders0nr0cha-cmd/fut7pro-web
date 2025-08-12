// src/components/admin/CardRelatoriosEngajamento.tsx
"use client";

import { FaChartLine } from "react-icons/fa";
import Link from "next/link";

export default function CardRelatoriosEngajamento() {
  return (
    <div className="relative bg-[#23272F] rounded-xl shadow flex flex-col items-center p-6 transition hover:scale-[1.025] hover:shadow-lg cursor-pointer min-h-[210px]">
      <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-blue-700 to-cyan-400 text-white text-xs font-bold px-3 py-1 rounded-xl shadow">
        📈 RELATÓRIO
      </span>
      <FaChartLine className="text-cyan-400 w-12 h-12 mb-2" />
      <span className="text-xl font-bold text-white mb-1 text-center">
        Relatórios de Engajamento
      </span>
      <span className="text-sm text-gray-400 mb-3 text-center">
        Veja as principais métricas do seu racha: visualizações, acessos, engajamento dos atletas e
        mais!
      </span>
      <Link
        href="/admin/relatorios"
        className="mt-auto px-5 py-1 rounded bg-cyan-500 text-white text-xs font-semibold shadow hover:bg-cyan-600 transition"
      >
        Ver Relatórios
      </Link>
    </div>
  );
}
