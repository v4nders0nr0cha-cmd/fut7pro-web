"use client";

import React from "react";
import type { RachaDetalheResumido } from "@/components/financeiro/types";

interface TabelaRachasProps {
  rachas: RachaDetalheResumido[];
  onDetalhes: (rachaId: string) => void;
}

const STATUS_COLORS: Record<RachaDetalheResumido["status"], string> = {
  Pago: "text-green-400",
  "Em aberto": "text-red-400",
  Trial: "text-yellow-400",
  Cancelado: "text-zinc-500",
};

export default function TabelaRachas({
  rachas,
  onDetalhes,
}: TabelaRachasProps) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-zinc-800 p-4 shadow">
      <h2 className="mb-3 text-base font-semibold text-white">
        Rachas Detalhados
      </h2>
      <table className="min-w-full text-left text-sm text-white">
        <thead>
          <tr className="border-b border-zinc-700">
            <th className="px-3 py-2">Racha</th>
            <th className="px-3 py-2">Presidente</th>
            <th className="px-3 py-2">Plano</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Valor</th>
            <th className="px-3 py-2">Vencimento</th>
            <th className="px-3 py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {rachas.length === 0 && (
            <tr>
              <td colSpan={7} className="py-6 text-center text-zinc-400">
                Nenhum racha encontrado com os filtros atuais.
              </td>
            </tr>
          )}
          {rachas.map((row) => (
            <tr
              key={row.id}
              className="border-b border-zinc-700 transition hover:bg-zinc-700/30"
            >
              <td className="px-3 py-2">{row.racha}</td>
              <td className="px-3 py-2">{row.presidente}</td>
              <td className="px-3 py-2">{row.plano}</td>
              <td
                className={`px-3 py-2 font-semibold ${STATUS_COLORS[row.status] || "text-white"}`}
                title={`Status: ${row.status}`}
              >
                <span
                  className={`inline-block rounded-full bg-opacity-20 px-2 py-1 ${
                    row.status === "Pago"
                      ? "bg-green-500"
                      : row.status === "Em aberto"
                        ? "bg-red-500"
                        : row.status === "Trial"
                          ? "bg-yellow-500"
                          : "bg-zinc-700"
                  }`}
                >
                  {row.status}
                </span>
              </td>
              <td className="px-3 py-2">
                R${" "}
                {typeof row.valor === "number"
                  ? row.valor.toLocaleString("pt-BR")
                  : 0}
              </td>
              <td className="px-3 py-2">
                {typeof row.vencimento === "string" ? row.vencimento : "--"}
              </td>
              <td className="px-3 py-2">
                <button
                  className="rounded bg-blue-500 px-3 py-1 text-xs text-white transition hover:bg-blue-600"
                  aria-label="Ver detalhes financeiros"
                  onClick={() => onDetalhes(row.id)}
                  tabIndex={0}
                >
                  Ver Detalhes
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
