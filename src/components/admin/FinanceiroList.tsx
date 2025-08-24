"use client";
import type { Financeiro } from "@/hooks/useFinanceiro";

function formatarData(dt: string) {
  return new Date(dt).toLocaleDateString("pt-BR");
}
function formatarValor(v: number, tipo: string) {
  return `${tipo === "saida" ? "-" : "+"} R$ ${v.toFixed(2)}`;
}

type Props = {
  lancamentos: Financeiro[];
};

export default function FinanceiroList({ lancamentos }: Props) {
  if (!lancamentos.length)
    return (
      <div className="p-4 text-center text-gray-400">
        Nenhum lançamento financeiro.
      </div>
    );
  return (
    <div className="flex w-full flex-col gap-2">
      {lancamentos.map((l) => (
        <div
          key={l.id}
          className="flex flex-col items-center justify-between rounded-xl border bg-fundo p-3 shadow-sm sm:flex-row"
        >
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
            <span className="font-bold text-yellow-400">{l.categoria}</span>
            <span
              className={`ml-2 font-bold ${l.tipo === "saida" ? "text-red-400" : "text-green-400"}`}
            >
              {formatarValor(l.valor, l.tipo)}
            </span>
            <span className="ml-2 text-xs text-gray-500">{l.adminNome}</span>
            <span className="ml-2 text-xs text-gray-400">
              {formatarData(l.data)}
            </span>
            {l.descricao && (
              <span className="ml-2 text-xs text-gray-500">{l.descricao}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
