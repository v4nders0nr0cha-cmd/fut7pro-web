"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { Time } from "@/types/time";

interface Props {
  timesDisponiveis: Time[];
  timesSelecionados: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  maxTimes?: number;
  shake?: boolean; // NOVO: prop do pai para animar o aviso!
  loading?: boolean;
}

export default function SelecionarTimesDia({
  timesDisponiveis,
  timesSelecionados,
  onChange,
  disabled = false,
  maxTimes = 4,
  shake = false,
  loading = false,
}: Props) {
  const [verMais, setVerMais] = useState(false);

  const timesPrincipais = timesDisponiveis.slice(0, 4);
  const timesExtras = timesDisponiveis.slice(4);
  const hasTimes = timesDisponiveis.length > 0;

  // Bloqueia acima do limite, libera só para desmarcar
  function toggleTime(id: string) {
    if (disableAll || !hasTimes) return;
    const jaSelecionado = timesSelecionados.includes(id);
    if (jaSelecionado) {
      onChange(timesSelecionados.filter((tid) => tid !== id));
    } else {
      if (timesSelecionados.length < maxTimes) {
        onChange([...timesSelecionados, id]);
      }
    }
  }

  const limiteAlvo = Math.min(maxTimes, timesDisponiveis.length || maxTimes);
  const limiteExato = limiteAlvo > 0 ? timesSelecionados.length === limiteAlvo : false;
  const limiteAtingido = limiteAlvo > 0 ? timesSelecionados.length >= limiteAlvo : true;
  const faltamTimes = !loading && timesDisponiveis.length < maxTimes;
  const disableAll = disabled || loading;

  // Mensagem de aviso dinâmico
  const avisoTimes = loading
    ? "Carregando times do racha..."
    : !hasTimes
      ? "Cadastre os times do racha para habilitar o sorteio."
      : !limiteExato
        ? `Selecione exatamente ${limiteAlvo} time${limiteAlvo > 1 ? "s" : ""} para o racha.`
        : faltamTimes
          ? `Pronto! Voce selecionou os ${timesDisponiveis.length} time${
              timesDisponiveis.length === 1 ? "" : "s"
            } disponiveis.`
          : `Pronto! Voce selecionou todos os times necessarios.`;

  // Estado interno para shake, sincroniza quando o pai muda a prop "shake"
  const [avisoShake, setAvisoShake] = useState(false);

  useEffect(() => {
    if (shake) {
      setAvisoShake(true);
      const timer = setTimeout(() => setAvisoShake(false), 400);
      return () => clearTimeout(timer);
    }
  }, [shake]);

  const fadeClasses = disableAll
    ? "opacity-60 blur-[2px] pointer-events-none select-none transition-all duration-300"
    : "transition-all duration-300";

  return (
    <div className={`bg-[#202020] rounded-xl p-4 mb-6 ${fadeClasses}`}>
      <h2 className="text-lg font-bold text-yellow-400 mb-2 text-center">
        Selecione os Times do Dia
      </h2>
      <div className="flex flex-wrap gap-4 justify-center">
        {timesPrincipais.map((time) => {
          const checked = timesSelecionados.includes(time.id);
          const podeMarcar = checked || (!limiteAtingido && !disableAll);
          return (
            <button
              type="button"
              key={time.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all font-bold
                                ${
                                  checked
                                    ? "bg-yellow-100 border-yellow-400 text-black shadow-md"
                                    : !podeMarcar
                                      ? "bg-zinc-900 border-zinc-800 text-zinc-500 opacity-50 cursor-not-allowed"
                                      : "bg-zinc-800 border-zinc-700 text-white opacity-80 hover:opacity-100"
                                }`}
              onClick={() => podeMarcar && toggleTime(time.id)}
              disabled={disableAll || !podeMarcar}
              tabIndex={disableAll ? -1 : 0}
            >
              <Image src={time.logo} alt={`Logo do ${time.nome}`} width={32} height={32} />
              {time.nome}
              {checked && <span className="ml-1 text-green-500 text-lg">✔</span>}
            </button>
          );
        })}
        {timesExtras.length > 0 && (
          <button
            type="button"
            className="px-3 py-2 rounded-lg border border-yellow-400 bg-zinc-800 text-yellow-400 font-bold"
            onClick={() => !disableAll && setVerMais(true)}
            disabled={disableAll}
            tabIndex={disableAll ? -1 : 0}
          >
            Ver mais times
          </button>
        )}
      </div>
      {!loading && !hasTimes && (
        <p className="text-sm text-center text-gray-400 mt-2">
          Nenhum time cadastrado. Use &quot;Criar Times&quot; para adicionar e habilitar o sorteio.
        </p>
      )}
      {loading && <p className="text-sm text-center text-gray-400 mt-2">Carregando times...</p>}
      {/* Modal de times extras */}
      {verMais && !disableAll && (
        <div className="fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#202020] rounded-xl p-6 shadow-2xl min-w-[320px] max-w-[90vw]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-yellow-400">Outros Times Cadastrados</h3>
              <button
                className="text-yellow-400 text-2xl font-bold hover:text-yellow-500 px-2"
                onClick={() => setVerMais(false)}
              >
                ×
              </button>
            </div>
            <div className="flex flex-wrap gap-3 mb-2">
              {timesExtras.map((time) => {
                const checked = timesSelecionados.includes(time.id);
                const podeMarcar = checked || (!limiteAtingido && !disableAll);
                return (
                  <button
                    type="button"
                    key={time.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all font-bold
                                            ${
                                              checked
                                                ? "bg-yellow-100 border-yellow-400 text-black shadow-md"
                                                : !podeMarcar
                                                  ? "bg-zinc-900 border-zinc-800 text-zinc-500 opacity-50 cursor-not-allowed"
                                                  : "bg-zinc-800 border-zinc-700 text-white opacity-80 hover:opacity-100"
                                            }`}
                    onClick={() => podeMarcar && toggleTime(time.id)}
                    disabled={disableAll || !podeMarcar}
                  >
                    <Image src={time.logo} alt={`Logo do ${time.nome}`} width={28} height={28} />
                    {time.nome}
                    {checked && <span className="ml-1 text-green-500 text-lg">✔</span>}
                  </button>
                );
              })}
            </div>
            <button
              className="block mt-4 mx-auto bg-yellow-400 hover:bg-yellow-500 text-black rounded px-5 py-2 font-bold"
              onClick={() => setVerMais(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
      <div
        className={`text-xs mt-2 text-center font-bold transition-all duration-200 
                    ${avisoShake ? "animate-shake" : ""} 
                    ${limiteExato ? "text-green-500" : "text-red-400"}
                `}
      >
        {avisoTimes}
      </div>
    </div>
  );
}
