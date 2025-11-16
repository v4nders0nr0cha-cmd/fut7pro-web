import { useState } from "react";
import type { LancamentoFinanceiro } from "@/types/financeiro";
import { DEFAULT_FORMATTER } from "../constants";

type Props = {
  lancamentos: LancamentoFinanceiro[];
  onEdit?: (item: LancamentoFinanceiro) => void;
};

export default function TabelaLancamentos({ lancamentos, onEdit }: Props) {
  const [showAll, setShowAll] = useState(false);
  const limit = 6;

  const itens = showAll ? lancamentos : lancamentos.slice(0, limit);

  const formatDate = (iso: string) => {
    if (!iso) return "-";
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border-separate border-spacing-y-2">
        <thead>
          <tr className="text-xs text-gray-400">
            <th className="text-left px-2 py-2">Data</th>
            <th className="text-left px-2 py-2">Tipo</th>
            <th className="text-left px-2 py-2">Categoria</th>
            <th className="text-left px-2 py-2">Descrição</th>
            <th className="text-left px-2 py-2">Valor</th>
            <th className="text-left px-2 py-2">Comprovante</th>
            <th className="text-left px-2 py-2" />
          </tr>
        </thead>
        <tbody>
          {itens.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center text-gray-400 py-4">
                Nenhum lançamento neste período.
              </td>
            </tr>
          )}
          {itens.map((lancamento) => {
            const isEntrada = lancamento.tipo === "entrada";
            return (
              <tr
                key={lancamento.id}
                className="bg-neutral-800 hover:bg-neutral-700 transition rounded-lg"
              >
                <td className="px-2 py-1 font-mono">{formatDate(lancamento.data)}</td>
                <td className={`px-2 py-1 ${isEntrada ? "text-green-400" : "text-red-400"}`}>
                  {isEntrada ? "Receita" : "Despesa"}
                </td>
                <td className="px-2 py-1">{lancamento.categoria}</td>
                <td className="px-2 py-1">{lancamento.descricao ?? "-"}</td>
                <td
                  className={`px-2 py-1 font-bold ${isEntrada ? "text-green-300" : "text-red-300"}`}
                >
                  {DEFAULT_FORMATTER.format(lancamento.valor)}
                </td>
                <td className="px-2 py-1">
                  {lancamento.comprovanteUrl ? (
                    <img
                      src={lancamento.comprovanteUrl}
                      alt="Comprovante financeiro"
                      className="w-8 h-8 rounded shadow object-contain"
                    />
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-2 py-1">
                  <button
                    type="button"
                    className="text-xs text-yellow-400 hover:underline"
                    onClick={() => onEdit?.(lancamento)}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {lancamentos.length > limit && (
        <div className="w-full flex justify-center mt-2">
          <button
            type="button"
            className="text-sm px-4 py-1 rounded bg-neutral-700 hover:bg-yellow-500 hover:text-black font-bold transition"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? "Ver menos" : `Ver mais (${lancamentos.length - limit})`}
          </button>
        </div>
      )}
    </div>
  );
}
