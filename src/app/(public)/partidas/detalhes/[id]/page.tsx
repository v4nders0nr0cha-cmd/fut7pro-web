"use client";

import { usePartidas } from "@/hooks/usePartidas";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Partida } from "@/types/partida";

export default function PartidaDetalhesPage() {
  const params = useParams();
  const { getPartidaById, isLoading, isError, error } = usePartidas();
  const [partida, setPartida] = useState<Partida | null>(null);

  useEffect(() => {
    if (params.id && typeof params.id === "string") {
      const foundPartida = getPartidaById(params.id);
      setPartida(foundPartida || null);
    }
  }, [params.id, getPartidaById]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-1 pb-10 pt-[40px]">
        <div className="flex items-center justify-center py-16">
          <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <span className="text-textoSuave ml-4 text-lg">
            Carregando detalhes da partida...
          </span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-1 pb-10 pt-[40px]">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6">
          <h1 className="mb-2 text-2xl font-bold text-red-400">
            Erro ao carregar partida
          </h1>
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!partida) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-1 pb-10 pt-[40px]">
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-6">
          <h1 className="mb-2 text-2xl font-bold text-yellow-400">
            Partida não encontrada
          </h1>
          <p className="text-yellow-300">
            A partida solicitada não foi encontrada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-1 pb-10 pt-[40px]">
      <div className="rounded-2xl bg-[#1A1A1A] p-6 text-white">
        <h1 className="mb-4 text-2xl font-bold text-yellow-400">
          Detalhes da Partida
        </h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h2 className="mb-2 text-lg font-semibold">Informações Gerais</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Data:</span> {partida.data}
              </p>
              <p>
                <span className="font-semibold">Horário:</span>{" "}
                {partida.horario}
              </p>
              <p>
                <span className="font-semibold">Local:</span> {partida.local}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                {partida.finalizada ? "Concluída" : "Em andamento"}
              </p>
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold">Placar</h2>
            <div className="flex items-center justify-center space-x-4 text-2xl font-bold">
              <div className="text-center">
                <p className="text-lg">{partida.timeA}</p>
                <p className="text-4xl">{partida.golsTimeA}</p>
              </div>
              <span className="text-yellow-400">x</span>
              <div className="text-center">
                <p className="text-4xl">{partida.golsTimeB}</p>
                <p className="text-lg">{partida.timeB}</p>
              </div>
            </div>
          </div>
        </div>

        {partida.gols && partida.gols.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-lg font-semibold">Gols</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {partida.gols.map((gol, index) => (
                <div key={index} className="rounded-lg bg-[#232323] p-3">
                  <p className="font-semibold">{gol.jogador}</p>
                  <p className="text-sm text-gray-400">Time {gol.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {partida.assistencias && partida.assistencias.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-lg font-semibold">Assistências</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {partida.assistencias.map((assistencia, index) => (
                <div key={index} className="rounded-lg bg-[#232323] p-3">
                  <p className="font-semibold">{assistencia.jogador}</p>
                  <p className="text-sm text-gray-400">
                    Time {assistencia.time}
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
