"use client";

import React from "react";

export interface CardPlanoProps {
  nome: string;
  tipo: "Mensal" | "Anual";
  ativos: number;
  receita: number;
  inadimplentes: number;
  vencimentos: number;
  cor: string; // sempre string!
  onClickInadimplentes?: () => void;
}

export default function CardPlano({
  nome,
  tipo,
  ativos,
  receita,
  inadimplentes,
  vencimentos,
  cor = "#32d657", // Fallback padrão caso venha undefined
  onClickInadimplentes,
}: CardPlanoProps) {
  return (
    <div
      className="bg-zinc-800 rounded-2xl shadow p-4 flex flex-col gap-2 border-l-8"
      style={{ borderColor: cor || "#32d657" }}
    >
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold" style={{ color: cor || "#32d657" }}>
          {nome}
        </span>
        <span className="text-xs bg-zinc-700 text-white px-2 py-1 rounded">Plano {tipo}</span>
      </div>
      <div className="flex flex-wrap gap-4 mt-2">
        <div className="flex flex-col">
          <span className="text-xs text-zinc-400">Ativos</span>
          <span className="font-bold text-white">{ativos}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-zinc-400">Receita</span>
          <span className="font-bold text-green-400">R$ {receita.toLocaleString("pt-BR")}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-zinc-400">Inadimplentes</span>
          <span
            className={`font-bold ${inadimplentes > 0 ? "text-red-400 cursor-pointer underline" : "text-green-400"}`}
            title={inadimplentes > 0 ? "Clique para ver inadimplentes" : ""}
            tabIndex={inadimplentes > 0 ? 0 : -1}
            role={inadimplentes > 0 ? "button" : undefined}
            onClick={inadimplentes > 0 ? onClickInadimplentes : undefined}
            onKeyDown={
              inadimplentes > 0 ? (e) => e.key === "Enter" && onClickInadimplentes?.() : undefined
            }
            aria-label={inadimplentes > 0 ? "Ver inadimplentes" : undefined}
          >
            {inadimplentes}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-zinc-400">Próx. Vencimentos</span>
          <span className="font-bold text-yellow-400">{vencimentos}</span>
        </div>
      </div>
    </div>
  );
}
