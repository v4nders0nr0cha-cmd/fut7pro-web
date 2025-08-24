// src/components/cards/ClientWrapper.tsx
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
    <div className="min-h-screen bg-fundo px-4 pb-10 pt-4 text-white">
      {/* Título e Descrição Centralizados */}
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-3xl font-bold text-yellow-400">
          Os Campeões do Racha
        </h1>
        <p className="mx-auto mb-4 max-w-2xl text-gray-300">
          Conheça os destaques do ano, melhores por posição e os campeões de
          cada quadrimestre. Dados atualizados automaticamente direto das
          partidas.
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
      <h2 className="mb-4 text-center text-2xl font-bold text-yellow-400">
        Campeões do Ano
      </h2>
      <div className="mb-8 grid grid-cols-1 justify-center gap-6 sm:grid-cols-2 md:grid-cols-3">
        {campeoesAno.map((item, idx) => (
          <CampeaoAnoCard key={idx} {...item} />
        ))}
      </div>

      {/* Melhores por posição */}
      <h2 className="mb-4 text-center text-2xl font-bold text-yellow-400">
        Melhores por Posição
      </h2>
      <div className="mb-8 grid grid-cols-1 justify-center gap-6 sm:grid-cols-2 md:grid-cols-4">
        {melhoresPorPosicao.map((item, idx) => (
          <CampeaoPosicaoCard key={idx} {...item} />
        ))}
      </div>

      {/* Campeões por Quadrimestre */}
      <h2 className="mb-4 text-center text-2xl font-bold text-yellow-400">
        Campeões por Quadrimestre
      </h2>
      {dadosQuadrimestre && <QuadrimestreGrid dados={dadosQuadrimestre} />}
    </div>
  );
}
