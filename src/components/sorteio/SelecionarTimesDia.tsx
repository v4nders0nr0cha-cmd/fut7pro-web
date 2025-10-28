"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import type { Time } from "@/types/time";

interface Props {
  timesDisponiveis: Time[];
  timesSelecionados: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  maxTimes?: number;
  shake?: boolean;
}

export default function SelecionarTimesDia({
  timesDisponiveis,
  timesSelecionados,
  onChange,
  disabled = false,
  maxTimes = 4,
  shake = false,
}: Props) {
  const [verMais, setVerMais] = useState(false);

  const [principais, extras] = useMemo(() => {
    const ordenados = [...timesDisponiveis].sort((a, b) => a.nome.localeCompare(b.nome));
    return [ordenados.slice(0, 4), ordenados.slice(4)];
  }, [timesDisponiveis]);

  const limiteExato = timesSelecionados.length === maxTimes;
  const limiteAtingido = timesSelecionados.length >= maxTimes;

  const avisoTimes = !limiteExato
    ? `Selecione exatamente ${maxTimes} time${maxTimes > 1 ? "s" : ""} para o racha.`
    : `Pronto! Voc� selecionou todos os times necess�rios.`;

  const [avisoShake, setAvisoShake] = useState(false);

  useEffect(() => {
    if (shake) {
      setAvisoShake(true);
      const timer = setTimeout(() => setAvisoShake(false), 400);
      return () => clearTimeout(timer);
    }
  }, [shake]);

  const toggleTime = (id: string) => {
    if (disabled) return;
    const selecionado = timesSelecionados.includes(id);
    if (selecionado) {
      onChange(timesSelecionados.filter((tid) => tid !== id));
    } else if (timesSelecionados.length < maxTimes) {
      onChange([...timesSelecionados, id]);
    }
  };

  const fadeClasses = disabled
    ? "opacity-60 blur-[2px] pointer-events-none select-none transition-all duration-300"
    : "transition-all duration-300";

  const renderBotaoTime = (time: Time) => {
    const checked = timesSelecionados.includes(time.id);
    const podeMarcar = checked || !limiteAtingido;
    return (
      <button
        type="button"
        key={time.id}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all font-bold ${
          checked
            ? "bg-yellow-100 border-yellow-400 text-black shadow-md"
            : !podeMarcar
              ? "bg-zinc-900 border-zinc-800 text-zinc-500 opacity-50 cursor-not-allowed"
              : "bg-zinc-800 border-zinc-700 text-white opacity-80 hover:opacity-100"
        }`}
        onClick={() => podeMarcar && toggleTime(time.id)}
        disabled={disabled || !podeMarcar}
        tabIndex={disabled ? -1 : 0}
      >
        <Image
          src={time.logo || "/images/times/time_padrao_01.png"}
          alt={`Logo do ${time.nome}`}
          width={32}
          height={32}
          className="rounded"
        />
        {time.nome}
        {checked && <span className="ml-1 text-green-500 text-lg">✓</span>}
      </button>
    );
  };

  return (
    <div className={`bg-[#202020] rounded-xl p-4 mb-6 ${fadeClasses}`}>
      <h2 className="text-lg font-bold text-yellow-400 mb-2 text-center">
        Selecione os Times do Dia
      </h2>
      {timesDisponiveis.length === 0 ? (
        <div className="text-center text-sm text-gray-400 py-4">
          Nenhum time cadastrado. Cadastre times antes de realizar o sorteio.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 justify-center">
            {principais.map(renderBotaoTime)}
            {extras.length > 0 && (
              <button
                type="button"
                className="px-3 py-2 rounded-lg border border-yellow-400 bg-zinc-800 text-yellow-400 font-bold"
                onClick={() => !disabled && setVerMais(true)}
                disabled={disabled}
                tabIndex={disabled ? -1 : 0}
              >
                Ver mais times
              </button>
            )}
          </div>

          {verMais && !disabled && (
            <div className="fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center bg-black bg-opacity-60">
              <div className="bg-[#202020] rounded-xl p-6 shadow-2xl min-w-[320px] max-w-[90vw]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-yellow-400">Outros Times Cadastrados</h3>
                  <button
                    className="text-yellow-400 text-2xl font-bold hover:text-yellow-500 px-2"
                    onClick={() => setVerMais(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="flex flex-wrap gap-3 mb-2">{extras.map(renderBotaoTime)}</div>
                <button
                  className="block mt-4 mx-auto bg-yellow-400 hover:bg-yellow-500 text-black rounded px-5 py-2 font-bold"
                  onClick={() => setVerMais(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <div
        className={`text-xs mt-2 text-center font-bold transition-all duration-200 ${
          avisoShake ? "animate-shake" : ""
        } ${limiteExato ? "text-green-500" : "text-red-400"}`}
      >
        {avisoTimes}
      </div>
    </div>
  );
}
