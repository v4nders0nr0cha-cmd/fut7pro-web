"use client";

import React from "react";

interface CardResumoProps {
  titulo: string;
  valor: string | number;
  corTexto?: string;
}

export default function CardResumo({ titulo, valor, corTexto }: CardResumoProps) {
  return (
    <div className="bg-zinc-800 rounded-2xl shadow p-4 flex flex-col items-start justify-center">
      <span className="text-zinc-400 text-xs font-semibold mb-2">{titulo}</span>
      <span className={`text-2xl md:text-3xl font-bold ${corTexto || "text-white"}`}>{valor}</span>
    </div>
  );
}
