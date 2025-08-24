"use client";
import type { LancamentoFinanceiro } from "@/components/financeiro/types";
import { useState } from "react";
import { FaFileAlt, FaFileDownload } from "react-icons/fa";
import { rachaConfig } from "@/config/racha.config";

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

  const filtrados = lancamentos.filter((l) => {
    const tipoOk = !filtro || l.tipo === filtro;
    const periodoOk = !filtroPeriodo || l.data.startsWith(filtroPeriodo);
    return tipoOk && periodoOk;
  });

  return (
    <div className="mt-2 w-full">
      <style jsx global>{`
        input[type="month"]::-webkit-calendar-picker-indicator {
          filter: invert(1) brightness(2);
        }
      `}</style>
      <div className="mb-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="rounded border border-neutral-700 bg-neutral-900 p-2 text-sm text-white"
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
          className="rounded border border-neutral-700 bg-neutral-900 p-2 text-sm text-white"
        />
        <button className="ml-auto flex items-center gap-2 rounded bg-yellow-400 px-4 py-2 text-sm font-semibold text-black shadow hover:bg-yellow-500">
          <FaFileDownload /> Exportar Excel
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
                <td colSpan={6} className="p-4 text-center text-gray-400">
                  Nenhum lançamento encontrado para esse filtro.
                </td>
              </tr>
            ) : (
              filtrados.map((l) => (
                <tr
                  key={l.id}
                  className="border-t border-neutral-800 text-center"
                >
                  <td className="p-2 text-gray-200">
                    {new Date(l.data).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="p-2 text-gray-200">{tiposMap[l.tipo]}</td>
                  <td className="p-2 text-gray-300">{l.descricao}</td>
                  <td
                    className={`p-2 font-bold ${l.valor >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    R${" "}
                    {Math.abs(l.valor).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
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
