"use client";

import { usePartidas } from "@/hooks/usePartidas";

export default function HistoricoPartidas() {
  const { partidas, isLoading, isError, error } = usePartidas();

  if (isLoading) {
    return <div className="text-white">Carregando partidas...</div>;
  }

  if (isError) {
    return <div className="text-red-400">Erro ao carregar partidas: {String(error)}</div>;
  }

  return (
    <div className="space-y-3">
      {partidas.map((partida) => (
        <div key={partida.id} className="bg-[#1a1a1a] text-white rounded-md p-3">
          <div className="text-sm text-gray-400">{partida.data}</div>
          <div className="font-semibold">
            {partida.timeA} {partida.golsTimeA} x {partida.golsTimeB} {partida.timeB}
          </div>
        </div>
      ))}
    </div>
  );
}
