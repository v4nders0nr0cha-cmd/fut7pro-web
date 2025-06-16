"use client";

import { useState } from "react";
import SeletorAno from "@/components/cards/SeletorAno";
import CampeaoAnoCard from "@/components/cards/CampeaoAnoCard";
import CampeaoPosicaoCard from "@/components/cards/CampeaoPosicaoCard";
import QuadrimestreGrid from "@/components/cards/QuadrimestreGrid";
import { campeoesAno } from "@/components/lists/mockCampeoesAno";
import { melhoresPorPosicao } from "@/components/lists/mockMelhoresPorPosicao";
import { quadrimestres } from "@/components/lists/mockQuadrimestres";
import type { QuadrimestresAno } from "@/types/estatisticas";

export default function ClientWrapper() {
  const anosDisponiveis = [2025, 2024, 2023];
  const [anoSelecionado, setAnoSelecionado] = useState<number>(2025);

  const dadosQuadrimestre: QuadrimestresAno | undefined =
    quadrimestres[anoSelecionado as keyof typeof quadrimestres];

  return (
    <div className="min-h-screen bg-fundo text-white px-4 pt-4 pb-10">
      {/* Título e Descrição Centralizados */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-yellow-400 mb-2">Os Campeões do Racha</h1>
        <p className="text-gray-300 max-w-2xl mx-auto mb-4">
          Conheça os destaques do ano, melhores por posição e os campeões de cada quadrimestre.
          Dados atualizados automaticamente direto das partidas.
        </p>

        <div className="inline-block">
          <SeletorAno
            anosDisponiveis={anosDisponiveis}
            anoSelecionado={anoSelecionado}
            onChange={setAnoSelecionado}
          />
        </div>
      </div>

      {/* Campeões do Ano */}
      <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">Campeões do Ano</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8 justify-center">
        {campeoesAno.map((item, idx) => (
          <CampeaoAnoCard key={idx} {...item} />
        ))}
      </div>

      {/* Melhores por posição */}
      <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">Melhores por Posição</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8 justify-center">
        {melhoresPorPosicao.map((item, idx) => (
          <CampeaoPosicaoCard key={idx} {...item} />
        ))}
      </div>

      {/* Campeões por Quadrimestre */}
      <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
        Campeões por Quadrimestre
      </h2>
      {dadosQuadrimestre && <QuadrimestreGrid dados={dadosQuadrimestre} />}
    </div>
  );
}
