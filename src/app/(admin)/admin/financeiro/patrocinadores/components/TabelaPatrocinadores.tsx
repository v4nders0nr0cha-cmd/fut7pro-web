"use client";

import Image from "next/image";
import type { Patrocinador } from "@/types/financeiro";
import { FaEdit, FaTrash, FaGlobe, FaEye, FaEyeSlash, FaPlus } from "react-icons/fa";

const PLAN_LABELS: Record<string, string> = {
  MENSAL: "Mensal",
  QUADRIMESTRAL: "Quadrimestral",
  ANUAL: "Anual",
};
const MS_PER_DAY = 24 * 60 * 60 * 1000;

interface Props {
  patrocinadores: Patrocinador[];
  onEditar: (p: Patrocinador) => void;
  onExcluir: (id: string) => void;
  onToggleVisivel: (id: string) => void;
  onNovo: (slot: number) => void;
}

export default function TabelaPatrocinadores({
  patrocinadores,
  onEditar,
  onExcluir,
  onToggleVisivel,
  onNovo,
}: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const slots = Array.from({ length: 10 }, (_, index) => {
    const order = index + 1;
    const sponsor = patrocinadores.find((item) => item.displayOrder === order);
    return { order, sponsor };
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
      {slots.map(({ order, sponsor }) =>
        sponsor ? (
          (() => {
            const endDate = sponsor.periodoFim ? new Date(sponsor.periodoFim) : null;
            const startDate = sponsor.periodoInicio ? new Date(sponsor.periodoInicio) : null;
            const planLabel = PLAN_LABELS[sponsor.billingPlan || "MENSAL"] || "Mensal";
            const endLabel =
              endDate && !Number.isNaN(endDate.getTime()) ? endDate.toLocaleDateString() : null;
            let diasParaFim: number | null = null;
            let expirado = false;

            if (endDate && !Number.isNaN(endDate.getTime())) {
              endDate.setHours(0, 0, 0, 0);
              const diff = Math.ceil((endDate.getTime() - today.getTime()) / MS_PER_DAY);
              if (diff < 0) {
                expirado = true;
                diasParaFim = Math.abs(diff);
              } else {
                diasParaFim = diff;
              }
            }

            return (
              <div
                key={sponsor.id}
                className={`bg-[#232323] rounded-xl shadow p-4 flex flex-col gap-2 items-start relative hover:shadow-lg transition h-[320px] overflow-hidden border border-transparent ${
                  expirado ? "border-red-500/50" : ""
                }`}
              >
                <span className="text-xs text-gray-500 font-semibold">
                  Patrocinador {String(order).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-3 w-full">
                  <Image
                    src={sponsor.logo}
                    alt={`Logo do patrocinador ${sponsor.nome} - Fut7, sistema de futebol, racha`}
                    width={48}
                    height={48}
                    className="rounded-lg object-contain border border-gray-700 bg-[#111]"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-yellow-300 text-base truncate">
                      {sponsor.nome}
                    </div>
                    <div className="text-xs text-gray-400">
                      Valor:{" "}
                      <span className="font-semibold text-green-400">
                        R$ {sponsor.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <button
                    title={sponsor.visivel ? "Ocultar do site publico" : "Exibir no site publico"}
                    onClick={() => onToggleVisivel(sponsor.id)}
                    className={`ml-2 ${sponsor.visivel ? "text-green-500" : "text-gray-600"} hover:text-yellow-400`}
                  >
                    {sponsor.visivel ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-gray-900 text-xs text-gray-200 px-2 py-1 rounded">
                    {sponsor.status.toUpperCase()}
                  </span>
                  <span className="bg-gray-800 text-xs text-gray-200 px-2 py-1 rounded">
                    {planLabel}
                  </span>
                  <span className="bg-gray-800 text-xs text-gray-300 px-2 py-1 rounded">
                    {startDate && endDate && !Number.isNaN(startDate.getTime()) && endLabel
                      ? `${startDate.toLocaleDateString()} ~ ${endLabel}`
                      : "Periodo nao informado"}
                  </span>
                  {endLabel && diasParaFim !== null && (
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        expirado ? "bg-red-500/20 text-red-300" : "bg-gray-900 text-gray-200"
                      }`}
                    >
                      {expirado
                        ? `Expirado ha ${diasParaFim} dia(s)`
                        : `Faltam ${diasParaFim} dia(s)`}
                    </span>
                  )}
                  {expirado && (
                    <span className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded">
                      EXPIRADO
                    </span>
                  )}
                  {sponsor.link && (
                    <a
                      href={sponsor.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-400 hover:underline"
                      title="Visitar site do patrocinador"
                    >
                      <FaGlobe className="inline" />
                    </a>
                  )}
                </div>
                <div className="flex-1 w-full">
                  {sponsor.descricao && (
                    <div
                      className="mt-2 text-sm text-gray-300 overflow-hidden"
                      style={{
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 3,
                      }}
                    >
                      {sponsor.descricao}
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-2 w-full justify-end">
                  <button
                    onClick={() => onEditar(sponsor)}
                    title="Editar"
                    className="text-yellow-400 hover:text-yellow-300"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => onExcluir(sponsor.id)}
                    title="Excluir"
                    className="text-red-400 hover:text-red-300"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            );
          })()
        ) : (
          <button
            key={`adicionar-${order}`}
            type="button"
            onClick={() => onNovo(order)}
            className="flex flex-col justify-center items-center gap-2 border-2 border-dashed border-yellow-500 rounded-xl h-[320px] bg-[#181818] hover:bg-[#232323] hover:shadow-lg transition group w-full"
            aria-label={`Adicionar patrocinador (${String(order).padStart(2, "0")})`}
          >
            <FaPlus size={32} className="text-yellow-400 group-hover:text-yellow-300" />
            <span className="font-semibold text-yellow-300 text-base group-hover:text-yellow-200">
              Adicionar Patrocinador ({String(order).padStart(2, "0")})
            </span>
            <span className="text-xs text-gray-400">(max. 10 patrocinadores)</span>
          </button>
        )
      )}
    </div>
  );
}
