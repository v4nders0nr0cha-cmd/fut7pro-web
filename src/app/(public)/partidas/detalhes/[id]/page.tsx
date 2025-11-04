"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { usePartidas } from "@/hooks/usePartidas";
import type { Partida } from "@/types/partida";

export default function PartidaDetalhesPage() {
  const params = useParams();
  const { getPartidaById, isLoading, isError, error } = usePartidas();
  const [partida, setPartida] = useState<Partida | null>(null);

  useEffect(() => {
    if (params.id && typeof params.id === "string") {
      const found = getPartidaById(params.id);
      setPartida(found ?? null);
    }
  }, [params.id, getPartidaById]);

  if (isLoading) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <span className="ml-4 text-lg text-textoSuave">Carregando detalhes da partida...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Erro ao carregar partida</h1>
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!partida) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-yellow-400 mb-2">Partida nao encontrada</h1>
          <p className="text-yellow-300">
            A partida solicitada nao foi localizada. Verifique o link e tente novamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
      <div className="bg-[#1A1A1A] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold text-yellow-400 mb-4">Detalhes da Partida</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Informacoes Gerais</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Data:</span> {new Date(partida.data).toLocaleString("pt-BR")}
              </p>
              <p>
                <span className="font-semibold">Horario:</span> {partida.horario ?? "-"}
              </p>
              <p>
                <span className="font-semibold">Local:</span> {partida.local ?? "Nao informado"}
              </p>
              <p>
                <span className="font-semibold">Status:</span> {partida.finalizada ? "Concluida" : "Em andamento"}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Placar</h2>
            <div className="flex items-center justify-center gap-6 text-2xl font-bold">
              <div className="flex flex-col items-center gap-2 min-w-[120px]">
                <img
                  src={partida.logoCasa}
                  alt={`Logo ${partida.timeA}`}
                  className="w-14 h-14 rounded-lg object-cover border-2 border-yellow-400/40"
                />
                <p className="text-lg">{partida.timeA}</p>
                <p className="text-4xl">{partida.golsTimeA ?? "-"}</p>
              </div>
              <span className="text-yellow-400">x</span>
              <div className="flex flex-col items-center gap-2 min-w-[120px]">
                <img
                  src={partida.logoFora}
                  alt={`Logo ${partida.timeB}`}
                  className="w-14 h-14 rounded-lg object-cover border-2 border-yellow-400/40"
                />
                <p className="text-4xl">{partida.golsTimeB ?? "-"}</p>
                <p className="text-lg">{partida.timeB}</p>
              </div>
            </div>
          </div>
        </div>

        {partida.gols.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Gols registrados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partida.gols.map((gol) => (
                <div key={gol.id} className="bg-[#232323] rounded-lg p-3">
                  <p className="font-semibold">{gol.jogador}</p>
                  <p className="text-sm text-gray-400">
                    Time {gol.time} • {gol.quantidade} gol(s)
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {partida.assistencias.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Assistencias</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partida.assistencias.map((assistencia) => (
                <div key={assistencia.id} className="bg-[#232323] rounded-lg p-3">
                  <p className="font-semibold">{assistencia.jogador}</p>
                  <p className="text-sm text-gray-400">
                    Time {assistencia.time} • {assistencia.quantidade} passe(s)
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
