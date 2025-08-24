"use client";

import React from "react";

interface CardResumoProps {
  titulo: string;
  valor: string | number;
  corTexto?: string;
}

export default function CardResumo({
  titulo,
  valor,
  corTexto,
}: CardResumoProps) {
  return (
    <div className="flex flex-col items-start justify-center rounded-2xl bg-zinc-800 p-4 shadow">
      <span className="mb-2 text-xs font-semibold text-zinc-400">{titulo}</span>
      <span
        className={`text-2xl font-bold md:text-3xl ${corTexto || "text-white"}`}
      >
        {valor}
      </span>
    </div>
  );
}
