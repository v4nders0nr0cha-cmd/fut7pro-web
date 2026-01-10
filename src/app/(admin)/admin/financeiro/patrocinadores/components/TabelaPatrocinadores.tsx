"use client";

import Image from "next/image";
import type { Patrocinador } from "@/types/financeiro";
import { FaEdit, FaTrash, FaGlobe, FaEye, FaEyeSlash, FaPlus } from "react-icons/fa";

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
  const slots = Array.from({ length: 10 }, (_, index) => {
    const order = index + 1;
    const sponsor = patrocinadores.find((item) => item.displayOrder === order);
    return { order, sponsor };
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
      {slots.map(({ order, sponsor }) =>
        sponsor ? (
          <div
            key={sponsor.id}
            className="bg-[#232323] rounded-xl shadow p-4 flex flex-col gap-2 items-start relative hover:shadow-lg transition min-h-[320px] h-full"
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
                <div className="font-bold text-yellow-300 text-base truncate">{sponsor.nome}</div>
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
              <span className="bg-gray-800 text-xs text-gray-300 px-2 py-1 rounded">
                {sponsor.periodoInicio && sponsor.periodoFim
                  ? `${new Date(sponsor.periodoInicio).toLocaleDateString()} ~ ${new Date(
                      sponsor.periodoFim
                    ).toLocaleDateString()}`
                  : "Periodo nao informado"}
              </span>
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
                    WebkitLineClamp: 4,
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
        ) : (
          <button
            key={`adicionar-${order}`}
            type="button"
            onClick={() => onNovo(order)}
            className="flex flex-col justify-center items-center gap-2 border-2 border-dashed border-yellow-500 rounded-xl min-h-[320px] bg-[#181818] hover:bg-[#232323] hover:shadow-lg transition group w-full h-full"
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
