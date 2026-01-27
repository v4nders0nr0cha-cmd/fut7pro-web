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
    new Set(historico.map((j) => new Date(j.data).getFullYear().toString()))
  ).sort((a, b) => Number(b) - Number(a));

  const historicoFiltrado = filtroAno
    ? historico.filter((j) => new Date(j.data).getFullYear().toString() === filtroAno)
    : historico;

  const jogosRecentes = historicoFiltrado.slice(0, 4);

  return (
    <section className="mt-10 max-w-screen-xl mx-auto px-4">
      <h2 className="text-xl font-bold text-brand mb-4 text-center">
        🎮 Histórico de Participações
      </h2>

      {anosDisponiveis.length > 1 && (
        <div className="mb-4 text-center">
          <label className="text-sm mr-2">Filtrar por ano:</label>
          <select
            className="bg-zinc-800 text-white p-1 rounded"
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
        <table className="min-w-full text-sm border border-zinc-700">
          <thead className="bg-zinc-900 text-gray-300">
            <tr>
              <th className="p-2 border">Data</th>
              <th className="p-2 border">Time</th>
              <th className="p-2 border">Resultado</th>
              <th className="p-2 border">Gols</th>
              <th className="p-2 border">Campeão?</th>
              <th className="p-2 border">Pontuação</th>
              <th className="p-2 border">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {jogosRecentes.length > 0 ? (
              jogosRecentes.map((jogo, index) => (
                <tr key={index} className="text-center">
                  <td className="p-2 border">{jogo.data}</td>
                  <td className="p-2 border">{jogo.time}</td>
                  <td className="p-2 border">{jogo.resultado}</td>
                  <td className="p-2 border">{jogo.gols}</td>
                  <td className="p-2 border">{jogo.campeao ? "🏆" : ""}</td>
                  <td className="p-2 border">{jogo.pontuacao}</td>
                  <td className="p-2 border">
                    <button className="text-brand hover:underline">Ver Detalhes</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-400 italic">
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
