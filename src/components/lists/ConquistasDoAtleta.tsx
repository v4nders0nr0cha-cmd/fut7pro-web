"use client";

import { campeoesAno } from "@/components/lists/mockCampeoesAno";
import { melhoresPorPosicao } from "@/components/lists/mockMelhoresPorPosicao";
import { quadrimestres } from "@/components/lists/mockQuadrimestres";
import { torneiosMock } from "@/components/lists/mockTorneios";
import Image from "next/image";
import Link from "next/link";

interface Props {
  slug: string;
}

export default function ConquistasDoAtleta({ slug }: Props) {
  // Busca automática dos títulos de grandes torneios
  const grandesTorneios = torneiosMock.filter((torneio) =>
    torneio.jogadores.includes(slug),
  );

  const conquistasAnuais = [...campeoesAno, ...melhoresPorPosicao].filter(
    (item) => item.slug === slug,
  );

  const conquistasQuadrimestre: {
    titulo: string;
    periodo: string;
    ano: number;
  }[] = [];

  Object.entries(quadrimestres).forEach(([ano, dados]) => {
    Object.entries(dados).forEach(([periodo, lista]) => {
      lista.forEach((item) => {
        if (item.slug === slug) {
          conquistasQuadrimestre.push({
            titulo: item.titulo,
            periodo,
            ano: Number(ano),
          });
        }
      });
    });
  });

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-center text-xl font-bold text-yellow-400">
        🏅 Minhas Conquistas
      </h2>

      {/* 01 - Grandes Torneios com link */}
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold text-white">
          🏆 Títulos (Grandes Torneios)
        </h3>
        {grandesTorneios.length === 0 ? (
          <p className="text-sm italic text-gray-400">
            Nenhum título de torneio registrado.
          </p>
        ) : (
          <ul className="space-y-2">
            {grandesTorneios.map((torneio, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <Link
                  href={`/grandes-torneios/${torneio.slug}`}
                  className="text-sm font-semibold text-yellow-400 hover:underline"
                  title={`Ver detalhes do torneio ${torneio.nome}`}
                >
                  {torneio.nome}
                </Link>
                <span className="text-sm text-white">- {torneio.ano}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 02 - Títulos Anuais */}
      {conquistasAnuais.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-2 text-lg font-semibold text-white">
            🥇 Títulos Anuais
          </h3>
          <ul className="space-y-2">
            {conquistasAnuais.map((item, index) => {
              const titulo = "titulo" in item ? item.titulo : item.posicao;
              const ano = item.ano;
              const isArtilheiro = titulo === "Artilheiro do Ano";
              return (
                <li key={index} className="flex items-center gap-2">
                  {isArtilheiro ? (
                    <Image
                      src="/images/icons/bola-de-ouro.png"
                      alt="Ícone Bola de Ouro"
                      width={20}
                      height={20}
                      className="inline-block"
                    />
                  ) : (
                    <span className="text-xl">🏆</span>
                  )}
                  <span
                    className="text-sm text-white"
                    title={`${titulo} conquistado em ${ano}`}
                  >
                    {titulo} - {ano}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 03 - Títulos Quadrimestrais */}
      {conquistasQuadrimestre.length > 0 && (
        <div>
          <h3 className="mb-2 text-lg font-semibold text-white">
            ⚽ Títulos Quadrimestrais
          </h3>
          <ul className="space-y-2">
            {conquistasQuadrimestre.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                {item.titulo === "Artilheiro" ? (
                  <Image
                    src="/images/icons/bola-de-prata.png"
                    alt="Ícone Bola de Prata"
                    width={18}
                    height={18}
                    className="inline-block"
                  />
                ) : (
                  <span className="text-xl">🥈</span>
                )}
                <span
                  className="text-sm text-white"
                  title={`${item.titulo} - ${item.periodo} ${item.ano}`}
                >
                  {item.titulo} - {item.periodo} {item.ano}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
