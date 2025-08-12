"use client";
import { useState } from "react";
import { FaLightbulb, FaChevronDown, FaCalculator } from "react-icons/fa";
import { rachaConfig } from "@/config/racha.config";

export default function ManualArrecadacao() {
  const [mostrar, setMostrar] = useState(false);

  // Simulador rápido (mock)
  const [jogadores, setJogadores] = useState(20);
  const [patrocinadores, setPatrocinadores] = useState(3);
  const [valorDiaria, setValorDiaria] = useState(12);
  const [valorPatrocinio, setValorPatrocinio] = useState(50);

  const receitaDiarias = jogadores * valorDiaria * 4; // 4 jogos mês
  const receitaPatro = patrocinadores * valorPatrocinio;
  const total = receitaDiarias + receitaPatro;

  return (
    <div className="mt-6 mb-8 bg-neutral-900 border border-neutral-700 rounded-xl p-4">
      <button
        className="flex items-center gap-2 text-yellow-400 font-semibold mb-2"
        onClick={() => setMostrar((v) => !v)}
        aria-expanded={mostrar}
      >
        <FaLightbulb /> Manual: Como Arrecadar Mais?{" "}
        <FaChevronDown className={`transition-transform ${mostrar ? "rotate-180" : ""}`} />
      </button>
      {mostrar && (
        <div>
          <div className="mb-3 text-xs sm:text-sm text-gray-300">
            <p>
              <b>Formas de arrecadação:</b> Diárias dos atletas, mensalidades antecipadas,
              patrocínios (até 10 cotas), rifas, eventos especiais e venda de camisas. Cobrar
              patrocínio de empresas locais pode render até R$500/mês. Use o potencial do{" "}
              {rachaConfig.nome}!
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li>Cobre até 10 patrocinadores com cotas a partir de R$50 cada;</li>
              <li>Incentive atletas a pagarem como mensalistas para garantir receita fixa;</li>
              <li>Promova rifas e eventos para aumentar o caixa do racha;</li>
              <li>Utilize banners no site para mostrar os patrocinadores;</li>
            </ul>
          </div>
          <div className="bg-neutral-800 p-3 rounded-lg mt-3 flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div>
              <div className="mb-1 font-semibold text-gray-200">Simule sua arrecadação mensal:</div>
              <div className="flex gap-2 items-center mb-1">
                <span>Atletas:</span>
                <input
                  type="number"
                  className="w-16 p-1 rounded bg-neutral-900 border border-neutral-700 text-white"
                  min={5}
                  max={50}
                  value={jogadores}
                  onChange={(e) => setJogadores(Number(e.target.value))}
                />
                <span>Patrocinadores:</span>
                <input
                  type="number"
                  className="w-16 p-1 rounded bg-neutral-900 border border-neutral-700 text-white"
                  min={0}
                  max={10}
                  value={patrocinadores}
                  onChange={(e) => setPatrocinadores(Number(e.target.value))}
                />
              </div>
              <div className="flex gap-2 items-center mb-1">
                <span>Valor Diária:</span>
                <input
                  type="number"
                  className="w-16 p-1 rounded bg-neutral-900 border border-neutral-700 text-white"
                  min={5}
                  max={50}
                  value={valorDiaria}
                  onChange={(e) => setValorDiaria(Number(e.target.value))}
                />
                <span>Valor Patrocínio:</span>
                <input
                  type="number"
                  className="w-16 p-1 rounded bg-neutral-900 border border-neutral-700 text-white"
                  min={10}
                  max={200}
                  value={valorPatrocinio}
                  onChange={(e) => setValorPatrocinio(Number(e.target.value))}
                />
              </div>
              <div className="flex gap-2 items-center mt-2">
                <FaCalculator />
                <span className="font-bold text-green-400">
                  Receita mensal estimada: R${" "}
                  {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-gray-500">
            Dica: use esses números para definir metas e negociar com patrocinadores! Se precisar de
            ajuda para aumentar a arrecadação,{" "}
            <a href={`mailto:${rachaConfig.urls.suporte}`} className="text-yellow-400 underline">
              fale conosco
            </a>
            .
          </div>
        </div>
      )}
    </div>
  );
}
