"use client";

import Link from "next/link";
import type { TituloAtleta } from "@/types/estatisticas";

interface Props {
  slug: string;
  titulosGrandesTorneios: TituloAtleta[];
  titulosAnuais: TituloAtleta[];
  titulosQuadrimestrais: TituloAtleta[];
}

export default function ConquistasDoAtleta({
  slug,
  titulosGrandesTorneios,
  titulosAnuais,
  titulosQuadrimestrais,
}: Props) {
  const todasConquistas = [
    ...titulosGrandesTorneios,
    ...titulosAnuais,
    ...titulosQuadrimestrais,
  ];

  const LIMITE_TITULOS = 24;
  const passouDoLimite = todasConquistas.length > LIMITE_TITULOS;

  function distribuiEmLinhas(
    arr: TituloAtleta[],
    colunas = 4,
  ): TituloAtleta[][] {
    const linhas: TituloAtleta[][] = [];
    for (let i = 0; i < arr.length; i += colunas) {
      linhas.push(arr.slice(i, i + colunas));
    }
    return linhas;
  }

  function renderBloco(
    titulo: string,
    conquistas: TituloAtleta[],
    sliceMax = 8,
  ) {
    if (conquistas.length === 0) return null;
    const grupos = distribuiEmLinhas(conquistas.slice(0, sliceMax), 4);

    return (
      <div className="mb-4">
        <h3 className="mb-1 text-lg font-semibold text-yellow-300">{titulo}</h3>
        <div className="flex flex-col gap-1">
          {grupos.map((linha, idx) => (
            <div key={idx} className="mb-1 flex flex-wrap gap-2">
              {linha.map((tituloItem, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 rounded-xl bg-[#222] px-3 py-1 text-sm text-yellow-100"
                  title={`${tituloItem.descricao} - ${tituloItem.ano}`}
                  aria-label={`${tituloItem.descricao} ${tituloItem.ano}`}
                >
                  <span>{tituloItem.icone}</span>
                  <span>
                    {tituloItem.descricao}{" "}
                    <span className="text-xs text-gray-400">
                      {tituloItem.ano}
                    </span>
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto mb-6 w-full max-w-4xl">
      <h2 className="mb-2 flex items-center justify-center gap-2 text-center text-2xl font-bold text-yellow-400">
        <span className="inline-block">🏅</span>
        Minhas Conquistas
      </h2>

      {renderBloco("Títulos (Grandes Torneios)", titulosGrandesTorneios)}
      {renderBloco("Títulos Anuais", titulosAnuais)}
      {renderBloco("Títulos Quadrimestrais", titulosQuadrimestrais)}

      {passouDoLimite && (
        <div className="mt-2 text-center">
          <Link
            href={`/atletas/${slug}/conquistas`}
            className="font-semibold text-yellow-400 hover:underline"
          >
            Ver todas as conquistas &rarr;
          </Link>
        </div>
      )}
    </section>
  );
}
