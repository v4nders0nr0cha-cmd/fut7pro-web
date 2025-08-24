// src/components/admin/PartidaList.tsx
"use client";
import type { Partida } from "@/types/partida";

type Props = {
  partidas: Partida[];
  onEdit: (partida: Partida) => void;
  onDelete: (id: string) => void;
};

export default function PartidaList({ partidas, onEdit, onDelete }: Props) {
  if (!partidas.length) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-400">
        Nenhuma partida cadastrada ainda.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <table className="w-full overflow-hidden rounded-lg text-sm">
        <thead>
          <tr className="bg-neutral-800 text-yellow-500">
            <th className="px-4 py-2 text-left">Data</th>
            <th className="px-2 py-2">Hora</th>
            <th className="px-2 py-2">Local</th>
            <th className="px-2 py-2">Time A</th>
            <th className="px-2 py-2">Time B</th>
            <th className="px-2 py-2">Placar</th>
            <th className="px-2 py-2">Finalizada</th>
            <th className="px-2 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {partidas.map((partida) => (
            <tr
              key={partida.id}
              className="group border-b border-neutral-800 transition hover:bg-neutral-900"
            >
              <td className="px-4 py-2 text-white">
                {new Date(partida.data).toLocaleDateString("pt-BR")}
              </td>
              <td className="px-2 py-2 text-gray-300">{partida.horario}</td>
              <td className="px-2 py-2 text-gray-400">{partida.local}</td>
              <td className="px-2 py-2 font-bold text-gray-300">
                {partida.timeA}
              </td>
              <td className="px-2 py-2 font-bold text-gray-300">
                {partida.timeB}
              </td>
              <td className="px-2 py-2 font-mono text-white">
                {partida.golsTimeA} x {partida.golsTimeB}
              </td>
              <td className="px-2 py-2 text-gray-400">
                {partida.finalizada ? "✅" : "⏳"}
              </td>
              <td className="px-2 py-2">
                <div className="flex justify-end gap-2">
                  <button
                    title="Editar"
                    className="font-bold text-yellow-500 hover:text-yellow-400"
                    onClick={() => onEdit(partida)}
                  >
                    ✏️
                  </button>
                  <button
                    title="Excluir"
                    className="font-bold text-red-500 hover:text-red-400"
                    onClick={() => onDelete(partida.id)}
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
