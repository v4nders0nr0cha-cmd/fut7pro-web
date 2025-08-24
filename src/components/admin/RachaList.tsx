// src/components/admin/RachaList.tsx
"use client";
import { useEffect, useState } from "react";
import type { Racha } from "@/types/racha";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

type Props = {
  onEdit: (racha: Racha) => void;
  onDelete: (racha: Racha) => void;
};

export default function RachaList({ onEdit, onDelete }: Props) {
  const [rachas, setRachas] = useState<Racha[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rachas")
      .then((res) => res.json())
      .then((data) => setRachas(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-yellow-500">
        Carregando rachas...
      </div>
    );
  }

  if (!rachas.length) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-400">
        Nenhum racha cadastrado ainda.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <table className="w-full overflow-hidden rounded-lg text-sm">
        <thead>
          <tr className="bg-neutral-800 text-yellow-500">
            <th className="px-4 py-2 text-left">Nome</th>
            <th className="px-2 py-2">Slug</th>
            <th className="hidden px-2 py-2 md:table-cell">Tema</th>
            <th className="hidden px-2 py-2 md:table-cell">Criado em</th>
            <th className="px-2 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rachas.map((racha) => (
            <tr
              key={racha.id}
              className="group border-b border-neutral-800 transition hover:bg-neutral-900"
            >
              <td className="px-4 py-2 font-bold text-white">
                <div className="flex items-center gap-2">
                  {racha.logoUrl && (
                    <img
                      src={racha.logoUrl}
                      alt={racha.nome}
                      className="h-7 w-7 rounded-full border border-yellow-500 bg-neutral-800 object-cover"
                    />
                  )}
                  <span>{racha.nome}</span>
                </div>
              </td>
              <td className="px-2 py-2 text-gray-300">
                {racha.slug || <span className="italic text-gray-500">-</span>}
              </td>
              <td className="hidden px-2 py-2 text-gray-400 md:table-cell">
                {racha.tema || <span className="italic text-gray-500">-</span>}
              </td>
              <td className="hidden px-2 py-2 text-gray-400 md:table-cell">
                {racha.criadoEm
                  ? format(new Date(racha.criadoEm), "dd/MM/yyyy", {
                      locale: ptBR,
                    })
                  : "-"}
              </td>
              <td className="px-2 py-2">
                <div className="flex justify-end gap-2">
                  <button
                    title="Editar"
                    className="font-bold text-yellow-500 hover:text-yellow-400"
                    onClick={() => onEdit(racha)}
                  >
                    ✏️
                  </button>
                  <button
                    title="Excluir"
                    className="font-bold text-red-500 hover:text-red-400"
                    onClick={() => onDelete(racha)}
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
