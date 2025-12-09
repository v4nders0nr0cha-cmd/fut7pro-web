"use client";

import Head from "next/head";
import { useMemo, useState } from "react";
import { usePublicPlayerRankings } from "@/hooks/usePublicPlayerRankings";

export default function TiraTeimaPage() {
  const { rankings, isLoading, isError } = usePublicPlayerRankings({
    type: "geral",
    period: "all",
    limit: 200,
  });
  const [escolhaA, setEscolhaA] = useState<string>("");
  const [escolhaB, setEscolhaB] = useState<string>("");

  const atletasOrdenados = useMemo(
    () => [...rankings].sort((a, b) => a.nome.localeCompare(b.nome)),
    [rankings]
  );

  const atletaA = atletasOrdenados.find((a) => a.slug === escolhaA);
  const atletaB = atletasOrdenados.find((a) => a.slug === escolhaB);

  const comparaveis = [
    { label: "Jogos", a: atletaA?.jogos, b: atletaB?.jogos },
    { label: "Gols", a: atletaA?.gols, b: atletaB?.gols },
    { label: "Assistências", a: atletaA?.assistencias, b: atletaB?.assistencias },
    { label: "Vitórias", a: atletaA?.vitorias, b: atletaB?.vitorias },
    { label: "Derrotas", a: atletaA?.derrotas, b: atletaB?.derrotas },
    { label: "Pontos", a: atletaA?.pontos, b: atletaB?.pontos },
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
