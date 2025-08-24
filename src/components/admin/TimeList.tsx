"use client";
import type { Time } from "@/types/time";

type Props = {
  times: Time[];
  onEdit: (time: Time) => void;
  onDelete: (id: string) => void;
};

export default function TimeList({ times, onEdit, onDelete }: Props) {
  if (!times.length)
    return (
      <div className="p-4 text-center text-gray-400">
        Nenhum time cadastrado.
      </div>
    );
  return (
    <div className="flex w-full flex-col gap-2">
      {times.map((time) => (
        <div
          key={time.id}
          className="flex flex-col items-center justify-between rounded-xl border bg-fundo p-3 shadow-sm sm:flex-row"
        >
          <div className="flex flex-col">
            <span className="font-bold text-yellow-400">{time.nome}</span>
            <span className="mb-1 text-xs text-gray-500">
              Slug: {time.slug}
            </span>
            <span className="text-sm text-gray-400">
              Jogadores:{" "}
              {Array.isArray(time.jogadores)
                ? time.jogadores.join(", ")
                : time.jogadores}
            </span>
          </div>
          <div className="mt-2 flex flex-row gap-2 sm:mt-0">
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
