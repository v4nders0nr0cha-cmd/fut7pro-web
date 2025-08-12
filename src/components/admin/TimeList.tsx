"use client";
import type { Time } from "@/types/time";

type Props = {
  times: Time[];
  onEdit: (time: Time) => void;
  onDelete: (id: string) => void;
};

export default function TimeList({ times, onEdit, onDelete }: Props) {
  if (!times.length)
    return <div className="p-4 text-center text-gray-400">Nenhum time cadastrado.</div>;
  return (
    <div className="w-full flex flex-col gap-2">
      {times.map((time) => (
        <div
          key={time.id}
          className="flex flex-col sm:flex-row items-center justify-between bg-fundo border rounded-xl p-3 shadow-sm"
        >
          <div className="flex flex-col">
            <span className="font-bold text-yellow-400">{time.nome}</span>
            <span className="text-xs text-gray-500 mb-1">Slug: {time.slug}</span>
            <span className="text-sm text-gray-400">
              Jogadores:{" "}
              {Array.isArray(time.jogadores) ? time.jogadores.join(", ") : time.jogadores}
            </span>
          </div>
          <div className="flex flex-row gap-2 mt-2 sm:mt-0">
            <button className="btn-primary" onClick={() => onEdit(time)}>
              Editar
            </button>
            <button className="btn-secondary" onClick={() => onDelete(time.id)}>
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
