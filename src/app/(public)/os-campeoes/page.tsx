"use client";

import { Trophy } from "lucide-react";
import { useCampeoes } from "@/hooks/useCampeoes";
import { usePartidas } from "@/hooks/usePartidas";

export default function CampeoesPage() {
  const {
    campeoes,
    isLoading: isLoadingCampeoes,
    isError: isErrorCampeoes,
    error: errorCampeoes,
  } = useCampeoes();
  const {
    partidas,
    isLoading: isLoadingPartidas,
    isError: isErrorPartidas,
    error: errorPartidas,
  } = usePartidas();

  const isLoading = isLoadingCampeoes || isLoadingPartidas;
  const isError = isErrorCampeoes || isErrorPartidas;
  const error = errorCampeoes || errorPartidas;

  if (isLoading) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <span className="ml-4 text-lg text-textoSuave">Carregando campeoes...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Erro ao carregar campeoes</h1>
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-1 pt-[40px] pb-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-yellow-400 mb-2">🏆 Os Campeoes</h1>
        <p className="text-textoSuave">Celebre os grandes momentos e conquistas do seu racha</p>
      </div>

      {campeoes.length === 0 ? (
        <div className="bg-[#1A1A1A] rounded-2xl p-8 text-center">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Nenhum campeao registrado</h2>
          <p className="text-textoSuave">Ainda nao ha campeoes registrados no sistema.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campeoes.map((campeao) => (
            <div
              key={campeao.id}
              className="bg-[#1A1A1A] rounded-2xl p-6 text-white hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-center mb-4">
                <Trophy className="w-12 h-12 text-yellow-400" />
              </div>

              <h3 className="text-xl font-bold text-center mb-2">{campeao.nome}</h3>

              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">Categoria:</span> {campeao.categoria}
                </p>
                <p>
                  <span className="font-semibold">Data:</span> {campeao.data}
                </p>
                {campeao.descricao && (
                  <p>
                    <span className="font-semibold">Descricao:</span> {campeao.descricao}
                  </p>
                )}
              </div>

              {campeao.jogadores && campeao.jogadores.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-yellow-400 mb-2">Jogadores:</h4>
                  <div className="flex flex-wrap gap-1">
                    {campeao.jogadores.map((jogador, index) => (
                      <span key={index} className="bg-[#232323] px-2 py-1 rounded text-xs">
                        {jogador}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {partidas.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center">Ultimas Partidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partidas.slice(0, 6).map((partida) => (
              <div key={partida.id} className="bg-[#1A1A1A] rounded-xl p-4 text-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-textoSuave">
                    {new Date(partida.data).toLocaleDateString("pt-BR")}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      partida.finalizada ? "bg-green-600" : "bg-yellow-600"
                    }`}
                  >
                    {partida.finalizada ? "Concluida" : "Em andamento"}
                  </span>
                </div>

                <div className="flex items-center justify-center space-x-4 text-lg font-bold">
                  <span>{partida.timeA}</span>
                  <span className="text-yellow-400">
                    {partida.golsTimeA ?? "-"} x {partida.golsTimeB ?? "-"}
                  </span>
                  <span>{partida.timeB}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
