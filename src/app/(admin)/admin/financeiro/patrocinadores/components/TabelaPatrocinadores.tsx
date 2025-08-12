"use client";
import Image from "next/image";
import type { Patrocinador } from "@/types/financeiro";
import { FaEdit, FaTrash, FaGlobe, FaEye, FaEyeSlash, FaPlus } from "react-icons/fa";

interface Props {
  patrocinadores: Patrocinador[];
  onEditar: (p: Patrocinador) => void;
  onExcluir: (id: string) => void;
  onToggleVisivel: (id: string) => void;
  onNovo: () => void;
}

export default function TabelaPatrocinadores({
  patrocinadores,
  onEditar,
  onExcluir,
  onToggleVisivel,
  onNovo,
}: Props) {
  // Garante exatamente 10 posições
  const cards = [...patrocinadores];
  while (cards.length < 10) cards.push(undefined as any);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
      {cards.map((p, i) =>
        p ? (
          <div
            key={p.id}
            className="bg-[#232323] rounded-xl shadow p-4 flex flex-col gap-2 items-start relative hover:shadow-lg transition"
          >
            <div className="flex items-center gap-3 w-full">
              <Image
                src={p.logo}
                alt={`Logo do patrocinador ${p.nome} - Fut7, sistema de futebol, racha`}
                width={48}
                height={48}
                className="rounded-lg object-contain border border-gray-700 bg-[#111]"
              />
              <div className="flex-1">
                <div className="font-bold text-yellow-300 text-base truncate">{p.nome}</div>
                <div className="text-xs text-gray-400">
                  Valor:{" "}
                  <span className="font-semibold text-green-400">
                    R$ {p.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <button
                title={p.visivel ? "Ocultar do site público" : "Exibir no site público"}
                onClick={() => onToggleVisivel(p.id)}
                className={`ml-2 ${p.visivel ? "text-green-500" : "text-gray-600"} hover:text-yellow-400`}
              >
                {p.visivel ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-gray-900 text-xs text-gray-200 px-2 py-1 rounded">
                {p.status.toUpperCase()}
              </span>
              <span className="bg-gray-800 text-xs text-gray-300 px-2 py-1 rounded">
                {new Date(p.periodoInicio).toLocaleDateString()} ~{" "}
                {new Date(p.periodoFim).toLocaleDateString()}
              </span>
              {p.link && (
                <a
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-400 hover:underline"
                  title="Visitar site do patrocinador"
                >
                  <FaGlobe className="inline" />
                </a>
              )}
            </div>
            {p.descricao && <div className="mt-2 text-sm text-gray-300">{p.descricao}</div>}
            <div className="flex gap-3 mt-2 w-full justify-end">
              <button
                onClick={() => onEditar(p)}
                title="Editar"
                className="text-yellow-400 hover:text-yellow-300"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => onExcluir(p.id)}
                title="Excluir"
                className="text-red-400 hover:text-red-300"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ) : (
          <button
            key={`adicionar-${i}`}
            type="button"
            onClick={onNovo}
            className="flex flex-col justify-center items-center gap-2 border-2 border-dashed border-yellow-500 rounded-xl min-h-[160px] bg-[#181818] hover:bg-[#232323] hover:shadow-lg transition group w-full h-full"
            aria-label="Adicionar novo patrocinador"
          >
            <FaPlus size={32} className="text-yellow-400 group-hover:text-yellow-300" />
            <span className="font-semibold text-yellow-300 text-base group-hover:text-yellow-200">
              Adicionar Patrocinador
            </span>
            <span className="text-xs text-gray-400">(máx. 10 patrocinadores)</span>
          </button>
        )
      )}
    </div>
  );
}
