"use client";
import type { LancamentoFinanceiro } from "@/components/financeiro/types";
import { useMemo, useState } from "react";
import { FaFileAlt, FaFileDownload, FaSpinner } from "react-icons/fa";
import { rachaConfig } from "@/config/racha.config";
import { useNotification } from "@/context/NotificationContext";

interface Props {
  lancamentos: LancamentoFinanceiro[];
}

const tiposMap: Record<string, string> = {
  diaria: "Diária",
  mensalidade: "Mensalidade",
  patrocinio: "Patrocínio",
  evento: "Evento",
  outros: "Outro",
  despesa: "Despesa",
  despesa_adm: "Despesa Administrativa",
  sistema: `Sistema ${rachaConfig.nome}`,
};

export default function TabelaLancamentos({ lancamentos }: Props) {
  const [filtro, setFiltro] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState("");
  const [formato, setFormato] = useState<"xlsx" | "csv" | "pdf">("xlsx");
  const [exportando, setExportando] = useState(false);
  const { notify } = useNotification();

  const filtrados = useMemo(
    () =>
      lancamentos.filter((l) => {
        const tipoOk = !filtro || l.tipo === filtro;
        const periodoOk = !filtroPeriodo || l.data.startsWith(filtroPeriodo);
        return tipoOk && periodoOk;
      }),
    [lancamentos, filtro, filtroPeriodo]
  );

  const handleExport = async () => {
    const params = new URLSearchParams();
    params.set("format", formato);

    if (filtro) {
      params.set("category", filtro);
    }

    if (filtroPeriodo) {
      const [year, month] = filtroPeriodo.split("-");
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
        const errorData = await response.json().catch(() => ({
          error: "Falha ao exportar dados financeiros.",
        }));
        throw new Error(
          errorData.error ?? errorData.message ?? "Falha ao exportar dados financeiros."
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const disposition =
        response.headers.get("Content-Disposition") ?? response.headers.get("content-disposition");
      link.href = url;
      link.download = extractFilename(disposition) ?? `financeiro-${Date.now()}.${formato}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      notify({ message: "Exportação financeira iniciada com sucesso!", type: "success" });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível exportar os lançamentos financeiros.";
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
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="p-2 rounded bg-neutral-900 border border-neutral-700 text-sm text-white"
        >
          <option value="">Todos os tipos</option>
          <option value="diaria">Diária</option>
          <option value="mensalidade">Mensalidade</option>
          <option value="patrocinio">Patrocínio</option>
          <option value="evento">Evento</option>
          <option value="outros">Outro</option>
          <option value="despesa">Despesa</option>
          <option value="despesa_adm">Despesa Administrativa</option>
          <option value="sistema">Sistema {rachaConfig.nome}</option>
        </select>
        <input
          type="month"
          value={filtroPeriodo}
          onChange={(e) => setFiltroPeriodo(e.target.value)}
          className="p-2 rounded bg-neutral-900 border border-neutral-700 text-sm text-white"
        />
        <select
          value={formato}
          onChange={(e) => setFormato(e.target.value as typeof formato)}
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
              <FaFileDownload /> Exportar {formato.toUpperCase()}
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-neutral-800">
        <table className="min-w-full bg-neutral-900 text-xs sm:text-sm">
          <thead>
            <tr className="bg-yellow-50/10">
              <th className="p-2 font-semibold text-yellow-300">Data</th>
              <th className="p-2 font-semibold text-yellow-300">Tipo</th>
              <th className="p-2 font-semibold text-yellow-300">Descrição</th>
              <th className="p-2 font-semibold text-yellow-300">Valor</th>
              <th className="p-2 font-semibold text-yellow-300">Responsável</th>
              <th className="p-2 font-semibold text-yellow-300">Comprovante</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-400">
                  Nenhum lançamento encontrado para esse filtro.
                </td>
              </tr>
            ) : (
              filtrados.map((l) => (
                <tr key={l.id} className="text-center border-t border-neutral-800">
                  <td className="p-2 text-gray-200">
                    {new Date(l.data).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="p-2 text-gray-200">{tiposMap[l.tipo]}</td>
                  <td className="p-2 text-gray-300">{l.descricao}</td>
                  <td
                    className={`p-2 font-bold ${l.valor >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    R$ {Math.abs(l.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 text-gray-300">{l.responsavel}</td>
                  <td className="p-2">
                    {l.comprovanteUrl ? (
                      <a
                        href={l.comprovanteUrl}
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function extractFilename(disposition: string | null): string | null {
  if (!disposition) return null;
  const filenameMatch = disposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
  if (!filenameMatch) return null;
  try {
    const raw = filenameMatch[1];
    if (raw.startsWith("UTF-8''")) {
      return decodeURIComponent(raw.slice(7));
    }
    return decodeURIComponent(raw.replace(/"/g, ""));
  } catch {
    return null;
  }
}
