// src/components/atletas/HistoricoJogos.tsx
"use client";

import { useState } from "react";
import type { JogoAtleta } from "@/types/atletas";
import Link from "next/link";

interface Props {
  historico: JogoAtleta[];
}

export default function HistoricoJogos({ historico }: Props) {
  const [filtroAno, setFiltroAno] = useState<string | null>(null);

  const anosDisponiveis = Array.from(
    new Set(historico.map((j) => new Date(j.data).getFullYear().toString())),
  ).sort((a, b) => Number(b) - Number(a));

  const historicoFiltrado = filtroAno
    ? historico.filter(
        (j) => new Date(j.data).getFullYear().toString() === filtroAno,
      )
    : historico;

  const jogosRecentes = historicoFiltrado.slice(0, 4);

  return (
    <section className="mx-auto mt-10 max-w-screen-xl px-4">
      <h2 className="mb-4 text-center text-xl font-bold text-yellow-400">
        🎮 Histórico de Participações
      </h2>

      {anosDisponiveis.length > 1 && (
        <div className="mb-4 text-center">
          <label className="mr-2 text-sm">Filtrar por ano:</label>
          <select
            className="rounded bg-zinc-800 p-1 text-white"
            value={filtroAno ?? ""}
            onChange={(e) => setFiltroAno(e.target.value || null)}
          >
            <option value="">Todos</option>
            {anosDisponiveis.map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border border-zinc-700 text-sm">
          <thead className="bg-zinc-900 text-gray-300">
            <tr>
              <th className="border p-2">Data</th>
              <th className="border p-2">Time</th>
              <th className="border p-2">Resultado</th>
              <th className="border p-2">Gols</th>
              <th className="border p-2">Campeão?</th>
              <th className="border p-2">Pontuação</th>
              <th className="border p-2">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {jogosRecentes.length > 0 ? (
              jogosRecentes.map((jogo, index) => (
                <tr key={index} className="text-center">
                  <td className="border p-2">{jogo.data}</td>
                  <td className="border p-2">{jogo.time}</td>
                  <td className="border p-2">{jogo.resultado}</td>
                  <td className="border p-2">{jogo.gols}</td>
                  <td className="border p-2">{jogo.campeao ? "🏆" : ""}</td>
                  <td className="border p-2">{jogo.pontuacao}</td>
                  <td className="border p-2">
                    <button className="text-yellow-400 hover:underline">
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="p-4 text-center italic text-gray-400"
                >
                  Nenhuma participação registrada para este ano.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
