"use client";
import { useMemo, useState } from "react";
import { FaFileAlt, FaFileDownload, FaSpinner } from "react-icons/fa";
import type { LancamentoFinanceiro } from "@/components/financeiro/types";
import { rachaConfig } from "@/config/racha.config";
import { useNotification } from "@/context/NotificationContext";

interface Props {
  lancamentos: LancamentoFinanceiro[];
}

const categoriaLabels: Record<string, string> = {
  diaria: "Diaria",
  mensalidade: "Mensalidade",
  patrocinio: "Patrocinio",
  evento: "Evento",
  campo: "Campo",
  uniforme: "Uniforme",
  arbitragem: "Arbitragem",
  outros: "Outro",
  despesa: "Despesa",
  despesa_adm: "Despesa Administrativa",
  sistema: `Sistema ${rachaConfig.nome}`,
  multa: "Multa",
};

const CATEGORIAS_EXPORT = [
  "diaria",
  "mensalidade",
  "patrocinio",
  "evento",
  "campo",
  "uniforme",
  "arbitragem",
  "outros",
  "despesa",
  "despesa_adm",
  "sistema",
  "multa",
];

export default function TabelaLancamentos({ lancamentos }: Props) {
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [periodoFiltro, setPeriodoFiltro] = useState("");
  const [formatoExport, setFormatoExport] = useState<"xlsx" | "csv" | "pdf">("xlsx");
  const [exportando, setExportando] = useState(false);
  const { notify } = useNotification();

  const filtrados = useMemo(() => {
    return lancamentos.filter((lanc) => {
      const categoria = lanc.categoria ?? "outros";
      const categoriaOk = !categoriaFiltro || categoria === categoriaFiltro;
      const periodoOk = !periodoFiltro || lanc.data.startsWith(periodoFiltro);
      return categoriaOk && periodoOk;
    });
  }, [lancamentos, categoriaFiltro, periodoFiltro]);

  const handleExport = async () => {
    const params = new URLSearchParams();
    params.set("format", formatoExport);

    if (categoriaFiltro) {
      params.set("category", categoriaFiltro);
    }

    if (periodoFiltro) {
      const [year, month] = periodoFiltro.split("-");
      if (year && month) {
        const start = `${year}-${month}-01`;
        const endDate = new Date(Number(year), Number(month), 0);
        const end = endDate.toISOString().split("T")[0];
        params.set("dateStart", start);
        params.set("dateEnd", end);
      }
    }

    setExportando(true);
    try {
      const response = await fetch(
        `/api/admin/financeiro/export${params.toString() ? `?${params.toString()}` : ""}`
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Falha ao exportar dados financeiros." }));
        throw new Error(errorData.error ?? errorData.message ?? "Falha ao exportar dados financeiros.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const disposition =
        response.headers.get("Content-Disposition") ?? response.headers.get("content-disposition");
      link.href = url;
      link.download = extractFilename(disposition) ?? `financeiro-${Date.now()}.${formatoExport}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      notify({ message: "Exportacao financeira iniciada com sucesso!", type: "success" });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Nao foi possivel exportar os lancamentos financeiros.";
      notify({ message, type: "error" });
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="w-full mt-2">
      <style jsx global>{`
        input[type="month"]::-webkit-calendar-picker-indicator {
          filter: invert(1) brightness(2);
        }
      `}</style>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3">
        <select
          value={categoriaFiltro}
          onChange={(event) => setCategoriaFiltro(event.target.value)}
          className="p-2 rounded bg-neutral-900 border border-neutral-700 text-sm text-white"
        >
          <option value="">Todas as categorias</option>
          {CATEGORIAS_EXPORT.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoriaLabels[categoria] ?? categoria}
            </option>
          ))}
        </select>
        <input
          type="month"
          value={periodoFiltro}
          onChange={(event) => setPeriodoFiltro(event.target.value)}
          className="p-2 rounded bg-neutral-900 border border-neutral-700 text-sm text-white"
        />
        <select
          value={formatoExport}
          onChange={(event) => setFormatoExport(event.target.value as typeof formatoExport)}
          className="p-2 rounded bg-neutral-900 border border-neutral-700 text-sm text-white"
        >
          <option value="xlsx">XLSX</option>
          <option value="csv">CSV</option>
          <option value="pdf">PDF</option>
        </select>
        <button
          type="button"
          onClick={handleExport}
          disabled={exportando}
          className="ml-auto px-4 py-2 bg-yellow-400 disabled:bg-yellow-600/60 disabled:cursor-not-allowed text-black rounded shadow text-sm font-semibold hover:bg-yellow-500 flex items-center gap-2 transition"
        >
          {exportando ? (
            <>
              <FaSpinner className="animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <FaFileDownload /> Exportar {formatoExport.toUpperCase()}
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-neutral-800">
        <table className="min-w-full bg-neutral-900 text-xs sm:text-sm">
          <thead>
            <tr className="bg-yellow-50/10">
              <th className="p-2 font-semibold text-yellow-300">Data</th>
              <th className="p-2 font-semibold text-yellow-300">Categoria</th>
              <th className="p-2 font-semibold text-yellow-300">Descricao</th>
              <th className="p-2 font-semibold text-yellow-300">Valor</th>
              <th className="p-2 font-semibold text-yellow-300">Responsavel</th>
              <th className="p-2 font-semibold text-yellow-300">Comprovante</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-400">
                  Nenhum lancamento encontrado para esse filtro.
                </td>
              </tr>
            ) : (
              filtrados.map((lanc) => {
                const categoria = lanc.categoria ?? "outros";
                const prefixo = lanc.tipo === "saida" ? "-" : "+";
                const valorFormatado = lanc.valor.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                });
                return (
                  <tr key={lanc.id} className="text-center border-t border-neutral-800">
                    <td className="p-2 text-gray-200">
                      {new Date(lanc.data).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-2 text-gray-200">
                      {categoriaLabels[categoria] ?? categoria}
                    </td>
                    <td className="p-2 text-gray-300">{lanc.descricao}</td>
                    <td
                      className={`p-2 font-bold ${
                        lanc.tipo === "saida" ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {prefixo} R$ {valorFormatado}
                    </td>
                    <td className="p-2 text-gray-300">{lanc.responsavel}</td>
                    <td className="p-2">
                      {lanc.comprovanteUrl ? (
                        <a
                          href={lanc.comprovanteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline"
                        >
                          <FaFileAlt />
                        </a>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function extractFilename(disposition: string | null): string | null {
  if (!disposition) return null;
  const match = /filename\*?="?([^";]+)"?/i.exec(disposition);
  return match ? decodeURIComponent(match[1]) : null;
}
