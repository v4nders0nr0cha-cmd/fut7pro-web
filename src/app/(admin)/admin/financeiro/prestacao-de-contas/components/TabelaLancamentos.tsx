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
      <table className="min-w-full text-sm border-separate border-spacing-y-2">
        <thead>
          <tr className="text-xs text-gray-400">
            <th className="text-left px-2 py-2">Data</th>
            <th className="text-left px-2 py-2">Tipo</th>
            <th className="text-left px-2 py-2">Categoria</th>
            <th className="text-left px-2 py-2">Descrição</th>
            <th className="text-left px-2 py-2">Valor</th>
            <th className="text-left px-2 py-2">Comprovante</th>
            <th className="text-left px-2 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {exibir.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center text-gray-400 py-4">
                Nenhum lançamento neste período.
              </td>
            </tr>
          )}
          {exibir.map((l) => (
            <tr key={l.id} className="bg-neutral-800 hover:bg-neutral-700 transition rounded-lg">
              <td className="px-2 py-1 font-mono">{l.data.split("-").reverse().join("/")}</td>
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
                    className="w-8 h-8 rounded shadow object-contain"
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
        <div className="w-full flex justify-center mt-2">
          <button
            className="text-sm px-4 py-1 rounded bg-neutral-700 hover:bg-yellow-500 hover:text-black font-bold transition"
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
