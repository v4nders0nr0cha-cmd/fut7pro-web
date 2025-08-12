"use client";

import Head from "next/head";
import { FaRandom } from "react-icons/fa";
import { useTimes } from "@/hooks/useTimes";
import { rachaConfig } from "@/config/racha.config";
import Image from "next/image";
import { useState } from "react";

export default function SorteioInteligentePage() {
  const rachaId = rachaConfig.slug;
  const { times } = useTimes(rachaId);
  const [timesSelecionados, setTimesSelecionados] = useState<string[]>([]);

  const toggleTime = (timeId: string) => {
    setTimesSelecionados((prev) =>
      prev.includes(timeId) ? prev.filter((id) => id !== timeId) : [...prev, timeId]
    );
  };

  return (
    <>
      <Head>
        <title>Sorteio Inteligente | Fut7Pro Admin</title>
        <meta
          name="description"
          content="Crie rodadas modernas com sorteio inteligente: times balanceados, horários automáticos e tabela pronta. Experiência premium para rachas competitivos no Fut7Pro."
        />
        <meta
          name="keywords"
          content="sorteio inteligente, criar rodada, fut7, racha, painel admin, balanceamento, tabela automática"
        />
      </Head>

      <main className="max-w-4xl mx-auto px-4 pt-20 pb-24 md:pt-6 md:pb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-5 flex items-center gap-3">
          <FaRandom className="text-yellow-400" /> Sorteio Inteligente
        </h1>
        <p className="text-base text-neutral-300 mb-8">
          Monte rodadas automaticamente com times balanceados, organização de horários e tabela
          pronta em segundos.
          <br />
          Escolha os jogadores, defina regras de sorteio e deixe o sistema fazer todo o trabalho
          pesado.{" "}
          <span className="font-bold text-cyan-400">Recomendado para experiência premium!</span>
        </p>

        {/* Seleção de Times */}
        <div className="bg-neutral-900 border-2 border-yellow-500 rounded-2xl p-6 mb-8 shadow-lg">
          <h2 className="text-lg font-semibold text-yellow-400 mb-4">Selecione os Times do Dia</h2>
          {times.length === 0 ? (
            <p className="text-gray-400">
              Nenhum time cadastrado. Vá até <strong>"Criar Times"</strong> para adicionar seus
              times antes do sorteio.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {times.map((time) => (
                <button
                  key={time.id}
                  onClick={() => toggleTime(time.id)}
                  className={`flex flex-col items-center p-3 rounded-lg border transition ${
                    timesSelecionados.includes(time.id)
                      ? "border-yellow-400 bg-yellow-400/10"
                      : "border-gray-700 bg-[#1a1a1a] hover:border-yellow-300"
                  }`}
                >
                  <Image
                    src={time.logo}
                    alt={time.nome}
                    width={50}
                    height={50}
                    className="rounded mb-2"
                  />
                  <span className="text-white text-sm font-semibold">{time.nome}</span>
                  <span
                    className="w-4 h-4 rounded-full border mt-1"
                    style={{ backgroundColor: time.cor }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botão de Sorteio */}
        <div className="bg-neutral-900 border-2 border-cyan-500 rounded-2xl p-6 mb-8 shadow-lg">
          <h2 className="text-lg font-semibold text-cyan-300 mb-2">Comece seu sorteio</h2>
          <p className="text-sm text-neutral-300 mb-4">
            Selecione os times cadastrados, configure os critérios de balanceamento (ranking,
            presença, estrelas etc.) e clique no botão abaixo para gerar os times e horários
            automaticamente.
          </p>
          <button
            className="bg-cyan-400 text-black font-bold px-6 py-2 rounded-xl hover:bg-cyan-500 transition disabled:opacity-50"
            onClick={() => {
              if (process.env.NODE_ENV === "development") {
                console.log("Sorteio iniciado com times:", timesSelecionados);
              }
            }}
            disabled={timesSelecionados.length < 2}
            type="button"
          >
            Iniciar Sorteio Inteligente
          </button>
        </div>

        {/* Importar planilha - recurso avançado */}
        <div className="bg-neutral-900 border-2 border-yellow-600 rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-yellow-400 mb-2">
            Importar Partidas via Planilha
          </h2>
          <p className="text-sm text-neutral-300 mb-4">
            Prefere preparar tudo fora do sistema? Importe várias partidas em lote utilizando nosso
            modelo de planilha.
          </p>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <button
              className="bg-yellow-400 text-black font-bold px-6 py-2 rounded-xl hover:bg-yellow-500 transition"
              onClick={() => alert("Em breve: Importação de planilhas")}
              type="button"
            >
              Importar Planilha
            </button>
            <a
              href="/modelo_importacao_fut7pro.xlsx"
              className="text-yellow-400 underline hover:text-yellow-300 text-sm"
              download
            >
              Baixar modelo Excel
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
