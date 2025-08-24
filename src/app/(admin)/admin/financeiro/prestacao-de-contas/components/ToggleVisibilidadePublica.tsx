"use client";
import { useState } from "react";

type Props = {
  visivel: boolean;
  onToggle: (visivel: boolean) => void;
};

export default function ToggleVisibilidadePublica({
  visivel,
  onToggle,
}: Props) {
  return (
    <div className="mb-6 flex items-center gap-4 rounded-lg border border-neutral-700 bg-neutral-800 p-4 shadow-sm">
      <span className="text-sm font-medium text-gray-300">Página pública:</span>
      <button
        className={`relative h-8 w-14 rounded-full transition ${visivel ? "bg-green-500" : "bg-gray-500"} `}
        onClick={() => onToggle(!visivel)}
        aria-pressed={visivel}
        aria-label="Alternar visibilidade pública"
        type="button"
      >
        <span
          className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${visivel ? "translate-x-6" : ""} `}
        />
      </button>
      <span
        className={`ml-2 text-sm font-bold ${visivel ? "text-green-400" : "text-red-400"}`}
      >
        {visivel
          ? "Visível no site público"
          : "Privado (oculto no site público)"}
      </span>
    </div>
  );
}
