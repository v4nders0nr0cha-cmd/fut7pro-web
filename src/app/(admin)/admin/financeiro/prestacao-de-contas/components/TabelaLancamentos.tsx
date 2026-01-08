import type { LancamentoFinanceiro } from "@/types/financeiro";
import { useState } from "react";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value ?? 0);

const resolveComprovanteKind = (url?: string) => {
  if (!url) return "none";
  const normalized = url.toLowerCase();
  if (normalized.includes("application/pdf") || normalized.endsWith(".pdf")) return "pdf";
  if (normalized.startsWith("data:image") || /\.(png|jpe?g|gif|webp|svg)$/.test(normalized)) {
    return "image";
  }
  return "file";
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const base = value.includes("T") ? value.slice(0, 10) : value;
  if (base.includes("-")) {
    return base.split("-").reverse().join("/");
  }
  return base;
};

type Props = {
  lancamentos: LancamentoFinanceiro[];
  onEdit?: (item: LancamentoFinanceiro) => void;
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
            <th className="text-left px-2 py-2">Descricao</th>
            <th className="text-left px-2 py-2">Valor</th>
            <th className="text-left px-2 py-2">Comprovante</th>
            <th className="text-left px-2 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {exibir.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center text-gray-400 py-4">
                Nenhum lancamento neste periodo.
              </td>
            </tr>
          )}
          {exibir.map((l) => {
            const tipo =
              l.tipo && l.tipo.toLowerCase().includes("desp")
                ? "Despesa"
                : l.valor < 0
                  ? "Despesa"
                  : "Receita";
            const valor = l.valor ?? 0;
            const comprovanteKind = resolveComprovanteKind(l.comprovanteUrl);

            return (
              <tr key={l.id} className="bg-neutral-800 hover:bg-neutral-700 transition rounded-lg">
                <td className="px-2 py-1 font-mono">{formatDate(l.data)}</td>
                <td
                  className={`px-2 py-1 ${tipo === "Receita" ? "text-green-400" : "text-red-400"}`}
                >
                  {tipo}
                </td>
                <td className="px-2 py-1">{l.categoria || "-"}</td>
                <td className="px-2 py-1">
                  <div className="text-white">{l.descricao || "-"}</div>
                  {l.observacoes && (
                    <div className="text-xs text-gray-400 mt-1">Obs: {l.observacoes}</div>
                  )}
                </td>
                <td
                  className={`px-2 py-1 font-bold ${valor >= 0 ? "text-green-300" : "text-red-300"}`}
                >
                  {formatCurrency(valor)}
                </td>
                <td className="px-2 py-1">
                  {comprovanteKind !== "none" ? (
                    <a
                      href={l.comprovanteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      {comprovanteKind === "image" ? (
                        <img
                          src={l.comprovanteUrl}
                          alt="Comprovante financeiro do racha Fut7Pro"
                          className="w-8 h-8 rounded shadow object-contain"
                        />
                      ) : (
                        <span className="text-xs font-bold text-yellow-400 underline">
                          {comprovanteKind === "pdf" ? "PDF" : "Arquivo"}
                        </span>
                      )}
                    </a>
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
            );
          })}
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
