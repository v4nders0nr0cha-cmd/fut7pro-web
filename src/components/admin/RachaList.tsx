// src/components/admin/RachaList.tsx
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
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
    <div className="w-full max-w-3xl mx-auto">
      <table className="w-full text-sm rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-neutral-800 text-yellow-500">
            <th className="px-4 py-2 text-left">Nome</th>
            <th className="px-2 py-2">Slug</th>
            <th className="px-2 py-2 hidden md:table-cell">Tema</th>
            <th className="px-2 py-2 hidden md:table-cell">Criado em</th>
            <th className="px-2 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rachas.map((racha) => (
            <tr
              key={racha.id}
              className="border-b border-neutral-800 hover:bg-neutral-900 transition group"
            >
              <td className="px-4 py-2 font-bold text-white">
                <div className="flex items-center gap-2">
                  {racha.logoUrl && (
                    <Image
                      src={racha.logoUrl}
                      alt={racha.nome}
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-full border border-yellow-500 bg-neutral-800 object-cover"
                    />
                  )}
                  <span>{racha.nome}</span>
                </div>
              </td>
              <td className="px-2 py-2 text-gray-300">
                {racha.slug || <span className="italic text-gray-500">-</span>}
              </td>
              <td className="px-2 py-2 text-gray-400 hidden md:table-cell">
                {racha.tema || <span className="italic text-gray-500">-</span>}
              </td>
              <td className="px-2 py-2 text-gray-400 hidden md:table-cell">
                {racha.criadoEm
                  ? format(new Date(racha.criadoEm), "dd/MM/yyyy", { locale: ptBR })
                  : "-"}
              </td>
              <td className="px-2 py-2">
                <div className="flex gap-2 justify-end">
                  <button
                    title="Editar"
                    className="text-yellow-500 hover:text-yellow-400 font-bold"
                    onClick={() => onEdit(racha)}
                  >
                    ✏️
                  </button>
                  <button
                    title="Excluir"
                    className="text-red-500 hover:text-red-400 font-bold"
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
