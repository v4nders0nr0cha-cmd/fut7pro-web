"use client";

import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ConquistasAtleta, TituloAtleta } from "@/types/estatisticas";
import { usePublicAthlete } from "@/hooks/usePublicAthlete";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";
import { usePublicLinks } from "@/hooks/usePublicLinks";

const PERIODOS = [
  { label: "Temporada atual", value: "current" },
  { label: "Todas as temporadas", value: "all" },
];

function filterConquistas(
  conquistas: ConquistasAtleta,
  periodo: string,
  year: number
): ConquistasAtleta {
  if (periodo === "all") return conquistas;
  const filterByYear = (items: TituloAtleta[]) => items.filter((item) => item.ano === year);
  return {
    titulosGrandesTorneios: filterByYear(conquistas.titulosGrandesTorneios),
    titulosAnuais: filterByYear(conquistas.titulosAnuais),
    titulosQuadrimestrais: filterByYear(conquistas.titulosQuadrimestrais),
  };
}

function countTitulos(conquistas: ConquistasAtleta) {
  return (
    conquistas.titulosGrandesTorneios.length +
    conquistas.titulosAnuais.length +
    conquistas.titulosQuadrimestrais.length
  );
}

function resolveIcon(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "trophy") return "TROF";
  if (normalized === "medal") return "MED";
  if (normalized === "ball") return "BOLA";
  return value;
}

function ConquistasColuna({
  titulo,
  nome,
  total,
  conquistas,
  categorias,
  loading,
  error,
  temAtleta,
}: {
  titulo: string;
  nome: string;
  total: number;
  conquistas: ConquistasAtleta;
  categorias: { label: string; key: keyof ConquistasAtleta }[];
  loading: boolean;
  error: boolean;
  temAtleta: boolean;
}) {
  return (
    <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400">{titulo}</p>
          <p className="text-lg font-bold text-yellow-400">{nome || "-"}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Total titulos</p>
          <p className="text-lg font-bold text-white">{temAtleta ? total : "-"}</p>
        </div>
      </div>

      {!temAtleta && <p className="text-xs text-gray-500">Selecione um atleta.</p>}
      {temAtleta && loading && <p className="text-xs text-gray-500">Carregando conquistas...</p>}
      {temAtleta && error && !loading && (
        <p className="text-xs text-red-300">Erro ao carregar conquistas.</p>
      )}
      {temAtleta &&
        !loading &&
        !error &&
        categorias.map((categoria) => {
          const lista = conquistas[categoria.key];
          return (
            <div key={categoria.key} className="mb-4">
              <p className="text-xs uppercase text-gray-400">{categoria.label}</p>
              {lista.length === 0 ? (
                <p className="text-xs text-gray-500 mt-1">Sem titulos nesta categoria.</p>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {lista.map((item, idx) => (
                    <span
                      key={`${item.descricao}-${item.ano}-${idx}`}
                      className="bg-neutral-900 rounded-lg px-2 py-1 text-xs text-yellow-100 flex items-center gap-2"
                      title={`${item.descricao} - ${item.ano}`}
                    >
                      <span className="text-[10px] text-yellow-400">{resolveIcon(item.icone)}</span>
                      <span>
                        {item.descricao} <span className="text-gray-400">{item.ano}</span>
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}

export default function TiraTeimaPage() {
  const { publicSlug } = usePublicLinks();
  const searchParams = useSearchParams();
  const currentYear = new Date().getFullYear();
  const [periodo, setPeriodo] = useState("current");
  const { rankings, isLoading, isError } = usePublicPlayerRankings({
    slug: publicSlug,
    type: "geral",
    period: periodo === "all" ? "all" : "year",
    year: periodo === "all" ? undefined : currentYear,
  });
  const [escolhaA, setEscolhaA] = useState<string>("");
  const [escolhaB, setEscolhaB] = useState<string>("");

  useEffect(() => {
    if (!searchParams) return;
    const atleta1 = searchParams.get("atleta1");
    const atleta2 = searchParams.get("atleta2");
    if (atleta1 && !escolhaA) setEscolhaA(atleta1);
    if (atleta2 && !escolhaB) setEscolhaB(atleta2);
  }, [searchParams, escolhaA, escolhaB]);

  const atletasOrdenados = useMemo(
    () => [...rankings].sort((a, b) => a.nome.localeCompare(b.nome)),
    [rankings]
  );

  const atletaA = atletasOrdenados.find((a) => a.slug === escolhaA || a.id === escolhaA);
  const atletaB = atletasOrdenados.find((a) => a.slug === escolhaB || a.id === escolhaB);

  const athleteSlugA = atletaA?.slug?.trim() || atletaA?.id;
  const athleteSlugB = atletaB?.slug?.trim() || atletaB?.id;

  const {
    conquistas: conquistasA,
    isLoading: conquistasLoadingA,
    isError: conquistasErrorA,
  } = usePublicAthlete({
    tenantSlug: publicSlug,
    athleteSlug: athleteSlugA,
    enabled: Boolean(athleteSlugA),
  });
  const {
    conquistas: conquistasB,
    isLoading: conquistasLoadingB,
    isError: conquistasErrorB,
  } = usePublicAthlete({
    tenantSlug: publicSlug,
    athleteSlug: athleteSlugB,
    enabled: Boolean(athleteSlugB),
  });

  const conquistasFiltradasA = useMemo(
    () => filterConquistas(conquistasA, periodo, currentYear),
    [conquistasA, periodo, currentYear]
  );
  const conquistasFiltradasB = useMemo(
    () => filterConquistas(conquistasB, periodo, currentYear),
    [conquistasB, periodo, currentYear]
  );

  const totalTitulosA = countTitulos(conquistasFiltradasA);
  const totalTitulosB = countTitulos(conquistasFiltradasB);
  const nomeA = atletaA?.nome || "Atleta A";
  const nomeB = atletaB?.nome || "Atleta B";
  const vencedorConquistas =
    totalTitulosA === totalTitulosB ? "Empate" : totalTitulosA > totalTitulosB ? nomeA : nomeB;

  const comparaveis = [
    { label: "Jogos", a: atletaA?.jogos, b: atletaB?.jogos },
    { label: "Gols", a: atletaA?.gols, b: atletaB?.gols },
    { label: "Assistências", a: atletaA?.assistencias, b: atletaB?.assistencias },
    { label: "Vitórias", a: atletaA?.vitorias, b: atletaB?.vitorias },
    { label: "Derrotas", a: atletaA?.derrotas, b: atletaB?.derrotas },
    { label: "Pontos", a: atletaA?.pontos, b: atletaB?.pontos },
  ];

  const conquistasCategorias = [
    { label: "Grandes torneios (equipe)", key: "titulosGrandesTorneios" as const },
    { label: "Titulos anuais (individual)", key: "titulosAnuais" as const },
    { label: "Titulos quadrimestrais (individual)", key: "titulosQuadrimestrais" as const },
  ];

  return (
    <>
      <Head>
        <title>Tira Teima | Compare Atletas | Fut7Pro</title>
        <meta
          name="description"
          content="Compare estatísticas de dois atletas do seu racha em tempo real: jogos, gols, assistências e pontos."
        />
      </Head>
      <main className="max-w-5xl mx-auto px-2 py-10">
        <h1 className="text-3xl font-bold text-yellow-400 mb-2 text-center">Tira Teima</h1>
        <p className="text-center text-gray-300 mb-6">
          Selecione dois atletas para comparar estatísticas oficiais do seu racha.
        </p>

        {isLoading && <div className="text-center text-gray-300">Carregando atletas...</div>}
        {isError && (
          <div className="text-center text-red-300">Falha ao carregar atletas para comparação.</div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Atleta A</label>
                <select
                  value={escolhaA}
                  onChange={(e) => setEscolhaA(e.target.value)}
                  className="w-full bg-neutral-800 text-white rounded px-3 py-2 border border-neutral-700"
                >
                  <option value="">Selecione</option>
                  {atletasOrdenados.map((a) => (
                    <option key={a.slug} value={a.slug}>
                      {a.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Atleta B</label>
                <select
                  value={escolhaB}
                  onChange={(e) => setEscolhaB(e.target.value)}
                  className="w-full bg-neutral-800 text-white rounded px-3 py-2 border border-neutral-700"
                >
                  <option value="">Selecione</option>
                  {atletasOrdenados.map((a) => (
                    <option key={a.slug} value={a.slug}>
                      {a.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Periodo</label>
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="w-full bg-neutral-800 text-white rounded px-3 py-2 border border-neutral-700"
                >
                  {PERIODOS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(atletaA || atletaB) && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-400">Atleta A</p>
                    <p className="text-xl font-bold text-yellow-400">{atletaA?.nome || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Atleta B</p>
                    <p className="text-xl font-bold text-yellow-400">{atletaB?.nome || "-"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-200">
                  {comparaveis.map((item) => (
                    <div
                      key={item.label}
                      className="bg-neutral-800 rounded-lg p-3 border border-neutral-700"
                    >
                      <p className="text-gray-400 text-xs">{item.label}</p>
                      <div className="flex justify-between text-lg font-bold mt-1">
                        <span>{item.a ?? "-"}</span>
                        <span className="text-yellow-400">vs</span>
                        <span>{item.b ?? "-"}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 border-t border-neutral-800 pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                    <h2 className="text-lg font-bold text-yellow-400">Minhas Conquistas</h2>
                    <span className="text-xs text-gray-400">
                      Periodo: {periodo === "all" ? "Todas as temporadas" : "Temporada atual"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ConquistasColuna
                      titulo="Atleta A"
                      nome={nomeA}
                      total={totalTitulosA}
                      conquistas={conquistasFiltradasA}
                      categorias={conquistasCategorias}
                      loading={conquistasLoadingA}
                      error={conquistasErrorA}
                      temAtleta={Boolean(atletaA)}
                    />
                    <ConquistasColuna
                      titulo="Atleta B"
                      nome={nomeB}
                      total={totalTitulosB}
                      conquistas={conquistasFiltradasB}
                      categorias={conquistasCategorias}
                      loading={conquistasLoadingB}
                      error={conquistasErrorB}
                      temAtleta={Boolean(atletaB)}
                    />
                  </div>

                  <div className="mt-4 text-center text-xs text-gray-400">
                    {totalTitulosA === 0 && totalTitulosB === 0
                      ? "Sem conquistas registradas para o periodo."
                      : `Mais titulos: ${vencedorConquistas}`}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
