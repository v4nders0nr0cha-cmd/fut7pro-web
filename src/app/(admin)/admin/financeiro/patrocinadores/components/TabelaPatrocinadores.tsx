"use client";

import Image from "next/image";
import { FaEdit, FaTrash, FaGlobe, FaEye, FaEyeSlash, FaPlus, FaLayerGroup } from "react-icons/fa";
import type { Patrocinador } from "@/types/patrocinador";

interface Props {
  patrocinadores: Patrocinador[];
  onEditar: (p: Patrocinador) => void;
  onExcluir: (id: string) => void;
  onToggleFooter: (id: string, show: boolean) => void;
  onNovo: () => void;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

function formatValor(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return currencyFormatter.format(value);
}

function formatPeriodo(start?: string | null, end?: string | null) {
  const inicio = start ? new Date(start).toLocaleDateString("pt-BR") : "sem data";
  const fim = end ? new Date(end).toLocaleDateString("pt-BR") : "sem data";
  return `${inicio} ~ ${fim}`;
}

function statusBadge(status?: string | null) {
  switch (status) {
    case "expirado":
      return "bg-red-900/60 text-red-300 border border-red-700/60";
    case "em_breve":
      return "bg-blue-900/40 text-blue-200 border border-blue-600/40";
    default:
      return "bg-green-900/40 text-green-200 border border-green-600/40";
  }
}

export default function TabelaPatrocinadores({
  patrocinadores,
  onEditar,
  onExcluir,
  onToggleFooter,
  onNovo,
}: Props) {
  const cards = [...patrocinadores];
  while (cards.length < 10) {
    cards.push(undefined as unknown as Patrocinador);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
      {cards.map((patro, index) =>
        patro ? (
          <article
            key={patro.id}
            className="bg-[#232323] rounded-xl shadow p-4 flex flex-col gap-3 items-start hover:shadow-lg transition"
          >
            <header className="flex items-center gap-3 w-full">
              <Image
                src={patro.logoUrl}
                alt={`Logo do patrocinador ${patro.name}`}
                width={52}
                height={52}
                className="rounded-lg object-contain border border-gray-700 bg-[#111] w-14 h-14"
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-yellow-300 text-base truncate">{patro.name}</div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <FaLayerGroup className="text-yellow-500" />
                  <span className="uppercase tracking-wide text-yellow-400 text-xs">
                    {patro.tier ?? "BASIC"}
                  </span>
                </div>
              </div>
              <button
                title={
                  patro.showOnFooter ? "Ocultar do site público" : "Exibir no site público (rodapé)"
                }
                onClick={() => onToggleFooter(patro.id, !patro.showOnFooter)}
                className={`ml-2 ${patro.showOnFooter ? "text-green-500" : "text-gray-600"} hover:text-yellow-400`}
              >
                {patro.showOnFooter ? <FaEye /> : <FaEyeSlash />}
              </button>
            </header>

            <section className="flex flex-col gap-2 text-sm text-gray-300 w-full">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${statusBadge(patro.status)}`}
                >
                  {(patro.status ?? "ativo").replace("_", " ")}
                </span>
                <span className="text-xs text-gray-400">
                  {formatPeriodo(patro.periodStart, patro.periodEnd)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs uppercase text-gray-400">Valor</span>
                <span className="font-semibold text-green-300">{formatValor(patro.value)}</span>
              </div>
              {patro.benefit && (
                <p className="text-xs text-gray-300 leading-relaxed">
                  Benefício: <span className="text-gray-100">{patro.benefit}</span>
                </p>
              )}
              {patro.about && (
                <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">{patro.about}</p>
              )}
              {patro.link && (
                <a
                  href={patro.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  <FaGlobe /> Site / landing do patrocinador
                </a>
              )}
            </section>

            <footer className="flex gap-3 mt-auto w-full justify-end pt-2">
              <button
                onClick={() => onEditar(patro)}
                title="Editar patrocinador"
                className="text-yellow-400 hover:text-yellow-300"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => onExcluir(patro.id)}
                title="Excluir patrocinador"
                className="text-red-400 hover:text-red-300"
              >
                <FaTrash />
              </button>
            </footer>
          </article>
        ) : (
          <button
            key={`placeholder-${index}`}
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
