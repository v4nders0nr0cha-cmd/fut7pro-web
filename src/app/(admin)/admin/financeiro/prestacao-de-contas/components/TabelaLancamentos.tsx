import type { Lancamento } from "../mocks/mockLancamentosFinanceiro";
import { useState } from "react";

type Props = {
  lancamentos: Lancamento[];
  onEdit?: (item: Lancamento) => void;
};

export default function TabelaLancamentos({ lancamentos, onEdit }: Props) {
  const [showAll, setShowAll] = useState(false);
  const limit = 6;

  const exibir = showAll ? lancamentos : lancamentos.slice(0, limit);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr className="text-xs text-gray-400">
            <th className="px-2 py-2 text-left">Data</th>
            <th className="px-2 py-2 text-left">Tipo</th>
            <th className="px-2 py-2 text-left">Categoria</th>
            <th className="px-2 py-2 text-left">Descrição</th>
            <th className="px-2 py-2 text-left">Valor</th>
            <th className="px-2 py-2 text-left">Comprovante</th>
            <th className="px-2 py-2 text-left"></th>
          </tr>
        </thead>
        <tbody>
          {exibir.length === 0 && (
            <tr>
              <td colSpan={7} className="py-4 text-center text-gray-400">
                Nenhum lançamento neste período.
              </td>
            </tr>
          )}
          {exibir.map((l) => (
            <tr
              key={l.id}
              className="rounded-lg bg-neutral-800 transition hover:bg-neutral-700"
            >
              <td className="px-2 py-1 font-mono">
                {l.data.split("-").reverse().join("/")}
              </td>
              <td
                className={`px-2 py-1 ${l.tipo === "Receita" ? "text-green-400" : "text-red-400"}`}
              >
                {l.tipo}
              </td>
              <td className="px-2 py-1">{l.categoria}</td>
              <td className="px-2 py-1">{l.descricao}</td>
              <td
                className={`px-2 py-1 font-bold ${l.valor >= 0 ? "text-green-300" : "text-red-300"}`}
              >
                R$ {l.valor.toFixed(2)}
              </td>
              <td className="px-2 py-1">
                {l.comprovante ? (
                  <img
                    src={l.comprovante}
                    alt="Comprovante financeiro do racha Fut7Pro"
                    className="h-8 w-8 rounded object-contain shadow"
                  />
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-2 py-1">
                <button
                  className="text-xs text-yellow-400 hover:underline"
                  onClick={() => onEdit && onEdit(l)}
                  type="button"
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {lancamentos.length > limit && (
        <div className="mt-2 flex w-full justify-center">
          <button
            className="rounded bg-neutral-700 px-4 py-1 text-sm font-bold transition hover:bg-yellow-500 hover:text-black"
            onClick={() => setShowAll(!showAll)}
            type="button"
          >
            {showAll ? "Ver menos" : `Ver mais (${lancamentos.length - limit})`}
          </button>
        </div>
      )}
    </div>
  );
}
