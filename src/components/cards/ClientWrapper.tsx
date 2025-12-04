// src/components/cards/ClientWrapper.tsx
"use client";

import { useState } from "react";
import SeletorAno from "@/components/cards/SeletorAno";
import CampeaoAnoCard from "@/components/cards/CampeaoAnoCard";
import CampeaoPosicaoCard from "@/components/cards/CampeaoPosicaoCard";
import { campeoesAno } from "@/components/lists/mockCampeoesAno";
import { melhoresPorPosicao } from "@/components/lists/mockMelhoresPorPosicao";

export default function ClientWrapper() {
  const anosDisponiveis = [2025, 2024, 2023];
  const [anoSelecionado, setAnoSelecionado] = useState<number>(2025);

  const campeoesFiltrados = campeoesAno.filter((c) => c.ano === anoSelecionado);
  const melhoresFiltrados = melhoresPorPosicao.filter((c) => c.ano === anoSelecionado);

  return (
    <div className="min-h-screen bg-fundo text-white px-4 pt-4 pb-10">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-yellow-400 mb-2">Os Campeões do Racha</h1>
        <p className="text-gray-300 max-w-2xl mx-auto mb-4">
          Conheça os destaques do ano e os melhores por posição. Dados prontos para serem trocados
          para a API real assim que o backend estiver disponível.
        </p>

        <div className="inline-block">
          <SeletorAno
            anosDisponiveis={anosDisponiveis}
            anoSelecionado={anoSelecionado}
            onChange={setAnoSelecionado}
          />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">Campeões do Ano</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8 justify-center">
        {campeoesFiltrados.map((item, idx) => (
          <CampeaoAnoCard key={idx} {...item} />
        ))}
      </div>

      <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">Melhores por Posição</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8 justify-center">
        {melhoresFiltrados.map((item, idx) => (
          <CampeaoPosicaoCard key={idx} {...item} />
        ))}
      </div>
    </div>
  );
}
